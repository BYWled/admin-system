import { useEffect, useState } from 'react'
import { getActiveApi, addActiveApi, deleteActiveApi, editActiveApi } from '../../api/activeApi';
import { timeToDate } from '../../utils/time';
import dayjs from 'dayjs';
import {
    App, Button, Card, Flex, Table, Modal, Form, Input, Popconfirm, Pagination, DatePicker, Radio, Tag, Tooltip, Typography
} from 'antd'
import { UserOutlined } from '@ant-design/icons';
import s from '../../styles/layout.module.scss'

export default function Active() {
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [tableData, setTableData] = useState([]);
    const [pageLoading, setPageLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false); // 通用确认加载状态，一般仅有一个弹窗
    const [addDia, setAddDia] = useState(false);
    const [editDia, setEditDia] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const { message } = App.useApp();
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

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

    // =========== 获取活动列表 ==============
    const getTableData = async () => {
        setPageLoading(true);
        const res = await getActiveApi({
            pageSize,
            currentPage
        });
        if (res.list && res.list.length === 0) {
            setTableData([]);
            setTotal(0);
            setPageLoading(false);
            return message.error('获取活动列表失败');
        }
        setTableData(res.list);
        setTotal(res.total);
        setPageLoading(false);
        setConfirmLoading(false);
    }

    useEffect(() => {
        getTableData();
    }, [pageSize, currentPage]);

    // ============= 增删改 ==============
    // 添加活动接口
    const addActive = async (values) => {
        setConfirmLoading(true);
        const res = await addActiveApi({
            title: values.title,
            type: values.type,
            content: values.content,
            status: values.status,
            s_time: values.times[0].valueOf(), //TODO: dayjs获取时间戳的写法，直接.valueOf()
            e_time: values.times[1].valueOf()
        });
        if (res.code) {
            setConfirmLoading(false);
            message.error(`添加活动失败: ${res.msg}`);
            return;
        }
        message.success('活动已添加');
        getTableData();
        addForm.resetFields(); // 重置表单
        setAddDia(false);
    }

    // 删除活动接口
    const deleteActive = async (id) => {
        const res = await deleteActiveApi({ id });
        if (res.code) {
            message.error(`删除活动失败: ${res.msg}`); //TODO:(str,code) 是持续时间的写法，需要直接拼接字符串
            return;
        }
        message.success('活动已删除');
        getTableData();
    }

    // 修改活动
    const openEdit = (item) => {
        setEditFormData({ ...item });
        editForm.setFieldsValue({
            title: item.title,
            times: [dayjs(item.s_time), dayjs(item.e_time)], // antd的DatePicker组件需要dayjs对象作为时间值
            type: item.type,
            status: item.status,
            content: item.content
        });
        setEditDia(true);
    }
    const editActive = async (values) => {
        setConfirmLoading(true);
        const res = await editActiveApi({
            id: editFormData.id,
            title: values.title,
            type: values.type,
            content: values.content,
            status: values.status,
            s_time: values.times[0].valueOf(),
            e_time: values.times[1].valueOf()
        });
        if (res.code) {
            setConfirmLoading(false);
            message.error(`修改活动信息失败: ${res.msg}`);
            return;
        }
        setEditFormData({});
        editForm.resetFields();
        getTableData();
        setConfirmLoading(false);
        setEditDia(false);
        message.success('活动信息已更新');
    }
    // ============= 表格相关 ==============
    const columns = [
        { title: '活动ID', dataIndex: 'id' },
        { title: '活动标题', dataIndex: 'title' },
        { title: '活动类型', dataIndex: 'type' },
        { title: '活动时间', dataIndex: 'times' },
        { title: '活动状态', dataIndex: 'status' },
        { title: '操作', dataIndex: 'action', fixed: 'end', width: 180 }
    ];
    const dataSource = tableData.map((item) => ({
        key: item.id,
        id: item.id,
        title: item.title,
        type: item.type || '-',
        times: (<Tooltip title={<Typography.Text className={s.cardTitle}>{timeToDate(item.s_time, 'all', true) + ' ~ ' + timeToDate(item.e_time, 'all', true)}</Typography.Text>
        } destroyOnHidden color='var(--backColor)' styles={{ root: { maxWidth: '33vw' } }} >
            {
                Temporal.Now.instant().epochMilliseconds < item.s_time ? <Tag color='blue' variant='solid'>活动未开始</Tag> :
                    Temporal.Now.instant().epochMilliseconds > item.e_time ? <Tag color='red' variant='solid'>活动已结束</Tag> : <Tag color='green' variant='solid'>活动进行中</Tag>
            }
        </Tooltip >),
        status: item.status ? <Tag color='green' variant='outlined'>
            启用
        </Tag> : <Tag color='red' variant='outlined'>
            禁用
        </Tag>,
        action: (
            <Flex gap="small">
                <Button color="primary" variant="solid" onClick={() => openEdit(item)}>编辑</Button>
                <Popconfirm
                    title="警告"
                    description="确定要删除该活动吗？此操作不可撤销！"
                    onConfirm={() => deleteActive(item.id)}
                    onCancel={null}
                    okText="确认"
                    okType="danger"
                    cancelText="取消"
                    classNames={{ container: s.popconfirmRoot, title: s.popconfirmTitle, content: s.popconfirmContent }}
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
        <Card classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle }} variant="borderless" style={{ width: '100%' }}>
            <Flex vertical justify="center" align="center" style={{ width: '100%' }} gap="small" >
                <Flex justify="end" align="center" style={{ width: '100%' }} gap="small" >
                    <Button className={s.cardRoot} color="cyan" variant="outlined" onClick={() => setAddDia(true)}>
                        添加活动
                    </Button>
                </Flex>
                <Table
                    classNames={{ root: s.tableRoot, header: { cell: s.tableHeader }, body: { cell: s.tableBody } }}
                    rowSelection={rowSelection} columns={columns} dataSource={dataSource} loading={pageLoading} scroll={{ y: 55 * 12, x: 'max-content' }} pagination={false} />
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
            {/* TODO:
                1. 直接使用Form表单组件时，应直接使用Form.useForm()创建表单实例，避免使用useState管理表单数据
            */}
            <Modal
                title="添加活动"
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
                    form={addForm}
                    name="addForm"
                    onFinish={addActive}
                    layout="vertical"
                    autoComplete="off"
                    style={{ padding: '10px', width: '100%' }}
                    classNames={{
                        label: s.formLabel
                    }}
                >
                    <Form.Item
                        label="活动标题"
                        name="title"
                        rules={[{ required: true, message: '请输入活动标题!' }]}
                        prefix={<UserOutlined />}
                    >
                        <Input className={s.input} allowClear placeholder="请输入活动标题" />
                    </Form.Item>

                    <Form.Item
                        label="活动时间"
                        name="times"
                        rules={[{ required: true, message: '请选择时间!' }]}
                    >
                        <DatePicker.RangePicker className={s.input} format={'YYYY-MM-DD HH:mm:ss'} showTime needConfirm={false}
                            allowClear={false} style={{ width: '100%' }} placeholder={['开始时间', '结束时间']} />
                    </Form.Item>

                    <Form.Item label="活动类型" name="type">
                        <Input className={s.input} allowClear placeholder="请输入活动类型" />
                    </Form.Item>

                    <Form.Item
                        label="活动状态"
                        name="status"
                    >
                        <Radio.Group options={[
                            { label: '启用', value: 1 },
                            { label: '禁用', value: 0 },
                        ]} defaultValue={0} optionType="button" />
                    </Form.Item>

                    <Form.Item label="活动内容" name="content" rules={[{ required: true, message: '请输入活动内容!' }]}>
                        <Input className={s.input} allowClear placeholder="请输入活动内容" />
                    </Form.Item>

                    <Flex justify="end" align="center" style={{ width: '100%' }} >
                        <SubmitButton form={addForm} loading={confirmLoading}>
                            添加活动
                        </SubmitButton>
                    </Flex>
                </Form>
            </Modal>
            {/* 编辑 */}
            <Modal
                title="编辑活动"
                open={editDia}
                footer={null}
                onCancel={() => {
                    setEditDia(false);
                    editForm.resetFields();
                }}
                destroyOnHidden={true}
                mask={{ blur: false }}
                centered
                classNames={{
                    container: s.modalContainer,
                    header: s.modalHeader,
                    title: s.modalTitle,
                    body: s.modalBody,
                    footer: s.modalFooter
                }}
            >
                <Form
                    form={editForm}
                    name="editForm"
                    onFinish={editActive}
                    layout="vertical"
                    autoComplete="off"
                    clearOnDestroy={true}
                    style={{ padding: '10px', width: '100%' }}
                    classNames={{
                        label: s.formLabel
                    }}
                >
                    <Form.Item
                        label="活动标题"
                        name="title"
                        rules={[{ required: true, message: '请输入活动标题!' }]}
                        prefix={<UserOutlined />}
                    >
                        <Input className={s.input} allowClear placeholder="请输入活动标题" />
                    </Form.Item>

                    <Form.Item
                        label="活动时间"
                        name="times"
                        rules={[{ required: true, message: '请选择时间!' }]}
                    >
                        <DatePicker.RangePicker className={s.input} format={'YYYY-MM-DD HH:mm:ss'} showTime needConfirm={false}
                            allowClear={false} style={{ width: '100%' }} placeholder={['开始时间', '结束时间']} />
                    </Form.Item>

                    <Form.Item label="活动类型" name="type">
                        <Input className={s.input} allowClear placeholder="请输入活动类型" />
                    </Form.Item>

                    <Form.Item
                        label="活动状态"
                        name="status"
                    >
                        <Radio.Group options={[
                            { label: '启用', value: 1 },
                            { label: '禁用', value: 0 },
                        ]} optionType="button" />
                    </Form.Item>

                    <Form.Item label="活动内容" name="content" rules={[{ required: true, message: '请输入活动内容!' }]}>
                        <Input className={s.input} allowClear placeholder="请输入活动内容" />
                    </Form.Item>

                    <Flex justify="end" align="center" style={{ width: '100%' }} >
                        <SubmitButton form={editForm} loading={confirmLoading}>
                            编辑活动
                        </SubmitButton>
                    </Flex>
                </Form>
            </Modal>
        </Card >
    )
}
