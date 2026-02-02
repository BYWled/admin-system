import { useEffect, useState } from 'react'
import { changePassApi } from '../../api/userApi';
import { getUserApi, addUserApi, deleteUserApi, batchDeleteUserApi, editUserApi } from '../../api/userListApi';
import { timeToDate } from '../../utils/time';
import { App, Avatar, Button, Card, Flex, Table, Modal, Form, Input, Select, Popconfirm, Typography } from 'antd'
import { UserOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';

export default function User() {
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [tableData, setTableData] = useState([]);
    const [confirmLoading, setConfirmLoading] = useState(false); // 通用确认加载状态，一般仅有一个弹窗
    const [addDia, setAddDia] = useState(false);
    const [editDia, setEditDia] = useState(false);
    const [editForm, setEditForm] = useState({});
    const { message } = App.useApp();
    const [form] = Form.useForm();

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

    // =========== 获取用户列表 ==============
    const getTableData = async () => {
        const res = await getUserApi({
            pageSize,
            currentPage
        });
        if (res.data && res.data.length === 0) {
            return message.error('获取用户列表失败');
        }
        setTableData(res.data);
        setTotal(res.total);
        setConfirmLoading(false);
    }

    useEffect(() => {
        getTableData();
    }, [pageSize, currentPage]);

    // ============= 增删改 ==============
    // 添加用户接口
    const addUser = async (values) => {
        setConfirmLoading(true);
        const res = await addUserApi({
            account: values.account,
            password: values.password,
            userGroup: values.userGroup
        });
        if (res.code) {
            setConfirmLoading(false);
            message.error(`添加用户失败: ${res.msg}`);
            return;
        }
        message.success('用户已添加');
        getTableData();
        form.resetFields(); // 重置表单
        setAddDia(false);
    }

    // 删除用户接口
    const deleteUser = async (id) => {
        const res = await deleteUserApi({ id });
        if (res.code) {
            message.error(`删除用户失败: ${res.msg}`); //TODO:(str,code) 是持续时间的写法，需要直接拼接字符串
            return;
        }
        message.success('用户已删除');
        getTableData();
    }

    // 批量删除用户接口
    const batchDeleteUser = async (ids) => {
        const res = await batchDeleteUserApi({ ids: JSON.stringify(ids) }); // ids是数组,接口需要字符串
        if (res.code) {
            message.error(`批量删除用户失败: ${res.msg}`);
            return;
        }
        message.success('已删除选中用户');
        setSelectedRowIds([]);
        getTableData();
    }

    // 修改用户
    const openEdit = (item) => {
        setEditDia(true);
        setEditForm({ ...item });
    }
    const editUser = async (values) => {
        setConfirmLoading(true);
        // 先判断是否修改密码
        if (values.oldPwd) {
            const res = await changePassApi({
                oldPwd: values.oldPwd,
                newPwd: values.newPwd,
                id: editForm.id
            })
            if (res.code) {
                setConfirmLoading(false);
                message.error(`修改密码失败: ${res.msg}`);
                return;
            }
        }
        // 修改其他信息
        const res = await editUserApi({
            id: editForm.id,
            account: values.account,
            userGroup: values.userGroup
        });
        if (res.code) {
            setConfirmLoading(false);
            message.error(`修改用户信息失败: ${res.msg}`);
            return;
        }
        setEditForm({});
        getTableData();
        setConfirmLoading(false);
        setEditDia(false);
        message.success('用户信息已更新');
    }
    // ============= 表格相关 ==============
    const columns = [
        { title: '用户ID', dataIndex: 'id' },
        { title: '用户头像', dataIndex: 'avatar' },
        { title: '用户名', dataIndex: 'name' },
        { title: '身份组', dataIndex: 'group' },
        { title: '注册时间', dataIndex: 'time' },
        { title: '操作', dataIndex: 'action' }
    ];
    const dataSource = tableData.map((item) => ({
        key: item.id,
        id: item.id,
        avatar: <Avatar shape="square" src={item.imgUrl} alt="avatar" size="large" draggable={false} />,
        name: item.account,
        group: item.userGroup,
        time: timeToDate(item.ctime),
        action: (
            <Flex gap="small">
                <Button color="primary" variant="solid" onClick={() => openEdit(item)}>编辑</Button>
                <Popconfirm
                    title="警告"
                    description="确定要删除该用户吗？此操作不可撤销！"
                    onConfirm={() => deleteUser(item.id)}
                    onCancel={null}
                    okText="确认"
                    okType="danger"
                    cancelText="取消"
                >
                    <Button color="danger" variant="solid">删除</Button>
                </Popconfirm>
            </Flex>
        )
    }));

    const rowSelection = {
        selectedRowIds,
        onChange: row => setSelectedRowIds(row),
    };

    return (
        <Card variant="borderless" style={{ width: '100%' }}>
            <Flex vertical justify="center" align="center" style={{ width: '100%' }} gap="small" >
                <Flex justify="space-between" align="center" style={{ width: '100%' }} >
                    <Flex justify="start" align="center" style={{ width: '100%' }} gap="small" >
                        <span>共</span><Typography.Text keyboard>{total}</Typography.Text><span>用户</span>
                    </Flex>
                    <Flex justify="end" align="center" style={{ width: '100%' }} gap="small" >
                        <Button color="cyan" variant="outlined" onClick={() => setAddDia(true)}>
                            添加用户
                        </Button>
                        <Popconfirm
                            title="警告"
                            description="确定要删除选中用户吗？此操作不可撤销！"
                            onConfirm={() => batchDeleteUser(selectedRowIds)}
                            onCancel={null}
                            okText="确认"
                            okType="danger"
                            cancelText="取消"
                        >
                            <Button color="danger" variant="outlined" disabled={selectedRowIds.length === 0}>
                                批量删除
                            </Button>
                        </Popconfirm>
                    </Flex>
                </Flex>
                <Table rowSelection={rowSelection} columns={columns} dataSource={dataSource} scroll={{ y: 55 * 8 }} pagination={{ pageSize, current: currentPage, total, pageSizeOptions: [10, 20, 50], onChange: (page) => setCurrentPage(page), onShowSizeChange: (current, size) => setPageSize(size) }} />
            </Flex>
            {/* 添加 */}
            {/* TODO:
                1. ...赋值时，应先结构，再赋值，避免覆盖其他字段
                2. 直接使用Form表单组件时，应直接使用Form.useForm()创建表单实例，避免使用useState管理表单数据
            */}
            <Modal
                title="添加用户"
                open={addDia}
                footer={null}
                onCancel={() => setAddDia(false)}
                destroyOnHidden={true}
                mask={{ blur: false }}
            >
                <Form
                    form={form}
                    name="addForm"
                    onFinish={addUser}
                    layout="vertical"
                    autoComplete="off"
                    style={{ padding: '10px', width: '100%' }}
                >
                    <Form.Item
                        label="用户名"
                        name="account"
                        rules={[{ required: true, message: '请输入用户名!' }]}
                        prefix={<UserOutlined />}
                    >
                        <Input allowClear placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: '请输入密码!' }]}
                        prefix={<LockOutlined />}
                    >
                        <Input.Password allowClear placeholder="请输入密码" />
                    </Form.Item>

                    <Form.Item
                        label="确认密码"
                        name="confirmPassword"
                        prefix={<CheckCircleOutlined />}
                        rules={[{ required: true, message: '请输入确认密码!' }, ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('两次输入的密码不一致！'));
                            },
                        })]}
                    >
                        <Input.Password allowClear placeholder="请输入确认密码" />
                    </Form.Item>

                    <Form.Item label="身份组" name="userGroup" rules={[{ required: true, message: '请选择身份组!' }]}>
                        <Select placeholder="请选择身份组">
                            <Select.Option value="超级管理员">超级管理员</Select.Option>
                            <Select.Option value="普通管理员">普通管理员</Select.Option>
                        </Select>
                    </Form.Item>
                    <Flex justify="end" align="center" style={{ width: '100%' }} >
                        <SubmitButton form={form} loading={confirmLoading}>
                            添加用户
                        </SubmitButton>
                    </Flex>
                </Form>
            </Modal>
            {/* 编辑 */}
            <Modal
                title="编辑用户"
                open={editDia}
                footer={null}
                onCancel={() => setEditDia(false)}
                destroyOnHidden={true}
                mask={{ blur: false }}
            >
                <Form
                    form={form}
                    name="editForm"
                    onFinish={editUser}
                    layout="vertical"
                    autoComplete="off"
                    clearOnDestroy={true}
                    style={{ padding: '10px', width: '100%' }}
                >
                    <Form.Item
                        label="用户名"
                        name="account"
                        initialValue={editForm.account}
                        rules={[{ required: true, message: '请输入用户名!' }]}
                        prefix={<UserOutlined />}
                    >
                        <Input allowClear placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item label="身份组" name="userGroup" initialValue={editForm.userGroup} rules={[{ required: true, message: '请选择身份组!' }]}>
                        <Select placeholder="请选择身份组">
                            <Select.Option value="超级管理员">超级管理员</Select.Option>
                            <Select.Option value="普通管理员">普通管理员</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="旧密码"
                        name="oldPwd"
                        prefix={<LockOutlined />}
                    >
                        <Input.Password allowClear placeholder="请输入旧密码" />
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="newPwd"
                        prefix={<LockOutlined />}
                        rules={[({ getFieldValue }) => ({
                            validator(_, value) {
                                if (getFieldValue('oldPwd') && !value)
                                    return Promise.reject(new Error('若修改密码，需填写新密码！'));
                                return Promise.resolve();
                            }
                        })]}
                    >
                        <Input.Password allowClear placeholder="请输入密码" />
                    </Form.Item>

                    <Form.Item
                        label="确认密码"
                        name="confirmPassword"
                        prefix={<CheckCircleOutlined />}
                        rules={[({ getFieldValue }) => ({
                            validator(_, value) {
                                if (getFieldValue('newPwd') && !value) {
                                    return Promise.reject(new Error('若修改密码，需填写确认密码！'));
                                }
                                if (!value || getFieldValue('newPwd') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('两次输入的密码不一致！'));
                            },
                        })]}
                    >
                        <Input.Password allowClear placeholder="请输入确认密码" />
                    </Form.Item>

                    <Flex justify="end" align="center" style={{ width: '100%' }} >
                        <SubmitButton form={form} loading={confirmLoading}>
                            编辑用户
                        </SubmitButton>
                    </Flex>
                </Form>
            </Modal>
        </Card >
    )
}
