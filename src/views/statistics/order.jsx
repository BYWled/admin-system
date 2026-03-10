import { App, Card, Button, Empty, Flex, Typography } from 'antd'
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { useState, useEffect, useRef } from 'react'
import { getOrderApi } from '../../api/echartsApi';
import s from '../../styles/layout.module.scss'

export default function order() {
    const { message } = App.useApp();
    const [emptyData, setEmptyData] = useState(false);
    const [promiseRes, setPromiseRes] = useState({});
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const skipFirstResizeRef = useRef(true);

    const getTableData = async () => {
        const res = await getOrderApi();
        if (res.code) {
            message.error(res.msg || '获取订单统计失败');
        }
        // 处理数据格式
        if (!res.data || res.data.source.length === 0) {
            setEmptyData(true);
            return message.info('暂无订单统计数据');
        };
        setEmptyData(false);
        setPromiseRes(res);
    }

    useEffect(() => {
        getTableData();
    }, []);

    useEffect(() => {
        // 数据为空时不渲染图表，显示空状态
        if (emptyData || !promiseRes.data?.source?.length) return;

        // 构建图例数据和系列数据
        const chartLegendData = [];
        const chartLegendSelected = [];
        const chartSeries = promiseRes.data?.source.map(item => {
            chartLegendData.push(item.type);
            chartLegendSelected.push({ [item.type]: true });
            return {
                name: item.type,
                stack: 'x',
                type: 'line',
                data: item.data
            }
        });

        // 初始化 ECharts 实例并设置配置项
        const echartsDom = chartContainerRef.current;
        if (!echartsDom) return;

        // 数据刷新时重建实例，保证首帧动画完整播放
        chartRef.current?.dispose();
        chartRef.current = echarts.init(echartsDom);
        chartRef.current.setOption({
            title: { text: '订单统计', top: 0 },
            xAxis: { data: promiseRes.data?.date },
            yAxis: {},
            legend: {
                type: 'scroll',
                orient: 'horizontal',
                right: 10,
                bottom: 0,
                data: chartLegendData,
                selected: chartLegendSelected
            },
            tooltip: {
                trigger: 'axis'
            },
            series: chartSeries
        });
        resizeObserverRef.current?.disconnect();
        // TODO: 由于首帧动画会被 resize 打断，通过 skipFirstResizeRef 来跳过首次 resize 事件
        resizeObserverRef.current = new ResizeObserver(() => {
            // 首次跳过以免打断首帧动画
            if (skipFirstResizeRef.current) {
                skipFirstResizeRef.current = false;
                return;
            }
            chartRef.current?.resize();
        });
        // 监听容器尺寸变化以实现响应式调整
        resizeObserverRef.current.observe(echartsDom);

        return () => {
            // 组件卸载时清理资源
            resizeObserverRef.current?.disconnect();
            chartRef.current?.dispose();
            chartRef.current = null;
        };
    }, [promiseRes]);

    return (
        <Card classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle }} variant="borderless" style={{ width: '100%', height: '75vh' }} >
            {emptyData ? (
                <Flex justify="center" align="center" style={{ width: '100%', height: 'calc(75vh - 40px)' }} >
                    <Empty
                        description={
                            <>
                                <Typography.Text className={s.cardTitle} strong ><InfoCircleOutlined /> 暂无订单统计数据</Typography.Text><br />
                                <Button type="primary" variant="filled" style={{ marginTop: 24 }} onClick={getTableData} icon={<ReloadOutlined />} >重试</Button>
                            </>
                        }
                    />
                </Flex>
            ) : (
                <div ref={chartContainerRef} id="echartsOrder" style={{ width: '100%', height: 'calc(75vh - 40px)' }}></div>
            )}
        </Card>
    )
}
