import { useState, useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';
import html2canvas from 'html2canvas';

// 载入验证码组件：在 generateCode 中一次性生成所有随机值，渲染只使用已保存的样式
export default function VCode(props) {
    const [captcha, setCaptcha] = useState('');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [charStyles, setCharStyles] = useState([]);
    const [showText, setShowText] = useState(false);
    const [loading, setLoading] = useState(true);

    // 生成验证码图片
    const generateImage = async (code) => {
        // 1. 获取目标 DOM
        const textDom = document.querySelector('#verifyCodeText');
        // 2. 调用 html2canvas 生成 Canvas
        const canvas = await html2canvas(textDom, {
            scale: Math.random() + 0.5, // 随机缩放 0.5-1.5倍，增加干扰
            useCORS: true, // 允许跨域图片（如网络图片）
            logging: false, // 关闭控制台日志
            backgroundColor: null // 默认背景透明，保持验证码背景色
        });
        // 3. Canvas 转为 Base64 图片（TODO: jpeg不支持透明度，背景会丢失透明导致黑边，需要用png）
        const base64Img = canvas.toDataURL('image/png', 1.0); // 1.0 表示质量（0-1）
        // 4. 预览图片
        document.querySelector('#verifyCode').src = base64Img;

        // 回调父组件
        setShowText(false); // 隐藏文本，显示图片
        setLoading(false);

        props.setCaptcha && props.setCaptcha(code);
    }

    // 生成验证码字符串和样式
    const generateCode = () => {
        setLoading(true);
        // 定义字符集，排除容易混淆的字符
        let numbers = '23456789'; // 排除 0,1
        let upperLetters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // 排除 I,O
        let lowerLetters = 'abcdefghijkmnpqrstuvwxyz'; // 排除 l,o

        // 生成验证码字符串（至少包含一个数字和一个大写字母）
        let code = '';
        code += numbers.charAt(Math.floor(Math.random() * numbers.length));
        code += upperLetters.charAt(Math.floor(Math.random() * upperLetters.length));
        let allChars = numbers + upperLetters + lowerLetters;
        for (let i = code.length; i < 5; i++) {
            code += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }

        // 为每个字符一次性生成样式对象并保存到 state
        const styles = code.split('').map(() => {
            const rotation = Math.random() * 30 - 15; // -15到15度
            const marginLeft = 7 - Math.random() * 10; // -3到7px
            const fontSize = 21 - Math.random() * 3; // 18-21px
            const color = `rgb(${Math.floor(Math.random() * 128)}, 0, 255)`;
            const fontWeight = Math.random() > 0.8 ? 'bold' : 'normal';
            const textDecoration = Math.random() > 0.6 ? 'line-through' : 'none';

            return {
                transform: `rotate(${rotation}deg)`,
                marginLeft: `${marginLeft}px`,
                fontSize: `${fontSize}px`,
                color,
                fontWeight,
                textDecoration,
                display: 'inline-block'
            };
        });

        // 更新 state 并调用转图片
        setShowText(true); // 先显示文本，确保 html2canvas 能正确渲染
        setCaptcha(code);
        setBgColor(`#66cc${Math.floor((Math.random() * 40) + 60)}`); // 随机颜色背景，增加干扰
        setCharStyles(styles); // 保存样式对象数组
    };

    // 初始生成验证码
    useEffect(() => {
        generateCode();
    }, [props.fresh]);

    // 监听验证码变化，生成图片
    useEffect(() => {
        if (showText && captcha) {
            generateImage(captcha, charStyles);
        }
    }, [showText]);

    if (!captcha) return null;

    // TODO:随机值每次渲染都会重新计算，React会在变化时重新渲染一次，导致疯狂变换。解决方案：在生成验证码时一次性生成所有随机值，并保存到 state 中，渲染时只使用已保存的样式对象，避免每次渲染都重新计算随机值。
    return <>
        <Spin spinning={loading} indicator={<LoadingOutlined spin />} size="small" >
            <img onClick={generateCode} id="verifyCode" className={"verifyCode a"}></img>
        </Spin>
        {
            showText && <div id="verifyCodeText" className={"verifyCodeText"} style={{ backgroundColor: bgColor }}>
                {
                    captcha.split('').map((char, index) => (
                        <span key={index} style={charStyles[index]}>
                            {char}
                        </span>
                    ))
                }
            </div>
        }
    </>
}