import { useState, useEffect } from 'react';
import { App, Form, Flex, Card, Button, Input, Popconfirm, Table, Typography, Modal, Avatar, InputNumber, Select, Descriptions, Divider, Pagination } from 'antd';
import { getGoodsApi, addGoodsApi, editGoodsApi, deleteGoodsApi, getCategoryApi } from '../../api/goodsApi';
import { timeToDate, numToTime } from '../../utils/time';
import { FilterOutlined } from '@ant-design/icons';

export default function goods() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [data, setData] = useState([]);
    const [categoriesData, setCategoriesData] = useState([]);
    const [editingKey, setEditingKey] = useState('');
    const isEditing = record => record.key === editingKey;
    const [addDia, setAddDia] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [infoDia, setInfoDia] = useState(false);
    const [rowInfo, setRowInfo] = useState({});

    // 表单提交按钮
    const SubmitButton = ({ form, children, loading }) => {
        const [submittable, setSubmittable] = useState(false);
        // Watch all values
        const values = Form.useWatch([], form);
        useEffect(() => {
            form
                .validateFields({ validateOnly: true })
                .then(() => setSubmittable(true))
                .catch(() => setSubmittable(false));
        }, [form, values]);
        return (
            <Button type="primary" htmlType="submit" disabled={!submittable} loading={loading}>
                {children}
            </Button>
        );
    };

    // =========== 获取列表 ==============
    const getTableData = async () => {
        setPageLoading(true);
        const res = await getGoodsApi({
            pageSize,
            currentPage
        });
        if (res.data && res.data.length === 0) {
            setData([]);
            setTotal(0);
            setPageLoading(false);
            return message.error('获取商品列表失败');
        }
        const newData = res.data.map(item => ({
            key: item.id,
            ...item,
            ratings: JSON.parse(item.ratings),
            ctime: timeToDate(item.ctime)
        }));
        setData([...newData]);
        setTotal(res.total);
        setConfirmLoading(false);
        setPageLoading(false);

        // 同步获取最新的分类名
        const categoryRes = await getCategoryApi();
        if (categoryRes.code) {
            return message.error(`获取商品分类失败: ${categoryRes.msg}`);
        }
        // 析出分类名并去重
        const categoriesName = []
        categoryRes.categories.map(item => item.cateName).forEach(i => i && !categoriesName.includes(i) && categoriesName.push(i));

        // 构造分类下拉选项
        const categoriesOpt = [];
        categoriesName.forEach(i => categoriesOpt.push({ value: i, label: i }))
        setCategoriesData(categoriesOpt);
    }

    useEffect(() => {
        getTableData();
    }, [pageSize, currentPage]);

    // =========== 查看详情 ==============
    const info = (record) => {
        setRowInfo(record);
        setInfoDia(true);
    }

    const closeInfo = () => {
        setRowInfo({});
        setInfoDia(false);
    }

    // =========== 添加商品 ==============
    // 添加商品接口
    const addGoods = async (values) => {
        setConfirmLoading(true);
        const res = await addGoodsApi({
            name: values.name,
            category: values.category,
            goodsDesc: values.description,
            imgUrl: values.imgUrl || 'imgUrl',
            price: values.price,
        });
        if (res.code) {
            setConfirmLoading(false);
            message.error(`添加商品失败: ${res.msg}`);
            return;
        }
        message.success('商品已添加');
        getTableData();
        form.resetFields();
        setAddDia(false);
    };

    // =========== 编辑商品 ==============
    const EditableCell = ({
        editing,
        dataIndex,
        title,
        inputType,
        record,
        index,
        children,
        ...restProps
    }) => {
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item
                        name={dataIndex}
                        style={{ margin: 0 }}
                        rules={[
                            {
                                required: true,
                                message: `请输入${title}!`,
                            },
                        ]}
                    >
                        {dataIndex === 'price' ? <InputNumber step="0.01" precision={2} /> :
                            dataIndex === 'imgUrl' ? <>{/* TODO:上传图片预留 */}</> :
                                dataIndex === 'category' ? <Select placeholder="请选择分类" options={categoriesData} /> : <Input />}
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        );
    };
    // 打开编辑商品
    const edit = record => {
        form.setFieldsValue({
            name: record.name,
            price: record.price,
            imgUrl: record.imgUrl,
            goodsDesc: record.goodsDesc,
            category: record.category
        });
        setEditingKey(record.key);
    };
    const cancel = () => {
        setEditingKey('');
        form.resetFields(); // 重置表单
    };
    // 保存编辑
    const save = async key => {
        const row = await form.validateFields();
        const newData = [...data];
        const index = newData.findIndex(item => key === item.key);
        if (index > -1) {
            const item = newData[index];
            const res = await editGoodsApi({
                id: item.key,
                name: row.name,
                price: row.price,
                imgUrl: row.imgUrl,
                goodsDesc: row.goodsDesc,
                category: row.category,
            });
            if (res.code) {
                message.error(`修改商品失败: ${res.msg}`);
                return;
            }
            newData.splice(index, 1, {
                ...item,
                ...row,
            });
            setData(newData);
            setEditingKey('');
        } else {
            newData.push(row);
            setData(newData);
            setEditingKey('');
        }
        form.resetFields(); // 重置表单
        message.success('商品修改成功');
    };

    // ================ 删除商品 ==============
    // 删除商品接口
    const deleteGoods = async (key) => {
        const res = await deleteGoodsApi({ id: key });
        if (res.code) {
            message.error(`删除商品失败: ${res.msg}`);
            return;
        }
        message.success('商品已删除');
        getTableData();
    };

    // ================ 表格列 ==============
    // 表格列
    const columns = [
        {
            title: '商品名',
            dataIndex: 'name',
            editable: true,
            width: 200,
        },
        {
            title: '商品分类',
            dataIndex: 'category',
            editable: true,
            render: (category) => category || '未分类',
        },
        {
            title: '商品图',
            dataIndex: 'imgUrl',
            editable: true,
            render: (imgUrl) => <Avatar shape="square" src={imgUrl} alt="avatar" size="large" draggable={false} />
        },
        {
            title: '商品描述',
            dataIndex: 'goodsDesc',
            editable: true,
            width: 300,
        },
        {
            title: '单价(元)',
            dataIndex: 'price',
            editable: true,
            render: (price) => price.toFixed(2),
        },
        {
            title: '操作',
            dataIndex: 'operation',
            fixed: 'end',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Button type='link' onClick={() => save(record.key)} style={{ marginInlineEnd: 8 }}>
                            保存
                        </Button>
                        <Popconfirm title="确定取消吗?" onConfirm={cancel} okText="确定" cancelText="取消">
                            <a>取消</a>
                        </Popconfirm>
                    </span>
                ) : (
                    <Flex gap="small">
                        <Button variant="solid" disabled={editingKey !== ''} onClick={() => info(record)}>
                            详情
                        </Button>
                        <Button variant="solid" color='primary' disabled={editingKey !== ''} onClick={() => edit(record)}>
                            编辑
                        </Button>
                        <Popconfirm
                            title="警告"
                            description="确定要删除该商品吗？此操作不可撤销！"
                            onConfirm={() => deleteGoods(record.key)}
                            onCancel={null}
                            okText="确认"
                            okType="danger"
                            cancelText="取消"
                        >
                            <Button color="danger" variant="solid" disabled={editingKey !== ''} >删除</Button>
                        </Popconfirm>
                    </Flex>
                );
            },
        },
    ];
    // 修改可编辑列
    const mergedColumns = columns.map(col => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: record => ({
                record,
                inputType: 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return <Card variant="borderless" style={{ width: '100%' }
    } >
        <Flex vertical justify="center" align="center" style={{ width: '100%' }} gap="small" >
            <Flex justify="end" align="center" style={{ width: '100%' }} gap="small" >
                <Button color="cyan" variant="outlined" disabled={editingKey !== ''} onClick={() => setAddDia(true)}>
                    添加商品
                </Button>
            </Flex>
            <Form form={form} component={false}>
                <Table
                    components={{
                        body: { cell: EditableCell },
                    }}
                    bordered
                    dataSource={data}
                    columns={mergedColumns}
                    rowClassName="editable-row"
                    loading={pageLoading}
                    scroll={{ y: 55 * 8, x: 'max-content' }}
                    pagination={false} />
            </Form>
            <Flex justify="center" align="center" style={{ width: '100%' }} >
                <Pagination
                    total={total}
                    showTotal={total => `共 ${total} 条`}
                    pageSize={pageSize}
                    current={currentPage}
                    showSizeChanger
                    pageSizeOptions={['10', '20', '50']}
                    showQuickJumper
                    onChange={(page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    }}
                    onShowSizeChange={(current, size) => {
                        setCurrentPage(1);
                        setPageSize(size);
                    }}
                />
            </Flex>
        </Flex>
        {/* 添加 */}
        <Modal
            title="添加商品"
            open={addDia}
            footer={null}
            onCancel={() => setAddDia(false)}
            destroyOnHidden={true}
            mask={{ blur: false }}
        >
            <Form
                form={form}
                name="addForm"
                onFinish={addGoods}
                layout="vertical"
                autoComplete="off"
                requiredMark={false}
                style={{ padding: '10px', width: '100%' }}
            >
                <Form.Item
                    label="商品图片"
                    name="imgUrl"
                    prefix={<FilterOutlined />}
                >
                    <Input defaultValue={'当前未启用上传图片功能'} disabled placeholder="请输入商品图片" />
                </Form.Item>

                <Form.Item
                    label="商品名"
                    name="name"
                    rules={[{ required: true, message: '请输入商品名!' }]}
                    prefix={<FilterOutlined />}
                >
                    <Input allowClear placeholder="请输入商品名" />
                </Form.Item>

                <Form.Item
                    label="商品分类"
                    name="category"
                    rules={[{ required: true, message: '请选择商品分类!' }]}
                    prefix={<FilterOutlined />}
                >
                    <Select placeholder="请选择分类" options={categoriesData} />
                </Form.Item>

                <Form.Item
                    label="商品描述"
                    name="description"
                    rules={[{ required: true, message: '请输入商品描述!' }]}
                    prefix={<FilterOutlined />}
                >
                    <Input.TextArea rows={4} style={{ width: '100%' }} allowClear placeholder="请输入商品描述" />
                </Form.Item>

                <Form.Item label="单价" name="price" rules={[{ required: true, message: '请输入单价!' }]}>
                    <InputNumber prefix="￥" step="0.01" precision={2} style={{ width: '100%' }} />
                </Form.Item>
                <Flex justify="end" align="center" style={{ width: '100%' }} >
                    <SubmitButton form={form} loading={confirmLoading}>
                        添加商品
                    </SubmitButton>
                </Flex>
            </Form>
        </Modal >
        {/* 详情 */}
        <Modal
            title="商品详情"
            open={infoDia}
            footer={null}
            onCancel={closeInfo}
            destroyOnHidden={true}
            width={650}
            centered
            mask={{ blur: false }}
        >
            <Flex direction="column" wrap gap="medium" >
                <Divider orientation="left">基本信息</Divider>
                <Descriptions column={2} style={{ width: '100%' }} bordered items={[
                    {
                        key: '0',
                        label: '商品图片',
                        children: <Avatar shape="square" src={rowInfo.imgUrl} alt="avatar" size="large" draggable={false} />,
                    },
                    {
                        key: '1',
                        label: '商品ID',
                        children: rowInfo.id,
                    },
                    {
                        key: '2',
                        label: '商品名称',
                        children: rowInfo.name,
                    },
                    {
                        key: '3',
                        label: '创建时间',
                        children: rowInfo.ctime,
                    }
                ]} />
                <Divider orientation="left">详细信息</Divider>
                <Descriptions column={2} style={{ width: '100%' }} bordered items={[
                    {
                        key: '1',
                        label: '商品分类',
                        children: rowInfo.category || '未分类',
                    },
                    {
                        key: '2',
                        label: '商品描述',
                        children: rowInfo.goodsDesc || '无描述',
                    },
                    {
                        key: '3',
                        label: '商品价格',
                        children: '￥' + rowInfo.price?.toFixed(2),
                    },
                    {
                        key: '4',
                        label: '好评率',
                        children: rowInfo.rating ? `${rowInfo.rating} %` : '暂无评分',
                    },
                ]} />
                <Divider orientation="left">评价信息</Divider>
                <Flex direction="column" wrap gap="small" style={{ maxHeight: 200, overflowY: 'auto' }} >
                    {rowInfo.ratings && rowInfo.ratings.length > 0 ? rowInfo.ratings.map((item, index) => (
                        <>
                            <Flex justify="between" align="center" gap="small" style={{ width: '100%' }} >
                                <Avatar src={item.avatar} alt="avatar" size="large" draggable={false} />
                                <Flex gap="large">
                                    <Typography.Text strong>{item.username}</Typography.Text>
                                    <Typography.Text style={{ flex: 1 }} type="secondary">{numToTime(item.rateTime)}</Typography.Text>
                                    <Typography.Text strong>{item.rateType ? '好评：' : '差评：'}</Typography.Text>
                                </Flex>
                                <Typography.Text style={{ overflow: 'hidden' }}>{item.text || '无评论内容'}</Typography.Text>
                            </Flex >
                            <Divider size="small" />
                        </>
                    )) : <span>暂无评价信息</span>}
                </Flex>
            </Flex>
        </Modal>
    </Card >
}
