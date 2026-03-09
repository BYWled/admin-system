import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userInfoApi, checkPassApi, changePassApi } from '../../api/userApi'
import { changeAvatarApi, editUserAvatarApi } from '../../api/userListApi'
import VCode from '../../utils/verifyCode'
import { LockOutlined, SunFilled, MoonFilled, BorderTopOutlined, BorderLeftOutlined, CheckOutlined, LogoutOutlined, EditOutlined, FullscreenOutlined, PlusOutlined } from '@ant-design/icons'
import { App, Drawer, Flex, Modal, Input, Card, Typography, Form, Button, Switch, Image, Upload } from 'antd'
import s from '../../styles/layout.module.scss'
import ImgCrop from 'antd-img-crop';
import { baseURL } from '../../utils/service'

// 将文件转换为Base64格式，供图片预览使用
const getBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

export default function RightMenu(props) {
    // ******************初始化变量、Hooks******************
    const { Text } = Typography;
    const { message } = App.useApp();
    const { navigate } = useNavigate();
    const [userInfo, setUserInfo] = useState({});
    const [lockDialogVisible, setLockDialogVisible] = useState(false);
    const [lockPassword, setLockPassword] = useState('');
    const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [inCaptcha, setInCaptcha] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [fresh, setFresh] = useState(0); // 用于刷新验证码
    const { id, role } = localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')) : {};
    // 图片预览相关
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [file, setFile] = useState(null);
    const [fileList, setFileList] = useState([
        {
            uid: '-1',
            name: '头像',
            status: 'done',
            url: 'https://www.wled.top/images/Oz-Vessalius-avatar.svg',
        }
    ]);

    // ******************副作用函数部分，用作生命周期与监听******************
    // 获取用户信息
    const fetchUserInfo = async () => {
        try {
            const res = await userInfoApi({ id });
            if (!res.accountInfo) message.error('用户信息不存在');
            setUserInfo(res.accountInfo);
            // 如果不是默认头像则设置上传组件的fileList以显示当前头像
            if (res.accountInfo.imgUrl !== "default.jpg") {
                setFileList([{
                    uid: '-1',
                    name: '头像',
                    status: 'done',
                    url: `${baseURL}${res.accountInfo.imgUrl}`
                }]);
            }

        } catch (e) {
            message.error('获取用户信息失败');
            console.error('获取用户信息失败:', e);
            localStorage.removeItem('admin');
            navigate('/login', { replace: true });
        }
    };
    useEffect(() => {
        fetchUserInfo();
    }, []);

    // 文件上传监听，上传成功后调用修改头像接口并更新用户信息
    useEffect(() => {
        const uploadAvatar = async () => {
            if (file) {
                try {
                    // 调用修改头像接口
                    const formData = new FormData();
                    formData.append('id', id);
                    formData.append('file', file);
                    const res = await changeAvatarApi(formData);
                    if (res.code) {
                        message.error('修改头像失败');
                        setFileList([{ ...fileList[0], status: 'error' }]);
                        return;
                    }
                    message.success('头像上传成功');
                    await editUserAvatarApi({ id, imgUrl: res.imgUrl });
                    if (res.code) {
                        message.error('修改头像失败');
                        setFileList([{ ...fileList[0], status: 'error' }]);
                        return;
                    }
                    message.success('头像修改成功');
                    // 更新用户信息
                    fetchUserInfo();
                } catch (e) {
                    setFileList([{ ...fileList[0], status: 'error' }]);
                    message.error('修改头像失败');
                    console.error('修改头像失败:', e);
                }
            }
        };
        uploadAvatar();
    }, [file]);

    // 刷新验证码
    useEffect(() => {
        setFresh(fresh + 1);
    }, [passwordDialogVisible]);
    // ******************函数部分******************
    // 确认锁屏
    const confirmLock = () => {
        if (props.tLockScreen) props.tLockScreen(lockPassword);
        setLockDialogVisible(false);
        props.tRightMenu();
    }

    // 修改密码
    const confirmPassword = async () => {
        // 是否为错误输入
        let isError = false;
        // 为空验证
        if (!oldPassword) {
            message.error('旧密码不能为空');
            isError = true;
        }
        if (!newPassword) {
            message.error('新密码不能为空');
            isError = true;
        }
        if (!confirmNewPassword) {
            message.error('请确认新密码');
            isError = true;
        }

        if (!inCaptcha) {
            message.error('请输入验证码');
            isError = true;
        }

        // 两次密码验证
        if (newPassword !== confirmNewPassword) {
            message.error('两次输入的新密码不一致');
            isError = true;
        }

        // 验证码验证
        if (inCaptcha.toLowerCase() !== captcha.toLowerCase()) {
            message.error('验证码错误');
            isError = true;
        }

        // 为错误则刷新验证码并返回
        if (isError) {
            // 刷新验证码
            setFresh(fresh + 1);
            return;
        }

        // 旧密码验证
        const oldPass = await checkPassApi({ id, oldPwd: oldPassword });
        // 旧密码返回值有code字段或code字段不为0则表示错误
        if (oldPass.code) {
            message.error(oldPass.msg || '旧密码错误');
            setFresh(fresh + 1);
            return;
        }


        // 修改密码请求
        const changeRes = await changePassApi({ id, newPwd: newPassword, oldPwd: oldPassword });
        if (changeRes.code) {
            message.error(changeRes.msg || '修改密码失败');
            setFresh(fresh + 1);
            return;
        }


        changeRes.msg ? message.success(changeRes.msg) : message.success('修改密码成功');

        // 重置对话框状态
        setPasswordDialogVisible(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setInCaptcha('');
    }

    // 图片预览相关
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
    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined className={s.cardTitle} /><br />
            <Text className={s.cardTitle} style={{ marginTop: 8 }}>上传</Text>
        </button>
    );

    return <Drawer open={props.rightMenu} onClose={props.tRightMenu} closable={false} destroyOnHidden={true} mask={{ blur: false }} placement="right"
        size={'20vw'} title="设置" footer={null}
        styles={{
            section: {
                color: 'var(--textColor)',
                backgroundColor: 'var(--backColor)',
            },
            body: { paddingTop: '0' }
        }}>
        <Flex vertical={true} justify='space-between' style={{ width: '100%', height: '100%' }}>
            {/* 卡片区域 */}
            <Flex vertical={true} gap="2vh" className={s.rightMenuCardArea}>
                {/* 时间显示 */}
                <p style={{ fontSize: '5vh', fontWeight: 'bold', margin: '0', fontFamily: 'Roboto Mono' }}>
                    {props.time.toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>

                {/* 个人信息 */}
                <Card
                    classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle }}
                    style={{ width: '100%' }}
                    type="inner"
                    title="个人信息"
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
                    <div className={s.cardTitle}><Text className={s.cardTitle} strong>用户Id：</Text>{userInfo.id || id}</div>
                    {userInfo.account && <div className={s.cardTitle}><Text className={s.cardTitle} strong>用户名：</Text> {userInfo.account}</div>}
                    <div className={s.cardTitle}><Text className={s.cardTitle} strong>用户角色：</Text> {userInfo.userGroup || role}</div>
                </Card>

                {/* 主题设置 */}
                <Card
                    classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle }}
                    style={{ width: '100%' }}
                    type="inner"
                    title="主题设置"
                    extra={<FullscreenOutlined
                        style={{ color: props.fullscreen ? '#1677ff' : 'var(--textColor)' }}
                        className={'a'}
                        onClick={props.tFullscreen}
                    />}
                >
                    <Flex gap="small" wrap justify="space-between">
                        <Flex
                            vertical={true}
                            align="center"
                            gap="8px"
                            onClick={() => props.darkMode && props.tDarkMode()}
                            className={`${s.menuThemeBox} ${s.cardTitle}`}
                            style={{
                                border: !props.darkMode ? '2px solid #1677ff' : '2px solid #d9d9d9'
                            }}
                        >
                            <SunFilled style={{ fontSize: '24px', color: !props.darkMode ? '#1677ff' : 'inherit' }} />
                            <Text className={s.cardTitle}>亮色主题</Text>
                            {!props.darkMode && <CheckOutlined className={s.menuCheckout} />}
                        </Flex>
                        <Flex
                            vertical={true}
                            align="center"
                            gap="8px"
                            onClick={() => !props.darkMode && props.tDarkMode()}
                            className={`${s.menuThemeBox} ${s.cardTitle}`}
                            style={{
                                border: props.darkMode ? '2px solid #1677ff' : '2px solid #d9d9d9'
                            }}
                        >
                            <MoonFilled style={{ fontSize: '24px', color: props.darkMode ? '#1677ff' : 'inherit' }} />
                            <Text className={s.cardTitle}>暗色主题</Text>
                            {props.darkMode && <CheckOutlined className={s.menuCheckout} />}
                        </Flex>
                        <Flex
                            vertical={true}
                            align="center"
                            gap="8px"
                            onClick={() => props.topMenuMode && props.tTopMenuMode()}
                            className={`${s.menuThemeBox} ${s.cardTitle}`}
                            style={{
                                border: !props.topMenuMode ? '2px solid #1677ff' : '2px solid #d9d9d9'
                            }}
                        >
                            <BorderLeftOutlined style={{ fontSize: '24px', color: !props.topMenuMode ? '#1677ff' : 'inherit' }} />
                            <Text className={s.cardTitle}>左侧菜单</Text>
                            {!props.topMenuMode && <CheckOutlined className={s.menuCheckout} />}
                        </Flex>
                        <Flex
                            vertical={true}
                            align="center"
                            gap="8px"
                            onClick={() => !props.topMenuMode && props.tTopMenuMode()}
                            className={`${s.menuThemeBox} ${s.cardTitle}`}
                            style={{
                                border: props.topMenuMode ? '2px solid #1677ff' : '2px solid #d9d9d9'
                            }}
                        >
                            <BorderTopOutlined style={{ fontSize: '24px', color: props.topMenuMode ? '#1677ff' : 'inherit' }} />
                            <Text className={s.cardTitle}>顶部菜单</Text>
                            {props.topMenuMode && <CheckOutlined className={s.menuCheckout} />}
                        </Flex>
                    </Flex>
                </Card>
                <Flex justify="space-between" align="center">
                    <Text className={s.cardTitle}>显示页脚：</Text>
                    <Switch disabled={props.fullscreen} checked={props.footerMode} onChange={props.tFooterMode} />
                </Flex>
            </Flex>

            {/* 按钮区域 */}
            <Flex vertical={true} justify="space-between" gap='small' style={{ width: '100%' }}>
                <Button className={s.cardRoot} color="primary" variant="outlined" icon={<LockOutlined />} onClick={() => setLockDialogVisible(true)}>锁定屏幕</Button>
                <Button className={s.cardRoot} color="gold" variant="outlined" icon={<EditOutlined />} onClick={() => setPasswordDialogVisible(true)}>修改密码</Button>
                <Button className={s.cardRoot} danger icon={<LogoutOutlined />} onClick={props.logout}>退出登录</Button>
            </Flex>

            {/* 对话框 */}
            <Modal
                classNames={{
                    container: s.modalContainer,
                    header: s.modalHeader,
                    title: s.modalTitle,
                    body: s.modalBody,
                    footer: s.modalFooter
                }}
                open={lockDialogVisible}
                title="锁屏"
                onOk={confirmLock}
                okText="确认并锁屏"
                closable={false}
                onCancel={() => setLockDialogVisible(false)}
                cancelText="取消"

            >
                <Input.Password className={s.input} value={lockPassword} onChange={e => setLockPassword(e.target.value)} placeholder="请输入锁屏密码" />
            </Modal>

            <Modal
                classNames={{
                    container: s.modalContainer,
                    header: s.modalHeader,
                    title: s.modalTitle,
                    body: s.modalBody,
                    footer: s.modalFooter
                }}
                open={passwordDialogVisible}
                title="修改密码"
                onOk={confirmPassword}
                okText="确认修改"
                closable={false}
                onCancel={() => setPasswordDialogVisible(false)}
                cancelText="取消"
            >
                <Form
                    name='changePassword'
                    layout="horizontal"
                    requiredMark={false}
                    labelAlign="right"
                    labelCol={{ span: 5 }}
                    style={{ padding: '16px 16px 0 0' }}
                    classNames={{
                        label: s.formLabel
                    }}
                >
                    <Form.Item validateTrigger="onBlurCapture" rules={[{ required: true, message: '请输入旧密码' }]} label="旧密码" name="oldPassword">
                        <Input.Password className={s.input} value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="请输入旧密码" />
                    </Form.Item>
                    <Form.Item validateTrigger="onBlurCapture" rules={[{ required: true, message: '请输入新密码' }]} label="新密码" name="password">
                        <Input.Password className={s.input} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="请输入新密码" />
                    </Form.Item>
                    <Form.Item validateTrigger="onBlurCapture" dependencies={['password']}
                        rules={[{ required: true, message: '请确认新密码' }, ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) return Promise.resolve();
                                return Promise.reject(new Error('请确保两次输入的新密码一致'));
                            },
                        }),]} label="确认新密码" name="confirmPassword">
                        <Input.Password className={s.input} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="请确认新密码" />
                    </Form.Item>
                    <Form.Item validateTrigger="onBlurCapture" rules={[{ required: true, message: '请输入验证码' }]} label="验证码" name="vCode">
                        <Flex gap="small" align="center">
                            <Input className={s.input} value={inCaptcha} onChange={e => setInCaptcha(e.target.value)} placeholder="请输入验证码" />
                            <VCode setCaptcha={setCaptcha} fresh={fresh} />
                        </Flex>
                    </Form.Item>
                </Form>
            </Modal>
        </Flex >
    </Drawer >

}