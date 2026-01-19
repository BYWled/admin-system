import { useState, useEffect } from 'react';

// 载入验证码组件：在 generateCode 中一次性生成所有随机值，渲染只使用已保存的样式
export default function VCode(props) {
    const [captcha, setCaptcha] = useState('');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [charStyles, setCharStyles] = useState([]);

    const generateCode = () => {
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

        // 更新 state 并回调父组件
        setCaptcha(code);
        setBgColor(`#cccc${Math.floor((Math.random() * 40) + 60)}`);
        setCharStyles(styles);
        props.setCaptcha && props.setCaptcha(code);
    };

    // 初始生成验证码
    useEffect(() => {
        generateCode();
    }, [props.fresh]);

    if (!captcha) return null;

    // TODO:随机值每次渲染都会重新计算，React会在变化时重新渲染一次，导致疯狂变换。
    return <div onClick={generateCode} style={{ cursor: 'pointer', height: '32px', width: '50%', padding: '1px', borderRadius: '4px', backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
        {
            captcha.split('').map((char, index) => (
                <span key={index} style={charStyles[index] || { display: 'inline-block' }}>
                    {char}
                </span>
            ))
        }
    </div>;
}