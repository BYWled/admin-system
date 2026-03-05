import { App, Avatar, Button, Card, Empty, Flex, Spin, Statistic, Typography } from "antd";
import { useState, useEffect } from "react";
import { ArrowDownOutlined, ArrowUpOutlined, InfoCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import * as echarts from "echarts";
import s from "../../styles/layout.module.scss";
import logo from "../../assets/logo.svg";
import { getStatsApi } from "../../api/echartsApi";
import CountUp from 'react-countup';


export default function home() {
    const { message } = App.useApp();
    const [emptyCharts, setEmptyCharts] = useState(false);
    const [loading, setLoading] = useState(false);
    const [salutation, setSalutation] = useState('你好');
    const [roleName, setRoleName] = useState('管理员');
    const [userMaxUp, setUserMaxUp] = useState(0);
    const [userMaxDown, setUserMaxDown] = useState(0);
    const [orderMaxUp, setOrderMaxUp] = useState(0);
    const [orderMaxDown, setOrderMaxDown] = useState(0);
    const [allOrders, setAllOrders] = useState(0);
    const [allSales, setAllSales] = useState(0);

    const getTableData = async () => {
        setLoading(true);
        const res = await getStatsApi();
        if (res.code) {
            message.error(res.msg || '获取用户统计失败');
        }
        // 处理数据格式
        if (!res.data || res.data.source.length === 0) {
            setEmptyCharts(true);
            return message.info('暂无用户统计数据');
        };

        // 处理图表
        const chartLegendData = [];
        const chartLegendSelected = [];
        const echartsDom = document.querySelector('#echartsStats');
        const echartsTable = echarts.init(echartsDom);
        const chartSeries = res.data.source.map(item => {
            // 处理最大涨幅和降幅
            if (item.type === '注册人数') {
                let lastNum = item.data[0];
                item.data.forEach(num => {
                    const change = lastNum === 0 ? 0 : ((num - lastNum) / lastNum) * 100;
                    if (change > userMaxUp) setUserMaxUp(change.toFixed(2));
                    if (change < userMaxDown) setUserMaxDown(change.toFixed(2));
                    lastNum = num;
                });
            }
            if (item.type === '订单') {
                let lastNum = item.data[0];
                item.data.forEach(num => {
                    const change = lastNum === 0 ? 0 : ((num - lastNum) / lastNum) * 100;
                    if (change > orderMaxUp) setOrderMaxUp(change.toFixed(2));
                    if (change < orderMaxDown) setOrderMaxDown(change.toFixed(2));
                    lastNum = num;
                });
            }

            // 计算总销售额
            item.type === '销售额' && setAllSales(item.data.reduce((a, b) => a + b, 0));
            item.type === '订单' && setAllOrders(item.data.reduce((a, b) => a + b, 0));

            // 处理图表数据
            chartLegendData.push(item.type);
            chartLegendSelected.push({ [item.type]: true });
            return {
                name: item.type,
                stack: 'x',
                type: 'line',
                data: item.data
            }
        });
        echartsTable.setOption({
            xAxis: { data: res.data.date },
            yAxis: {},
            legend: {
                type: 'scroll',
                orient: 'horizontal',
                right: 10,
                top: 10,
                data: chartLegendData,
                selected: chartLegendSelected
            },
            tooltip: {
                trigger: 'axis'
            },
            series: chartSeries
        });
        // 监听图标自适应
        const resizeObserver = new ResizeObserver(() => echartsTable.resize());
        resizeObserver.observe(echartsDom);

        setLoading(false);
    }

    // 初始化
    useEffect(() => {
        // 刷新数据
        getTableData();

        // 设置问候语
        const nowTime = (Temporal.Now.plainDateTimeISO().hour / 6);
        if (nowTime || nowTime === 0) {
            switch (Math.floor(nowTime)) {
                case 0:
                    setSalutation('夜深了，注意休息🌙');
                    break;
                case 1:
                    setSalutation('上午好，新的一天开始了(*^▽^*)');
                    break;
                case 2:
                    setSalutation('下午好，就快下班了💪');
                    break;
                case 3:
                    setSalutation('晚上好，一天的工作结束了🌟');
                    break;
            }
        }

        // 寻找身份
        const { role } = localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')) : {};
        if (role) setRoleName(role);
    }, []);

    return (
        <Spin spinning={loading} size="large">
            <Flex wrap gap="20px">
                <Flex vertical gap="20px" style={{ width: 'calc(33% - 10px)' }}>
                    <Card classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle }} variant="borderless" title={salutation} style={{ width: '100%', height: 'calc(50vh + 20px)' }} >
                        <Flex justify="center" align="center" gap={"large"} wrap style={{ width: '100%', height: '100%' }} >
                            <Typography.Title className={s.cardTitle} level={4} style={{ margin: '5px' }} >欢迎使用 React Admin System</Typography.Title>
                            <div style={{ width: '100%', textAlign: 'center' }} >
                                <Avatar size={80} src={logo} />
                            </div>
                            <Typography.Text className={s.cardGary} >当前版本 v1.0.0</Typography.Text>
                            <Typography.Text className={s.cardGary} >开发者：BYWled</Typography.Text>
                            <Typography.Text className={s.cardTitle} italic>当前身份：{<Typography.Text className={s.cardTitle} mark>{roleName}</Typography.Text>}，如果身份有误，可能导致页面权限异常</Typography.Text>
                            <Button type="primary" href="https://www.wled.top" target="_blank" rel="noopener noreferrer" >访问开发者主页</Button>
                        </Flex>
                    </Card>
                    <Card classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle, body: s.homeCardBody }} variant="borderless" style={{ width: '100%', height: '25vh' }} title="总销售数据" >
                        <Flex style={{ height: "100%" }} justify="space-evenly" align="center">
                            <Flex wrap align="center">
                                <Typography.Text className={s.cardGary} style={{ width: '100%' }} >总订单数</Typography.Text>
                                <Statistic
                                    precision={0}
                                    formatter={() => <CountUp end={allOrders} separator="," />}
                                    styles={{ content: { fontSize: '32px', fontWeight: 'bold', color: 'var(--textColor)' } }}
                                    style={{ marginBottom: "22px" }}
                                />
                            </Flex>
                            <Flex wrap align="center">
                                <Typography.Text className={s.cardGary} style={{ width: '100%' }} >总销售额</Typography.Text>
                                <Statistic
                                    precision={2}
                                    prefix="¥"
                                    formatter={() => <CountUp end={allSales} separator="," />}
                                    styles={{ content: { fontSize: '32px', fontWeight: 'bold', color: 'var(--textColor)' } }}
                                    style={{ marginBottom: "22px" }}
                                />
                            </Flex>
                        </Flex>
                    </Card>
                </Flex>
                <Flex gap="20px" wrap style={{ width: 'calc(67% - 10px)' }}>
                    <Card classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle, body: s.homeCardBody }} variant="borderless" title="用户数据" style={{ width: 'calc(50% - 10px)', height: '25vh' }} >
                        <Flex style={{ height: "100%" }} justify="space-evenly" align="center">
                            <Flex wrap align="center">
                                <Typography.Text className={s.cardGary} style={{ width: '100%' }} >最大涨幅</Typography.Text>
                                <Statistic
                                    value={userMaxUp}
                                    precision={2}
                                    styles={{ content: { color: '#cf1322' } }}
                                    prefix={<ArrowUpOutlined />}
                                    suffix="%"
                                    style={{ marginBottom: "22px" }}
                                />
                            </Flex>
                            <Flex wrap align="center">
                                <Typography.Text className={s.cardGary} style={{ width: '100%' }} >最大降幅</Typography.Text>
                                <Statistic
                                    value={userMaxDown}
                                    precision={2}
                                    styles={{ content: { color: '#3f8600' } }}
                                    prefix={<ArrowDownOutlined />}
                                    suffix="%"
                                    style={{ marginBottom: "22px" }}
                                />
                            </Flex>
                        </Flex>
                    </Card>
                    <Card classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle, body: s.homeCardBody }} variant="borderless" title="订单数据" style={{ width: 'calc(50% - 10px)', height: '25vh' }} >
                        <Flex style={{ height: "100%" }} justify="space-evenly" align="center">
                            <Flex wrap align="center">
                                <Typography.Text className={s.cardGary} style={{ width: '100%' }} >最大涨幅</Typography.Text>
                                <Statistic
                                    value={orderMaxUp}
                                    precision={2}
                                    styles={{ content: { color: '#cf1322' } }}
                                    prefix={<ArrowUpOutlined />}
                                    suffix="%"
                                    style={{ marginBottom: "22px" }}
                                />
                            </Flex>
                            <Flex wrap align="center">
                                <Typography.Text className={s.cardGary} style={{ width: '100%' }} >最大降幅</Typography.Text>
                                <Statistic
                                    value={orderMaxDown}
                                    precision={2}
                                    styles={{ content: { color: '#3f8600' } }}
                                    prefix={<ArrowDownOutlined />}
                                    suffix="%"
                                    style={{ marginBottom: "22px" }}
                                />
                            </Flex>
                        </Flex>

                    </Card>
                    <Card classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle }} variant="borderless" title="用户统计" style={{ width: '100%', height: 'calc(50vh + 20px)' }} >
                        {emptyCharts ? (
                            <Flex justify="center" align="center" style={{ width: '100%', height: 'calc(50vh - 28px)' }} >
                                <Empty
                                    description={
                                        <>
                                            <Typography.Text className={s.cardTitle} strong ><InfoCircleOutlined /> 暂无用户统计数据</Typography.Text><br />
                                            <Button type="primary" variant="filled" style={{ marginTop: 24 }} onClick={getTableData} icon={<ReloadOutlined />} >重试</Button>
                                        </>
                                    }
                                />
                            </Flex>
                        ) : (
                            <div id="echartsStats" style={{ width: '100%', height: 'calc(50vh - 28px)' }}></div>
                        )}
                    </Card>
                </Flex>
            </Flex >
        </Spin>
    )
}
