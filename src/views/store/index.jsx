import { useEffect, useState } from 'react'
import dayjs from 'dayjs'; // TODO:由于antd日期组件依赖dayjs处理日期，这里也引入dayjs以避免报错
import { getStoreApi, uploadStoreImageApi, editStoreApi } from '../../api/storeApi';
import { EditOutlined, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Flex, Form, Input, TimePicker, Divider, Descriptions, Typography, Avatar, InputNumber, Upload, Spin, Image } from 'antd';
import { baseURL } from '../../utils/service';
const { TextArea } = Input;
const { Text } = Typography;
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

export default function store() {
    // ******************初始化变量、Hooks******************
    const [tableData, setTableData] = useState({});
    const [pageLoading, setPageLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false); // 通用确认加载状态，一般仅有一个弹窗
    const [editMod, setEditMod] = useState(false);
    const [editForm, setEditForm] = useState({});
    const { message } = App.useApp();
    const [form] = Form.useForm();

    // 头像上传
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarFileList, setAvatarFileList] = useState([]);
    const [avatarFileUrl, setAvatarFileUrl] = useState(null);

    // 图片集上传
    const [picsFileList, setPicsFileList] = useState([]);
    const [picsUrlMap, setPicsUrlMap] = useState({}); // uid -> filename

    // 共用预览
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined className={s.cardTitle} /><br />
            <Text className={s.cardTitle} style={{ marginTop: 8 }}>上传</Text>
        </button>
    );

    // 清除图片缓存
    const clearFileCache = () => {
        setAvatarFile(null);
        setAvatarFileList([]);
        setAvatarFileUrl(null);
        setPicsFileList([]);
        setPicsUrlMap({});
        setPreviewImage('');
    };

    // 图片预览
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
    };

    // 头像上传监听
    useEffect(() => {
        if (!avatarFile) return;
        const upload = async () => {
            try {
                const formData = new FormData();
                formData.append('file', avatarFile);
                const res = await uploadStoreImageApi(formData);
                if (res.code) {
                    message.error(`上传头像失败: ${res.msg}`);
                    setAvatarFileList(prev => prev.map(f => ({ ...f, status: 'error' })));
                    return;
                }
                const filename = res.imgUrl ? res.imgUrl.split('/').pop() : res.imgUrl;
                setAvatarFileUrl(filename);
            } catch (e) {
                setAvatarFileList(prev => prev.map(f => ({ ...f, status: 'error' })));
                message.error('上传头像失败');
            }
        };
        upload();
    }, [avatarFile]);

    // 头像变化
    const handleAvatarChange = ({ fileList: newFileList }) => setAvatarFileList(newFileList);

    // 图片集变化（处理删除）
    const handlePicsChange = ({ file, fileList: newFileList }) => {
        setPicsFileList(newFileList);
        if (file.status === 'removed') {
            setPicsUrlMap(prev => {
                const next = { ...prev };
                delete next[file.uid];
                return next;
            });
        }
    };

    // =========== 获取店铺信息 ==============
    const getTableData = async () => {
        setPageLoading(true);
        const res = await getStoreApi();
        if (res.code) {
            setTableData({});
            setPageLoading(false);
            return message.error('获取店铺信息失败');
        }
        // 时间预处理
        const showDate = res.data.date?.map((item) => item.split(' ').pop());
        // 公告预处理
        const showBulletin = res.data.bulletin.split('\r\n');
        // 图片预处理
        const pics = res.data.pics?.map((url) => baseURL + url); // 后续不作用，破坏性修改
        setTableData({ ...res.data, showDate, showBulletin, pics });
        setPageLoading(false);
        setConfirmLoading(false);
    }

    useEffect(() => {
        getTableData();
    }, []); // TODO:首屏渲染之后才执行

    // ============ 预览部分 ==============
    const tableItems = [
        {
            label: '头像',
            children: <Avatar shape="square" size='large' src={baseURL + tableData.avatar} />,
        },
        {
            label: '名称',
            children: <Text className={s.cardTitle}>{tableData.name}</Text>,
        },
        {
            label: '评分',
            children: <><Text className={s.cardTitle} strong>{tableData.score}</Text><Text className={s.cardTitle}> / 5</Text></>,
        },
        {
            label: '销量',
            children: <Text className={s.cardTitle}>{tableData.sellCount}</Text>,
        },
        {
            label: '营业时间',
            children: <Text className={s.cardTitle}>{tableData.showDate ? tableData.showDate.join(' ~ ') : '暂未设置'}</Text>,
        },
        {
            label: '配送时间',
            children: <Text className={s.cardTitle}>{tableData.deliveryTime} 分钟</Text>,
        },
        {
            label: '起送',
            children: <Text className={s.cardTitle}>￥ {tableData.minPrice}</Text>,
        },
        {
            label: '配送',
            children: <Text className={s.cardTitle} strong>￥ {tableData.deliveryPrice}</Text>,
        },
        {
            label: '描述',
            span: 2,
            children: <Text className={s.cardTitle}>{tableData.description}</Text>,
        },
        {
            label: '活动',
            span: 2,
            children: tableData.supports?.map((e, index) => { // TODO:加?确保在首次渲染时不会因为supports未定义而报错
                return (<div key={index}>
                    <Text className={s.cardTitle}>{e}</Text>
                    <br />
                </div>
                )
            })
        },
        {
            label: '公告',
            span: 4,
            children: tableData.showBulletin?.map((e, index) => {
                return (<div key={index}>
                    <Text className={s.cardTitle}>{e}</Text>
                    <br />
                </div>
                )
            })
        },
        {
            label: '图片',
            span: 4,
            children: <Flex gap='small' wrap>
                {
                    tableData.pics ? tableData.pics.map((url, index) => (
                        <Image
                            src={url}
                            alt={`店铺图片${index + 1}`}
                            preview={false}
                            style={{ height: '20vh', objectFit: 'contain' }}
                        />
                    )) : null
                }
            </Flex>
        }
    ];

    // ============ 编辑店铺 ==============
    const openEdit = (item) => {
        clearFileCache();
        setEditMod(true);
        // 处理日期范围
        const dateRange = (item.date && item.date.length === 2)
            ? [dayjs(item.date[0]), dayjs(item.date[1])]
            : null;

        // 处理数组字段：将字符串数组转为文本
        const supportsText = item.supports && item.supports.length > 0
            ? item.supports.join('\n')
            : '';

        // 初始化头像
        if (item.avatar) {
            const avatarFilename = item.avatar.split('/').pop();
            setAvatarFileList([{
                uid: '-1',
                name: avatarFilename,
                status: 'done',
                url: baseURL + item.avatar,
            }]);
            setAvatarFileUrl(avatarFilename);
        }

        // 初始化图片集
        if (item.pics && item.pics.length > 0) {
            const urlMap = {};
            const fileList = item.pics.map((url, i) => {
                const filename = url.split('/').pop();
                const uid = `existing-${i}`;
                urlMap[uid] = filename;
                return {
                    uid,
                    name: filename,
                    status: 'done',
                    url: url, // pics已拼接baseURL
                };
            });
            setPicsFileList(fileList);
            setPicsUrlMap(urlMap);
        }

        setEditForm({
            ...item,
            date: dateRange,
            supports: supportsText,
        })
    }
    const editStore = async (values) => {
        try {
            setConfirmLoading(true);

            // 处理日期范围：转换为字符串数组的JSON格式
            const dateArray = values.date && values.date.length === 2
                ? JSON.stringify([values.date[0].format('YYYY-MM-DD HH:mm:ss'), values.date[1].format('YYYY-MM-DD HH:mm:ss')])
                : '[]';

            // 处理活动字段：将每行文本转为字符串数组的JSON格式
            const supportsArray = JSON.stringify(
                values.supports
                    ? values.supports.split('\n').map(line => line.trim()).filter(line => line)
                    : []
            );

            // 处理头像：使用上传后的文件名，若未修改则保留原值
            const avatarValue = avatarFileUrl || editForm.avatar?.split('/').pop() || '';

            // 处理图片集：从 picsUrlMap 中按 fileList 顺序提取文件名，保存为JSON字符串数组
            const picsArray = JSON.stringify(
                picsFileList.map(f => picsUrlMap[f.uid]).filter(Boolean)
            );

            // 修改信息
            const res = await editStoreApi({
                id: editForm.id,
                name: values.name,
                bulletin: values.bulletin,
                avatar: avatarValue,
                deliveryPrice: values.deliveryPrice,
                deliveryTime: values.deliveryTime,
                description: values.description,
                score: values.score,
                sellCount: values.sellCount,
                supports: supportsArray,
                date: dateArray,
                pics: picsArray
            });

            if (res.code) {
                setConfirmLoading(false);
                message.error(`修改店铺信息失败: ${res.msg}`);
                return;
            }
            setEditForm({});
            form.resetFields(); // 重置表单
            clearFileCache(); // 清除图片缓存
            getTableData();
            setConfirmLoading(false);
            setEditMod(false);
            message.success('店铺信息已更新');
        } catch (error) {
            setConfirmLoading(false);
            message.error(`修改店铺信息失败: ${error.message}`);
        }
    }

    return (
        <Card classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle }} variant="borderless" style={{ width: '100%' }}>
            {
                editMod ?
                    (
                        // 编辑部分
                        <Flex vertical justify="center" align="center" style={{ width: '100%' }} gap="small" >
                            <Form
                                form={form}
                                name="editStore"
                                layout='vertical'
                                style={{ width: '100%' }}
                                initialValues={editForm}
                                onFinish={editStore}
                                autoComplete="off"
                                classNames={{
                                    label: s.formLabel
                                }}
                            >
                                {/* ========== 图片上传区 ========== */}
                                {/* TODO: 使用flex 0 0 自动可以固定组件大小，更好的做列表布局 */}
                                <Divider classNames={{ root: s.dividerRoot, rail: s.divider, content: s.divider }}>图片管理</Divider>
                                <Flex gap="large" wrap>
                                    <div style={{ flex: '0 0 auto' }}>
                                        <Text className={s.cardTitle} style={{ marginBottom: '8px', fontWeight: 500 }}>头像</Text>
                                        <ImgCrop rotationSlider>
                                            <Upload
                                                beforeUpload={file => {
                                                    setAvatarFile(file);
                                                    return false;
                                                }}
                                                listType="picture-card"
                                                fileList={avatarFileList}
                                                onPreview={handlePreview}
                                                onChange={handleAvatarChange}
                                            >
                                                {avatarFileList.length >= 1 ? null : uploadButton}
                                            </Upload>
                                        </ImgCrop>
                                    </div>
                                    <div style={{ flex: '1 1 auto', minWidth: '300px' }}>
                                        <Text className={s.cardTitle} style={{ marginBottom: '8px', fontWeight: 500 }}>图片集</Text>
                                        <ImgCrop rotationSlider>
                                            <Upload
                                                beforeUpload={file => {
                                                    const uploadFile = async () => {
                                                        try {
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            const res = await uploadStoreImageApi(formData);
                                                            if (res.code) {
                                                                message.error(`上传图片失败: ${res.msg}`);
                                                                return;
                                                            }
                                                            const filename = res.imgUrl ? res.imgUrl.split('/').pop() : res.imgUrl;
                                                            setPicsUrlMap(prev => ({ ...prev, [file.uid]: filename }));
                                                        } catch (e) {
                                                            message.error('上传图片失败');
                                                        }
                                                    };
                                                    uploadFile();
                                                    return false;
                                                }}
                                                listType="picture-card"
                                                fileList={picsFileList}
                                                onPreview={handlePreview}
                                                onChange={handlePicsChange}
                                            >
                                                {uploadButton}
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
                                    </div>
                                </Flex>

                                {/* ========== 基础信息区 ========== */}
                                <Divider classNames={{ root: s.dividerRoot, rail: s.divider, content: s.divider }}>基础信息</Divider>
                                <Flex gap="middle" wrap>
                                    <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入店铺名称!' }]} style={{ flex: '0 0 calc(33% - 12px)' }}>
                                        <Input className={s.input} placeholder="请输入店铺名称" />
                                    </Form.Item>
                                    <Form.Item label="评分" name="score" rules={[{ required: true, message: '请输入店铺评分!' }]} style={{ flex: '0 0 calc(33% - 12px)' }}>
                                        <InputNumber className={s.input} min={0} max={5} step={0.1} style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item label="销量" name="sellCount" rules={[{ required: true, message: '请输入店铺销量!' }]} style={{ flex: '0 0 calc(33% - 12px)' }}>
                                        <InputNumber className={s.input} min={0} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Flex>

                                {/* ========== 营业时间 & 配送信息区 ========== */}
                                <Divider >营业与配送</Divider>
                                <Flex gap="middle" wrap>
                                    <Form.Item label="营业时间" name="date" rules={[{ required: true, message: '请选择营业时间!' }]} style={{ flex: '0 0 calc(25% - 12px)' }}>
                                        <TimePicker.RangePicker className={s.input} format={'HH:mm:ss'} showTime style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item label="起送价" name="minPrice" rules={[{ required: true, message: '请输入起送价!' }]} style={{ flex: '0 0 calc(25% - 12px)' }}>
                                        <InputNumber className={s.input} min={0} prefix="￥" style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item label="配送费" name="deliveryPrice" rules={[{ required: true, message: '请输入配送费!' }]} style={{ flex: '0 0 calc(25% - 12px)' }}>
                                        <InputNumber className={s.input} min={0} prefix="￥" style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item label="配送时间" name="deliveryTime" rules={[{ required: true, message: '请输入配送时间!' }]} style={{ flex: '0 0 calc(25% - 12px)' }}>
                                        <InputNumber className={s.input} min={0} suffix="分钟" controls={false} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Flex>

                                {/* ========== 文本信息区 ========== */}
                                <Divider classNames={{ root: s.dividerRoot, rail: s.divider, content: s.divider }}>描述与公告</Divider>
                                <Flex gap="middle" wrap>
                                    <Form.Item label="描述" name="description" style={{ flex: '0 0 calc(33% - 12px)' }}>
                                        <TextArea className={s.input} rows={5} placeholder="请输入店铺描述" />
                                    </Form.Item>
                                    <Form.Item label="活动" name="supports" style={{ flex: '0 0 calc(33% - 12px)' }}>
                                        <TextArea className={s.input} rows={5} placeholder="每行一个活动" />
                                    </Form.Item>
                                    <Form.Item label="公告" name="bulletin" style={{ flex: '0 0 calc(33% - 12px)' }}>
                                        <TextArea className={s.input} rows={5} placeholder="请输入店铺公告" />
                                    </Form.Item>
                                </Flex>

                                <Flex justify="center" gap="large">
                                    <Button className={s.cardRoot} color='lime' variant="outlined" onClick={() => { clearFileCache(); setEditMod(false); }} icon={<ArrowLeftOutlined />}>
                                        返回预览
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={confirmLoading}>
                                        保存修改
                                    </Button>
                                </Flex>
                            </Form>
                        </Flex>
                    )
                    : (
                        // 预览部分
                        <Spin spinning={pageLoading}>
                            <Flex justify="end" align="center" style={{ width: '100%', marginBottom: '10px' }} gap="small" >
                                <Button className={s.cardRoot} color="primary" variant="outlined" onClick={() => openEdit(tableData)} icon={<EditOutlined />}>
                                    编辑店铺
                                </Button>
                            </Flex>
                            <Descriptions
                                classNames={{ root: s.descRoot, label: s.descLabel, content: s.descContent }}
                                bordered
                                column={4}
                                items={tableItems}
                            />
                        </Spin>
                    )
            }
        </Card >
    )
}
