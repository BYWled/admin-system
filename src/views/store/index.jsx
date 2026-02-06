import { useEffect, useState } from 'react'
import { timeToDate } from '../../utils/time';
import dayjs from 'dayjs'; // TODO:由于antd日期组件依赖dayjs处理日期，这里也引入dayjs以避免报错
import { getStoreApi } from '../../api/storeApi';
import { App, Button, Card, Flex, Table, Modal, Form, Input, DatePicker, Pagination, Divider, Descriptions, Select, Typography, Avatar } from 'antd';

export default function store() {
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);

    // 状态选项
    const stateOptions = [
        { label: '请选择', value: '' },
        { label: '已受理', value: '已受理' },
        { label: '派送中', value: '派送中' },
        { label: '已完成', value: '已完成' }
    ];
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

    // =========== 获取店铺信息 ==============
    const getTableData = async () => {
        setPageLoading(true);
        const res = await getStoreApi({
            page: currentPage,
            size: pageSize
        });
        if (res.code) {
            setTableData([]);
            setTotal(0);
            setPageLoading(false);
            return message.error('获取店铺信息失败');
        }
        setTableData(Array.isArray(res.data) ? res.data : [res.data]); // 兼容后端单条数据直接返回对象的情况
        setTotal(Array.isArray(res.data) ? res.data.length : 1); // TODO: 后端接口需要返回总条数以支持分页，这里暂时用当前数据长度代替
        setPageLoading(false);
        setConfirmLoading(false);
    }

    useEffect(() => {
        getTableData();
    }, [pageSize, currentPage]);

    // ============ 编辑店铺 ==============
    const openEdit = (item) => {
        setEditDia(true);
        setEditForm({
            ...item,
            storeTime: dayjs(timeToDate(item.storeTime)),// TODO:antd日期组件依赖dayjs处理日期，这里转换一下
            deliveryTime: dayjs(timeToDate(item.deliveryTime))
        })
    }
    const editStore = async (values) => {
        try {
            setConfirmLoading(true);
            // 修改信息
            const res = await editStoreApi({
                id: editForm.id,
                storeNo: values.storeNo,
                storeTime: values.storeTime,
                phone: values.phone,
                consignee: values.consignee,
                deliverAddress: values.deliverAddress,
                storeState: values.storeState,
                storeAmount: values.storeAmount,
                remarks: values.remarks,
                deliveryTime: values.deliveryTime
            });
            if (res.code) {
                setConfirmLoading(false);
                message.error(`修改店铺信息失败: ${res.msg}`);
                return;
            }
            setEditForm({});
            form.resetFields(); // 重置表单
            getTableData();
            setConfirmLoading(false);
            setEditDia(false);
            message.success('店铺信息已更新');
        } catch (error) {
            setConfirmLoading(false);
            message.error(`修改店铺信息失败: ${error.message}`);
        }
    }

    // =========== 查看详情 ==============
    const info = (record) => {
        setRowInfo({ ...record, storeTime: timeToDate(record.storeTime), deliveryTime: timeToDate(record.deliveryTime) });
        setInfoDia(true);
    }

    const closeInfo = () => {
        setRowInfo({});
        setInfoDia(false);
    }

    // ============= 表格相关 ==============
    const columns = [
        { title: '店铺名', dataIndex: 'name' },
        { title: '店铺头像', dataIndex: 'avatar' },
        { title: '评分', dataIndex: 'score' },
        { title: '销量', dataIndex: 'sellCount' },
        { title: '描述', dataIndex: 'description' },
        { title: '营业时间', dataIndex: 'date' },
        { title: '操作', dataIndex: 'action', fixed: 'end', width: 180 }
    ];
    const dataSource = tableData.map((item) => ({
        key: item.id,
        name: item.name,
        avatar: <Avatar shape="square" src={item.avatar} alt="avatar" size="large" draggable={false} />,
        score: item.score,
        sellCount: item.sellCount,
        date: 1,
        description: <Typography.Paragraph ellipsis={{ tooltip: item.description, rows: 1 }} style={{ maxWidth: 200, margin: 0 }}>{item.description}</Typography.Paragraph>,
        action: (
            <Flex gap="small">
                <Button variant="solid" onClick={() => info(item)}>详情</Button>
                <Button color="primary" variant="solid" onClick={() => openEdit(item)}>编辑</Button>
            </Flex>
        )
    }));

    return (
        <Card variant="borderless" style={{ width: '100%' }} >
            <Flex vertical justify="center" align="center" style={{ width: '100%' }} gap="small" >
                <Table columns={columns} dataSource={dataSource} loading={pageLoading} scroll={{ y: 55 * 8, x: 'max-content' }} pagination={false} />
                {/* 分页 */}
                <Flex justify="center" align="center" style={{ width: '100%' }} >
                    <Pagination
                        total={total}
                        showTotal={total => `共显示 ${total} 条`}
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
            {/* 详情 */}
            <Modal
                title="店铺详情"
                open={infoDia}
                footer={null}
                onCancel={closeInfo}
                destroyOnHidden={true}
                width={600}
                centered
                mask={{ blur: false }}
            >
                <Flex direction="column" wrap gap="medium" >
                    <Divider orientation="left">基本信息</Divider>
                    <Descriptions column={2} style={{ width: '100%' }} size='small' bstoreed items={[
                        {
                            key: '1',
                            label: '店铺ID',
                            children: rowInfo.id,
                        },
                        {
                            key: '2',
                            label: '店铺号',
                            children: rowInfo.storeNo,
                        },
                        {
                            key: '3',
                            label: '店铺状态',
                            children: rowInfo.storeState,
                        },
                        {
                            key: '4',
                            label: '创建时间',
                            children: rowInfo.storeTime, // TODO: 由于调用timeToDate是异步的，这里需要在初始化后直接用转换的值
                        },
                        {
                            key: '5',
                            label: '店铺金额',
                            children: rowInfo.storeAmount ? `￥ ${rowInfo.storeAmount.toFixed(2)}` : '',
                        },
                        {
                            key: '6',
                            label: '备注',
                            children: rowInfo.remarks,
                        }
                    ]} />
                    <Divider orientation="left">运输信息</Divider>
                    <Descriptions column={2} style={{ width: '100%' }} bstoreed items={[
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
                title="编辑店铺"
                open={editDia}
                footer={null}
                onCancel={() => setEditDia(false)
                }
                destroyOnHidden={true}
                mask={{ blur: false }}
                centered
            >
                <Form
                    form={form}
                    name="editForm"
                    onFinish={editStore}
                    layout="vertical"
                    autoComplete="off"
                    clearOnDestroy={true}
                    style={{ padding: '10px', width: '100%' }}
                >
                    <Flex justify="space-between" align="center" wrap style={{ width: '100%' }} >
                        <Form.Item
                            label="店铺号"
                            name="storeNo"
                            initialValue={editForm.storeNo}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请输入店铺号!' }]}
                        >
                            <Input allowClear placeholder="请输入店铺号" />
                        </Form.Item>

                        <Form.Item
                            label="店铺金额"
                            name="storeAmount"
                            initialValue={editForm.storeAmount}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请输入店铺金额!' }]}
                        >
                            <Input allowClear placeholder="请输入店铺金额" />
                        </Form.Item>

                        <Form.Item
                            label="收货人"
                            name="consignee"
                            initialValue={editForm.consignee}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请输入收货人!' }]}
                        >
                            <Input allowClear placeholder="请输入收货人" />
                        </Form.Item>

                        <Form.Item
                            label="收货手机号"
                            name="phone"
                            initialValue={editForm.phone}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请输入收货手机号!' }]}
                        >
                            <Input allowClear placeholder="请输入手机号" />
                        </Form.Item>

                        <Form.Item
                            label="收货地址"
                            name="deliverAddress"
                            initialValue={editForm.deliverAddress}
                            style={{ width: '100%' }}
                            rules={[{ required: true, message: '请输入收货地址!' }]}
                        >
                            <Input allowClear placeholder="请输入收货地址" />
                        </Form.Item>

                        <Form.Item
                            label="店铺状态"
                            name="storeState"
                            initialValue={editForm.storeState}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请选择店铺状态!' }]}
                        >
                            <Select
                                placeholder="请选择店铺状态"
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
                            <Input allowClear placeholder="请输入备注" />
                        </Form.Item>

                        <Form.Item
                            label="下单时间"
                            name="storeTime"
                            initialValue={editForm.storeTime}
                            style={{ width: '45%' }}
                            rules={[{ required: true, message: '请输入下单时间!' }]}
                        >
                            <DatePicker showTime placeholder="请输入时间" format={{
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
                            <DatePicker showTime placeholder="请输入时间" format={{
                                format: 'YYYY-MM-DD HH:mm:ss',
                                type: 'mask',
                            }} />
                        </Form.Item>
                    </Flex>

                    <Flex justify="end" align="center" style={{ width: '100%' }} >
                        <SubmitButton form={form} loading={confirmLoading}>
                            编辑店铺
                        </SubmitButton>
                    </Flex>
                </Form>
            </Modal >
        </Card >
    )
}
