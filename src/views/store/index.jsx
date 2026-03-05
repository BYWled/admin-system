import { useEffect, useState } from 'react'
import { timeToDate } from '../../utils/time';
import dayjs from 'dayjs'; // TODO:由于antd日期组件依赖dayjs处理日期，这里也引入dayjs以避免报错
import { getStoreApi, /*TODO:会把服务器改炸的editStoreApi*/ } from '../../api/storeApi';
import { App, Button, Card, Flex, Table, Modal, Form, Input, DatePicker, Pagination, Divider, Descriptions, Typography, Avatar, Carousel, InputNumber, Upload } from 'antd';
import { baseURL } from '../../utils/service';
const { RangePicker } = DatePicker;
const { TextArea } = Input;
import s from '../../styles/layout.module.scss'

export default function store() {
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
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
        // 处理日期范围
        const dateRange = (item.date && item.date.length === 2)
            ? [dayjs(timeToDate(item.date[0])), dayjs(timeToDate(item.date[1]))]
            : null;

        // 处理数组字段：将字符串数组转为文本
        const supportsText = item.supports && item.supports.length > 0
            ? item.supports.join('\n')
            : '';

        setEditForm({
            ...item,
            date: dateRange,
            supports: supportsText,
            pics: '' // 图片禁用，设为空
        })
    }
    const editStore = async (values) => {
        try {
            setConfirmLoading(true);

            // 处理日期范围：转换为字符串数组的JSON格式
            const dateArray = values.date && values.date.length === 2
                ? '[' + [values.date[0].format('YYYY-MM-DD HH:mm:ss'), values.date[1].format('YYYY-MM-DD HH:mm:ss')].join(', ') + ']'
                : '[]';

            // 处理活动字段：将每行文本转为字符串数组的JSON格式
            const supportsArray = values.supports
                ? '[' + [values.supports.split('\n').filter(s => s.trim()).map(s => `${s.trim()}`)].join(', ') + ']'
                : '[]';

            // 处理图片字段：转为字符串数组的JSON格式（虽然禁用，但需要保持格式）
            const picsArray = values.pics
                ? `[${values.pics.split('\n').filter(s => s.trim()).map(s => `"${s.trim()}"`).join(',')}]`
                : '[]';

            // 修改信息
            const res = await editStoreApi({
                id: editForm.id,
                name: values.name,
                avatar: editForm.avatar,
                bulletin: values.bulletin,
                description: values.description,
                date: dateArray,
                deliveryTime: values.deliveryTime,
                deliveryPrice: values.deliveryPrice,
                score: values.score,
                sellCount: values.sellCount,
                supports: supportsArray,
                pics: picsArray
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
        setRowInfo({ ...record, date: (record.date && record.date.length === 2) ? `${timeToDate(record.date[0])} - ${timeToDate(record.date[1])}` : '-' });
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
        avatar: <Avatar shape="square" src={`${baseURL}${item.avatar}`} alt="avatar" size="large" draggable={false} />,
        score: item.score,
        sellCount: item.sellCount,
        date: item.date,
        description: <Typography.Paragraph className={s.cardTitle} ellipsis={{ tooltip: item.description, rows: 1 }} style={{ maxWidth: 200, margin: 0 }}>{item.description}</Typography.Paragraph>,
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
                <Table classNames={{ root: s.tableRoot, header: { cell: s.tableHeader }, body: { cell: s.tableBody } }} columns={columns} dataSource={dataSource} loading={pageLoading} scroll={{ y: 55 * 8, x: 'max-content' }} pagination={false} />
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
                        classNames={{
                            item: s.paginationItem
                        }}
                        className={s.pagination}
                    />
                </Flex>
            </Flex>
            {/* 详情 */}
            < Modal
                title="店铺详情"
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
                    <Descriptions labelStyle={{ width: '20%' }} classNames={{ root: s.descRoot, label: s.descLabel, content: s.descContent }} column={2} style={{ width: '100%' }} size='small' bordered items={[
                        {
                            key: '1',
                            label: '店铺ID',
                            children: rowInfo.id,
                        },
                        {
                            key: '2',
                            label: '店铺名称',
                            children: rowInfo.name,
                        },
                        {
                            key: '3',
                            label: '店铺头像',
                            span: 2,
                            children: <Avatar shape="square" src={rowInfo.avatar} alt="avatar" size="large" draggable={false} />,
                        },
                        {
                            key: '4',
                            label: '公告',
                            span: 2,
                            children: rowInfo.bulletin,
                        },
                        {
                            key: '5',
                            label: '描述',
                            span: 2,
                            children: rowInfo.description,
                        },
                        {
                            key: '6',
                            label: '营业时间',
                            children: rowInfo.date,
                        },
                        {
                            key: '7',
                            label: '起送价',
                            children: '￥' + rowInfo.minPrice,
                        },
                        {
                            key: '8',
                            label: '配送时间',
                            children: rowInfo.deliveryTime + ' 分钟',
                        },
                        {
                            key: '9',
                            label: '配送费',
                            children: '￥' + rowInfo.deliveryPrice,
                        },
                    ]} />
                    <Divider classNames={{ root: s.dividerRoot, rail: s.divider, content: s.divider }} orientation="left">运营信息</Divider>
                    <Descriptions classNames={{ root: s.descRoot, label: s.descLabel, content: s.descContent }} column={2} style={{ width: '100%' }} bordered items={[
                        {
                            key: '1',
                            label: '评分',
                            children: rowInfo.rating,
                        },
                        {
                            key: '2',
                            label: '销量',
                            children: rowInfo.sellCount,
                        },
                        {
                            key: '3',
                            label: '活动',
                            span: 2,
                            children: <div>{rowInfo.supports && rowInfo.supports.length > 0 ? rowInfo.supports.map((act, index) => (
                                <><Typography.Text className={s.cardTitle} key={index}>{index + 1}：{act}</Typography.Text><br /></>
                            )) : '无活动'}</div>
                        },
                        {
                            key: '4',
                            label: '店铺图片',
                            span: 2,
                            children: <Carousel autoplay>
                                {rowInfo.pics && rowInfo.pics.length > 0 ? rowInfo.pics.map((img, index) => (
                                    <div key={index}>
                                        <img src={img} alt={`store-img-${index}`} style={{ width: '100%', maxHeight: '230px', objectFit: 'cover' }} draggable={false} />
                                    </div>
                                )) : <Typography.Text className={s.cardTitle}> 无店铺图片 </Typography.Text>
                                }
                            </Carousel>,
                        }
                    ]} />
                </Flex>
            </Modal >
            {/* 编辑 */}
            < Modal
                title="编辑店铺"
                width={800}
                open={editDia}
                footer={null}
                onCancel={() => setEditDia(false)}
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
                    onFinish={editStore}
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
                            label="店铺ID"
                            style={{ width: '23%' }}
                        >
                            <Input className={s.input} value={editForm.id} disabled />
                        </Form.Item>

                        <Form.Item
                            label="店铺名称"
                            name="name"
                            initialValue={editForm.name}
                            style={{ width: '23%' }}
                            rules={[{ required: true, message: '请输入店铺名称!' }]}
                        >
                            <Input className={s.input} allowClear placeholder="请输入店铺名称" />
                        </Form.Item>

                        <Form.Item
                            label="店铺头像"
                            name="avatar"
                            style={{ width: '23%' }}
                        >
                            <Input className={s.input} disabled placeholder="图片上传功能未启用" />
                        </Form.Item>

                        <Form.Item
                            label="店铺图片"
                            name="pics"
                            style={{ width: '23%' }}
                        >
                            <Input className={s.input} disabled placeholder="图片上传功能未启用" />
                        </Form.Item>

                        <Form.Item
                            label="配送时间（分钟）"
                            name="deliveryTime"
                            initialValue={editForm.deliveryTime}
                            style={{ width: '23%' }}
                            rules={[{ required: true, message: '请输入配送时间!' }]}
                        >
                            <InputNumber className={s.input} placeholder="请输入配送时间" min={0} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label="配送费"
                            name="deliveryPrice"
                            initialValue={editForm.deliveryPrice}
                            style={{ width: '23%' }}
                            rules={[{ required: true, message: '请输入配送费!' }]}
                        >
                            <InputNumber className={s.input} placeholder="请输入配送费" min={0} precision={2} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label="评分"
                            name="score"
                            initialValue={editForm.score}
                            style={{ width: '23%' }}
                            rules={[{ required: true, message: '请输入评分!' }]}
                        >
                            <InputNumber className={s.input} placeholder="请输入评分" min={0} max={5} precision={1} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label="销量"
                            name="sellCount"
                            initialValue={editForm.sellCount}
                            style={{ width: '23%' }}
                            rules={[{ required: true, message: '请输入销量!' }]}
                        >
                            <InputNumber className={s.input} placeholder="请输入销量" min={0} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label="公告"
                            name="bulletin"
                            initialValue={editForm.bulletin}
                            style={{ width: '48%' }}
                            rules={[{ required: true, message: '请输入公告!' }]}
                        >
                            <TextArea className={s.input} allowClear placeholder="请输入公告" rows={2} />
                        </Form.Item>

                        <Form.Item
                            label="描述"
                            name="description"
                            initialValue={editForm.description}
                            style={{ width: '48%' }}
                            rules={[{ required: true, message: '请输入描述!' }]}
                        >
                            <TextArea className={s.input} allowClear placeholder="请输入描述" rows={2} />
                        </Form.Item>

                        <Form.Item
                            label="营业时间"
                            name="date"
                            initialValue={editForm.date}
                            style={{ width: '48%' }}
                            rules={[{ required: true, message: '请选择营业时间!' }]}
                        >
                            <RangePicker
                                size="large"
                                showTime
                                placeholder={['开始时间', '结束时间']}
                                format={{
                                    format: 'YYYY-MM-DD HH:mm:ss',
                                    type: 'mask',
                                }}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="活动（每行一个）"
                            name="supports"
                            initialValue={editForm.supports}
                            style={{ width: '48%' }}
                            rules={[{ required: false }]}
                        >
                            <TextArea className={s.input} allowClear placeholder="每行输入一个活动，例如：\n玉米浓浓堡上心\n美团配送满25-5" rows={2} />
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
