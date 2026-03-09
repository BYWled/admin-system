import { useEffect, useState } from 'react'
import { timeToDate, numToTime } from '../../utils/time';
import dayjs from 'dayjs'; // TODO:由于antd日期组件依赖dayjs处理日期，这里也引入dayjs以避免报错
import { getOrderApi, editOrderApi } from '../../api/orderApi';
import { App, Button, Card, Flex, Table, Modal, Form, Input, DatePicker, Pagination, Divider, Descriptions, InputNumber, Select } from 'antd'
import s from '../../styles/layout.module.scss'

export default function order() {
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    // 搜索表单数据
    const emptyForm = {
        orderNo: '',
        consignee: '',
        phone: '',
        orderState: '',
        date: []
    };
    // 状态选项
    const stateOptions = [
        { label: '请选择', value: '' },
        { label: '已受理', value: '已受理' },
        { label: '派送中', value: '派送中' },
        { label: '已完成', value: '已完成' }
    ];
    const [formData, setFormData] = useState(emptyForm);
    const [tableData, setTableData] = useState([]);
    const [pageLoading, setPageLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false); // 通用确认加载状态，一般仅有一个弹窗
    const [editDia, setEditDia] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [infoDia, setInfoDia] = useState(false);
    const [rowInfo, setRowInfo] = useState({});
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

    // =========== 获取订单列表 ==============
    const getTableData = async (emptyForm) => {
        setPageLoading(true);
        const res = await getOrderApi({
            pageSize,
            currentPage,
            ...(emptyForm || formData),
            date: emptyForm ? JSON.stringify([]) : JSON.stringify(formData.date)
        });
        if (res.code) {
            setTableData([]);
            setTotal(0);
            setPageLoading(false);
            return message.error('获取订单列表失败');
        }
        setTableData(res.data);
        setTotal(res.total);
        setPageLoading(false);
        setConfirmLoading(false);
    }

    useEffect(() => {
        getTableData();
    }, [pageSize, currentPage]);

    // ============ 处理搜索 ==============
    const handleSearch = () => {
        setCurrentPage(1);
        getTableData();
    }

    const clearAll = () => {
        setFormData(emptyForm);
        setCurrentPage(1);
        // TODO: 清空后立即获取数据会导致formData未更新，需要特殊处理
        getTableData(emptyForm);
    }

    // ============ 编辑订单 ==============
    const openEdit = (item) => {
        setEditDia(true);
        setEditForm({
            ...item,
            orderTime: dayjs(timeToDate(item.orderTime)),// TODO:antd日期组件依赖dayjs处理日期，这里转换一下
            deliveryTime: dayjs(timeToDate(item.deliveryTime))
        })
    }
    const editOrder = async (values) => {
        try {
            setConfirmLoading(true);
            // 修改信息
            const res = await editOrderApi({
                id: editForm.id,
                orderNo: values.orderNo,
                orderTime: numToTime(values.orderTime.valueOf()), // TODO:日期组件返回的是dayjs对象，valueOf转换成时间戳
                phone: values.phone,
                consignee: values.consignee,
                deliverAddress: values.deliverAddress,
                orderState: values.orderState,
                orderAmount: values.orderAmount,
                remarks: values.remarks,
                deliveryTime: numToTime(values.deliveryTime.valueOf()) // TODO:日期组件返回的是dayjs对象，valueOf转换成时间戳
            });
            if (res.code) {
                setConfirmLoading(false);
                message.error(`修改订单信息失败: ${res.msg}`);
                return;
            }
            setEditForm({});
            form.resetFields(); // 重置表单
            getTableData();
            setConfirmLoading(false);
            setEditDia(false);
            message.success('订单信息已更新');
        } catch (error) {
            setConfirmLoading(false);
            message.error(`修改订单信息失败: ${error.message}`);
        }
    }

    // =========== 查看详情 ==============
    const info = (record) => {
        setRowInfo({ ...record, orderTime: timeToDate(record.orderTime), deliveryTime: timeToDate(record.deliveryTime) });
        setInfoDia(true);
    }

    const closeInfo = () => {
        setRowInfo({});
        setInfoDia(false);
    }

    // ============= 表格相关 ==============
    const columns = [
        { title: '订单号', dataIndex: 'orderNo' },
        { title: '收货人信息', dataIndex: 'consigneeInfo' },
        { title: '订单状态', dataIndex: 'orderState' },
        { title: '订单金额', dataIndex: 'orderAmount' },
        { title: '备注', dataIndex: 'remarks' },
        { title: '操作', dataIndex: 'action', fixed: 'end', width: 180 }
    ];
    const dataSource = tableData.map((item) => ({
        key: item.id,
        orderNo: item.orderNo,
        consigneeInfo: `${item.consignee} ${item.phone}`,
        orderState: item.orderState,
        orderAmount: `￥ ${item.orderAmount.toFixed(2)}`,
        remarks: item.remarks,
        action: (
            <Flex gap="small">
                <Button variant="solid" onClick={() => info(item)}>详情</Button>
                <Button color="primary" variant="solid" onClick={() => openEdit(item)}>编辑</Button>
            </Flex>
        )
    }));

    return (
        <Card classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle }} variant="borderless" style={{ width: '100%' }} >
            <Flex vertical justify="center" align="center" style={{ width: '100%' }} gap="small" >
                <Form layout="inline" style={{ marginBottom: '10px' }} classNames={{ label: s.formLabel }} >
                    <Flex gap="small" wrap >
                        <Form.Item label="订单号">
                            <Input className={s.input} placeholder='请输入订单号' value={formData.orderNo} onChange={(e) => setFormData({ ...formData, orderNo: e.target.value })} />
                        </Form.Item>
                        <Form.Item label="收货人">
                            <Input className={s.input} placeholder='请输入姓名' value={formData.consignee} onChange={(e) => setFormData({ ...formData, consignee: e.target.value })} />
                        </Form.Item>
                        <Form.Item label="手机号">
                            <InputNumber className={s.input} style={{ width: '150px' }} placeholder='请输入手机号' value={formData.phone} onChange={(value) => setFormData({ ...formData, phone: value })} />
                        </Form.Item>
                        <Form.Item label="订单状态">
                            <Select
                                className={s.selectRoot}
                                classNames={{
                                    popup: {
                                        root: s.selectPopup,
                                        listItem: s.selectListItem
                                    }
                                }}
                                placeholder="请选择"
                                value={formData.orderState}
                                style={{ width: '150px' }}
                                onChange={(value) => setFormData({ ...formData, orderState: value })}
                                options={stateOptions}
                            />
                        </Form.Item>
                        <Form.Item label="下单时间">
                            <DatePicker.RangePicker
                                className={s.input}
                                value={formData.date[0] && formData.date[1] ? [dayjs(formData.date[0]), dayjs(formData.date[1])] : []}
                                showTime
                                placeholder={['开始时间', '结束时间']}
                                format="YYYY-MM-DD HH:mm:ss"
                                onChange={(dates, dateStrings) => setFormData({ ...formData, date: dateStrings })} />
                        </Form.Item>
                        <Form.Item>
                            <Flex gap="small" >
                                <Button type="primary" onClick={handleSearch}>搜索</Button>
                                <Button onClick={clearAll}>清空</Button>
                            </Flex>
                        </Form.Item>
                    </Flex>
                </Form>
                <Table classNames={{ root: s.tableRoot, header: { cell: s.tableHeader }, body: { cell: s.tableBody } }} columns={columns} dataSource={dataSource} loading={pageLoading} scroll={{ y: 55 * 11, x: 'max-content' }} pagination={false} />
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
            {/* 详情 */}
            < Modal
                title="订单详情"
                open={infoDia}
                footer={null}
                onCancel={closeInfo}
                destroyOnHidden={true}
                width={600}
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
                    <Descriptions classNames={{ root: s.descRoot, label: s.descLabel, content: s.descContent }} column={2} style={{ width: '100%' }} size='small' bordered items={[
                        {
                            key: '1',
                            label: '订单ID',
                            children: rowInfo.id,
                        },
                        {
                            key: '2',
                            label: '订单号',
                            children: rowInfo.orderNo,
                        },
                        {
                            key: '3',
                            label: '订单状态',
                            children: rowInfo.orderState,
                        },
                        {
                            key: '4',
                            label: '创建时间',
                            children: rowInfo.orderTime, // TODO: 由于调用timeToDate是异步的，这里需要在初始化后直接用转换的值
                        },
                        {
                            key: '5',
                            label: '订单金额',
                            children: rowInfo.orderAmount ? `￥ ${rowInfo.orderAmount.toFixed(2)}` : '',
                        },
                        {
                            key: '6',
                            label: '备注',
                            children: rowInfo.remarks,
                        }
                    ]} />
                    <Divider classNames={{ root: s.dividerRoot, rail: s.divider, content: s.divider }} orientation="left">运输信息</Divider>
                    <Descriptions classNames={{ root: s.descRoot, label: s.descLabel, content: s.descContent }} column={2} style={{ width: '100%' }} bordered items={[
                        {
                            key: '1',
                            label: '收件人',
                            children: rowInfo.consignee,
                        },
                        {
                            key: '2',
                            label: '手机号',
                            children: rowInfo.phone,
                        },
                        {
                            key: '3',
                            label: '收货地址',
                            span: 2,
                            children: rowInfo.deliverAddress,
                        },
                        {
                            key: '4',
                            label: '收货时间',
                            children: rowInfo.deliveryTime,
                        }
                    ]} />
                </Flex>
            </Modal >
            {/* 编辑 */}
            < Modal
                title="编辑订单"
                open={editDia}
                footer={null}
                onCancel={() => setEditDia(false)
                }
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
                    form={form}
                    name="editForm"
                    onFinish={editOrder}
                    layout="vertical"
                    autoComplete="off"
                    clearOnDestroy={true}
                    style={{ padding: '10px', width: '100%' }}
                    classNames={{
                        label: s.formLabel
                    }}
                >
                    <Flex justify="space-between" align="center" wrap style={{ width: '100%' }} >
                        <Form.Item
                            label="订单号"
                            name="orderNo"
                            initialValue={editForm.orderNo}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请输入订单号!' }]}
                        >
                            <Input className={s.input} allowClear placeholder="请输入订单号" />
                        </Form.Item>

                        <Form.Item
                            label="订单金额"
                            name="orderAmount"
                            initialValue={editForm.orderAmount}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请输入订单金额!' }]}
                        >
                            <Input className={s.input} allowClear placeholder="请输入订单金额" />
                        </Form.Item>

                        <Form.Item
                            label="收货人"
                            name="consignee"
                            initialValue={editForm.consignee}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请输入收货人!' }]}
                        >
                            <Input className={s.input} allowClear placeholder="请输入收货人" />
                        </Form.Item>

                        <Form.Item
                            label="收货手机号"
                            name="phone"
                            initialValue={editForm.phone}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请输入收货手机号!' }]}
                        >
                            <Input className={s.input} allowClear placeholder="请输入手机号" />
                        </Form.Item>

                        <Form.Item
                            label="收货地址"
                            name="deliverAddress"
                            initialValue={editForm.deliverAddress}
                            style={{ width: '100%' }}
                            rules={[{ required: true, message: '请输入收货地址!' }]}
                        >
                            <Input className={s.input} allowClear placeholder="请输入收货地址" />
                        </Form.Item>

                        <Form.Item
                            label="订单状态"
                            name="orderState"
                            initialValue={editForm.orderState}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请选择订单状态!' }]}
                        >
                            <Select
                                className={s.selectRoot}
                                classNames={{
                                    popup: {
                                        root: s.selectPopup,
                                        listItem: s.selectListItem
                                    }
                                }}
                                placeholder="请选择订单状态"
                                options={stateOptions}
                            />
                        </Form.Item>

                        <Form.Item
                            label="备注"
                            name="remarks"
                            initialValue={editForm.remarks}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请输入备注!' }]}
                        >
                            <Input className={s.input} allowClear placeholder="请输入备注" />
                        </Form.Item>

                        <Form.Item
                            label="下单时间"
                            name="orderTime"
                            initialValue={editForm.orderTime}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请输入下单时间!' }]}
                        >
                            <DatePicker className={s.input} showTime placeholder="请输入时间" format={{
                                format: 'YYYY-MM-DD HH:mm:ss',
                                type: 'mask',
                            }} />
                        </Form.Item>

                        <Form.Item
                            label="收货时间"
                            name="deliveryTime"
                            initialValue={editForm.deliveryTime}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请输入收货时间!' }]}
                        >
                            <DatePicker className={s.input} showTime placeholder="请输入时间" format={{
                                format: 'YYYY-MM-DD HH:mm:ss',
                                type: 'mask',
                            }} />
                        </Form.Item>
                    </Flex>

                    <Flex justify="end" align="center" style={{ width: '100%' }} >
                        <SubmitButton form={form} loading={confirmLoading}>
                            编辑订单
                        </SubmitButton>
                    </Flex>
                </Form>
            </Modal >
        </Card >
    )
}
