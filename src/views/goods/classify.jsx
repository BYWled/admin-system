import { useState, useEffect } from 'react';
import { App, Form, Flex, Card, Button, Input, Popconfirm, Table, Modal, Radio, Pagination, Tag } from 'antd';
import { getClassifyApi, addClassifyApi, editClassifyApi, deleteClassifyApi } from '../../api/classifyApi';
import { FilterOutlined } from '@ant-design/icons';
import s from '../../styles/layout.module.scss'

export default function classify() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [data, setData] = useState([]);
    const [editingKey, setEditingKey] = useState('');
    const isEditing = record => record.key === editingKey;
    const [addDia, setAddDia] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

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
        const res = await getClassifyApi({
            pageSize,
            currentPage
        });
        if (res.data && res.data.length === 0) {
            setData([]);
            setTotal(0);
            setPageLoading(false);
            return message.error('获取分类列表失败');
        }
        const newData = res.data.map(item => ({
            key: item.id,
            ...item
        }));
        setData([...newData]);
        setTotal(res.total);
        setConfirmLoading(false);
        setPageLoading(false);
    }

    useEffect(() => {
        getTableData();
    }, [pageSize, currentPage]);
    // =========== 添加分类 ==============
    // 添加分类接口
    const addClassify = async (values) => {
        setConfirmLoading(true);
        const res = await addClassifyApi({
            cateName: values.cateName,
            state: values.state,
        });
        if (res.code) {
            setConfirmLoading(false);
            message.error(`添加分类失败: ${res.msg}`);
            return;
        }
        message.success('分类已添加');
        getTableData();
        form.resetFields();
        setAddDia(false);
    }

    // =========== 编辑分类 ==============
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
        const inputNode = dataIndex === 'state' ? <Radio.Group options={[
            { label: '启用', value: '启用' },
            { label: '禁用', value: '禁用' },
        ]} defaultValue="启用" optionType="button" /> : <Input className={s.input} />;
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
                        {inputNode}
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        );
    };
    // 打开编辑分类
    const edit = record => {
        form.setFieldsValue({ cateName: record.cateName, state: record.state === 1 ? '启用' : '禁用' });
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
            const res = await editClassifyApi({
                id: item.key,
                cateName: row.cateName,
                state: row.state === '启用' ? 1 : 0,
            });
            if (res.code) {
                message.error(`修改分类失败: ${res.msg}`);
                return;
            }
            newData.splice(index, 1, {
                ...item,
                ...row,
                state: row.state === '启用' ? 1 : 0,
            });
            setData(newData);
            setEditingKey('');
        } else {
            newData.push(row);
            setData(newData);
            setEditingKey('');
        }
        form.resetFields(); // 重置表单
        message.success('分类修改成功');
    };

    // ================ 删除分类 ==============
    // 删除分类接口
    const deleteClassify = async (key) => {
        const res = await deleteClassifyApi({ id: key });
        if (res.code) {
            message.error(`删除分类失败: ${res.msg}`);
            return;
        }
        message.success('分类已删除');
        getTableData();
    };

    // ================ 表格列 ==============
    // 表格列
    const columns = [
        {
            title: '分类ID',
            dataIndex: 'key',
        },
        {
            title: '分类名',
            dataIndex: 'cateName',
            editable: true,
        },
        {
            title: '状态',
            dataIndex: 'state',
            editable: true,
            render: (state) => state === 1 ? <Tag color='green' variant='outlined'>
                启用
            </Tag> : <Tag color='red' variant='outlined'>
                禁用
            </Tag>,
        },
        {
            title: '操作',
            width: '15%',
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
                        <Button variant="solid" color='primary' disabled={editingKey !== ''} onClick={() => edit(record)}>
                            编辑
                        </Button>
                        <Popconfirm
                            title="警告"
                            description="确定要删除该分类吗？此操作不可撤销！"
                            onConfirm={() => deleteClassify(record.key)}
                            onCancel={null}
                            okText="确认"
                            okType="danger"
                            cancelText="取消"
                            classNames={{ container: s.popconfirmRoot, title: s.popconfirmTitle, content: s.popconfirmContent }}
                        >
                            <Button color="danger" variant="solid">删除</Button>
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
                    添加分类
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
                    scroll={{ y: 55 * 12, x: 'max-content' }}
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
            title="添加分类"
            open={addDia}
            footer={null}
            onCancel={() => setAddDia(false)}
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
                onFinish={addClassify}
                layout="vertical"
                autoComplete="off"
                requiredMark={false}
                style={{ padding: '10px', width: '100%' }}
                classNames={{
                    label: s.formLabel
                }}
            >
                <Form.Item
                    label="分类名"
                    name="cateName"
                    rules={[{ required: true, message: '请输入分类名!' }]}
                    prefix={<FilterOutlined />}
                >
                    <Input allowClear placeholder="请输入分类名" className={s.input} />
                </Form.Item>

                <Form.Item label="启用状态" name="state">
                    <Radio.Group options={[
                        { label: '启用', value: 1 },
                        { label: '禁用', value: 0 },
                    ]} defaultValue={1} optionType="button" />
                </Form.Item>
                <Flex justify="end" align="center" style={{ width: '100%' }} >
                    <SubmitButton form={form} loading={confirmLoading}>
                        添加分类
                    </SubmitButton>
                </Flex>
            </Form>
        </Modal>
    </Card>
}
