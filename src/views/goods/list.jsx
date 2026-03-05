import { useState, useEffect } from 'react';
import { App, Form, Flex, Card, Button, Input, Popconfirm, Table, Typography, Modal, Avatar, InputNumber, Select, Descriptions, Divider, Pagination, Image, Upload } from 'antd';
import { getGoodsApi, addGoodsApi, editGoodsApi, deleteGoodsApi, getCategoryApi, uploadGoodsImgApi } from '../../api/goodsApi';
import { timeToDate, numToTime } from '../../utils/time';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { baseURL } from '../../utils/service';
import s from '../../styles/layout.module.scss'
import ImgCrop from 'antd-img-crop';

// 将文件转换为Base64格式，供图片预览使用
const getBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

export default function goods() {
    // ******************初始化变量、Hooks******************
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
    // 图片预览相关
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [file, setFile] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [fileUrl, setFileUrl] = useState(null);

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
    // ========== 图片上传相关 ==============
    // 清除图片缓存
    const clearFileCache = () => {
        setFile(null);
        setFileList([]);
        setFileUrl(null);
        setPreviewImage('');
    };
    // 文件上传监听，上传成功后调用修改头像接口并更新用户信息
    useEffect(() => {
        const uploadAvatar = async () => {
            if (file) {
                try {
                    // 上传图片
                    const formData = new FormData();
                    formData.append('file', file);
                    const uploadRes = await uploadGoodsImgApi(formData);
                    if (uploadRes.code) {
                        message.error(`上传图片失败: ${uploadRes.msg}`);
                        return;
                    }
                    const filename = uploadRes.imgUrl ? uploadRes.imgUrl.split('/').pop() : uploadRes.imgUrl; // 按路径分割，取最后一部分作为文件名
                    setFileUrl(filename);
                } catch (e) {
                    setFileList([{ ...fileList[0], status: 'error' }]);
                    message.error('上传图片失败');
                    console.error('上传图片失败:', e);
                }
            }
        };
        uploadAvatar();
    }, [file]);

    // 图片预览
    const handlePreview = async file => {
        let src = file.url;
        if (!src) {
            src = await new Promise(resolve => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
    };

    // 图片上传变化
    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

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
            imgUrl: fileUrl || 'imgUrl',
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
        clearFileCache();
    };

    const cancelAdd = () => {
        form.resetFields();
        clearFileCache();
        setAddDia(false);
    };

    // =========== 编辑商品 ==============
    // 可操作列
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
                        {dataIndex === 'price' ? <InputNumber style={{ width: '100%' }} prefix="¥" className={s.input} step="0.01" precision={2} /> :
                            dataIndex === 'imgUrl' ? <>
                                <ImgCrop rotationSlider>
                                    <Upload
                                        beforeUpload={file => {
                                            setFile(file);
                                            return false;
                                        }}
                                        listType="picture-card"
                                        fileList={fileList}
                                        onPreview={handlePreview}
                                        onChange={handleChange}
                                    >
                                        {fileList.length >= 1 ? null : uploadButton}
                                    </Upload>
                                </ImgCrop>
                                {previewImage && (
                                    <Image
                                        styles={{ root: { display: 'none' } }}
                                        preview={{
                                            open: previewOpen,
                                            onOpenChange: visible => setPreviewOpen(visible),
                                            afterOpenChange: visible => !visible && setPreviewImage(''),
                                        }}
                                        src={previewImage}
                                    />
                                )}
                            </> :
                                dataIndex === 'category' ? <Select className={s.selectRoot}
                                    classNames={{
                                        popup: {
                                            root: s.selectPopup,
                                            listItem: s.selectListItem
                                        }
                                    }}
                                    placeholder="请选择分类" options={categoriesData} /> : <Input className={s.input} />}
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        );
    };
    // 打开编辑商品
    const edit = record => {
        clearFileCache(); // 取消编辑时清除图片缓存
        setFileList([{
            uid: '-1',
            name: 'currentImg',
            status: 'done',
            url: `${baseURL}${record.imgUrl}`,
        }]);
        form.setFieldsValue({
            name: record.name,
            price: record.price,
            imgUrl: `${baseURL}${record.imgUrl}`,
            goodsDesc: record.goodsDesc,
            category: record.category
        });
        setEditingKey(record.key);
    };
    const cancel = () => {
        setEditingKey('');
        clearFileCache(); // 取消编辑时清除图片缓存
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
                imgUrl: `${fileUrl || item.imgUrl.split('/').pop()}`,
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
        clearFileCache(); // 取消编辑时清除图片缓存
        form.resetFields(); // 重置表单
        message.success('商品修改成功');
        getTableData(); // 刷新列表数据
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
            render: (imgUrl) => <Avatar shape="square" src={`${baseURL}${imgUrl}`} alt="avatar" size="large" draggable={false} />
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
                        <Popconfirm title="确定取消吗?" onConfirm={cancel} okText="确定" cancelText="取消"
                            classNames={{ container: s.popconfirmRoot, title: s.popconfirmTitle, content: s.popconfirmContent }}>
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
                            classNames={{ container: s.popconfirmRoot, title: s.popconfirmTitle, content: s.popconfirmContent }}
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

    return <Card classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle }} variant="borderless" style={{ width: '100%' }}>
        <Flex vertical justify="center" align="center" style={{ width: '100%' }} gap="small" >
            <Flex justify="end" align="center" style={{ width: '100%' }} gap="small" >
                <Button className={s.cardRoot} color="cyan" variant="outlined" disabled={editingKey !== ''} onClick={() => setAddDia(true)}>
                    添加商品
                </Button>
            </Flex>
            <Form form={form} component={false}>
                <Table
                    classNames={{ root: s.tableRoot, header: { cell: s.tableHeader }, body: { cell: s.tableBody } }}
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
                    classNames={{
                        item: s.paginationItem
                    }}
                    className={s.pagination}
                />
            </Flex>
        </Flex>
        {/* 添加 */}
        <Modal
            title="添加商品"
            open={addDia}
            footer={null}
            onCancel={cancelAdd}
            destroyOnHidden={true}
            mask={{ blur: false }}
            classNames={{
                container: s.modalContainer,
                header: s.modalHeader,
                title: s.modalTitle,
                body: s.modalBody,
                footer: s.modalFooter
            }}
        >
            <Form
                form={form}
                name="addForm"
                onFinish={addGoods}
                layout="vertical"
                autoComplete="off"
                requiredMark={false}
                style={{ padding: '10px', width: '100%' }}
                classNames={{
                    label: s.formLabel
                }}
            >
                <Form.Item
                    label="商品图片"
                    name="imgUrl"
                    prefix={<FilterOutlined />}
                >
                    <ImgCrop rotationSlider>
                        <Upload
                            beforeUpload={file => {
                                setFile(file);
                                return false;
                            }}
                            listType="picture-card"
                            fileList={fileList}
                            onPreview={handlePreview}
                            onChange={handleChange}
                        >
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                    </ImgCrop>
                    {previewImage && (
                        <Image
                            styles={{ root: { display: 'none' } }}
                            preview={{
                                open: previewOpen,
                                onOpenChange: visible => setPreviewOpen(visible),
                                afterOpenChange: visible => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                        />
                    )}
                </Form.Item>

                <Form.Item
                    label="商品名"
                    name="name"
                    rules={[{ required: true, message: '请输入商品名!' }]}
                    prefix={<FilterOutlined />}
                >
                    <Input className={s.input} allowClear placeholder="请输入商品名" />
                </Form.Item>

                <Form.Item
                    label="商品分类"
                    name="category"
                    rules={[{ required: true, message: '请选择商品分类!' }]}
                    prefix={<FilterOutlined />}
                >
                    <Select className={s.selectRoot} classNames={{
                        popup: {
                            root: s.selectPopup,
                            listItem: s.selectListItem
                        }
                    }} placeholder="请选择分类" options={categoriesData} />
                </Form.Item>

                <Form.Item
                    label="商品描述"
                    name="description"
                    rules={[{ required: true, message: '请输入商品描述!' }]}
                    prefix={<FilterOutlined />}
                >
                    <Input.TextArea className={s.input} rows={4} style={{ width: '100%' }} allowClear placeholder="请输入商品描述" />
                </Form.Item>

                <Form.Item label="单价" name="price" rules={[{ required: true, message: '请输入单价!' }]}>
                    <InputNumber className={s.input} prefix="￥" step="0.01" precision={2} style={{ width: '100%' }} />
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
            classNames={{
                container: s.modalContainer,
                header: s.modalHeader,
                title: s.modalTitle,
                body: s.modalBody,
                footer: s.modalFooter
            }}
        >
            <Flex direction="column" wrap gap="medium" >
                <Divider classNames={{ root: s.dividerRoot, rail: s.divider, content: s.divider }} orientation="left">基本信息</Divider>
                <Descriptions classNames={{ root: s.descRoot, label: s.descLabel, content: s.descContent }} column={2} style={{ width: '100%' }} bordered items={[
                    {
                        key: '0',
                        label: '商品图片',
                        children: <Avatar shape="square" src={`${baseURL}${rowInfo.imgUrl}`} alt="avatar" size="large" draggable={false} />,
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
                <Divider classNames={{ root: s.dividerRoot, rail: s.divider, content: s.divider }} orientation="left">详细信息</Divider>
                <Descriptions classNames={{ root: s.descRoot, label: s.descLabel, content: s.descContent }} column={2} style={{ width: '100%' }} bordered items={[
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
                <Divider classNames={{ root: s.dividerRoot, rail: s.divider, content: s.divider }} orientation="left">评价信息</Divider>
                <Flex direction="column" wrap gap="small" style={{ maxHeight: 200, overflowY: 'auto' }} >
                    {rowInfo.ratings && rowInfo.ratings.length > 0 ? rowInfo.ratings.map((item, index) => (
                        <>
                            <Flex justify="between" align="center" gap="small" style={{ width: '100%' }} >
                                <Avatar src={`${baseURL}${item.avatar}`} alt="avatar" size="large" draggable={false} />
                                <Flex gap="large">
                                    <Typography.Text className={s.cardTitle} strong>{item.username}</Typography.Text>
                                    <Typography.Text className={s.cardGary} style={{ flex: 1 }}>{numToTime(item.rateTime)}</Typography.Text>
                                    <Typography.Text className={s.cardTitle} strong>{item.rateType ? '好评：' : '差评：'}</Typography.Text>
                                </Flex>
                                <Typography.Text className={s.cardTitle} style={{ overflow: 'hidden' }}>{item.text || '无'}</Typography.Text>
                            </Flex >
                            <Divider classNames={{ root: s.dividerRoot, rail: s.divider, content: s.divider }} size="small" />
                        </>
                    )) : <span>暂无评价信息</span>}
                </Flex>
            </Flex>
        </Modal>
    </Card >
}
