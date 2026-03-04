import { App, Card, Button, Empty, Flex, Typography } from 'antd'
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { useState, useEffect } from 'react'
import { getGoodsApi } from '../../api/echartsApi';
import s from '../../styles/layout.module.scss'

export default function statisticsGoods() {
    const { message } = App.useApp();
    const [emptyData, setEmptyData] = useState(false);

    const getTableData = async () => {
        const res = await getGoodsApi();
        if (res.code) {
            message.error(res.msg || '获取商品统计失败');
        }
        // 处理数据格式
        if (!res.data || res.data.source.length === 0) {
            setEmptyData(true);
            return message.info('暂无商品统计数据');
        };
        const chartLegendData = [];
        const chartLegendSelected = [];
        const chartSeries = res.data.source.map(item => {
            chartLegendData.push(item.type);
            chartLegendSelected.push({ [item.type]: true });
            return {
                name: item.type,
                stack: 'x',
                type: 'line',
                data: item.data
            }
        });
        const echartsDom = document.querySelector('#echartsGoods');
        const echartsTable = echarts.init(echartsDom);
        echartsTable.setOption({
            title: { text: '商品统计', top: 0 },
            xAxis: { data: res.data.date },
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

        // 监听图标自适应
        const resizeObserver = new ResizeObserver(() => echartsTable.resize());
        resizeObserver.observe(echartsDom);
    }

    useEffect(() => {
        getTableData();
    }, []);

    return (
        <Card classNames={{ root: s.cardRoot, header: s.cardHeader, title: s.cardTitle }} variant="borderless" style={{ width: '100%', height: '75vh' }} >
            {emptyData ? (
                <Flex justify="center" align="center" style={{ width: '100%', height: 'calc(75vh - 40px)' }} >
                    <Empty
                        description={
                            <>
                                <Typography.Text className={s.cardTitle} strong ><InfoCircleOutlined /> 暂无商品统计数据</Typography.Text><br />
                                <Button type="primary" variant="filled" style={{ marginTop: 24 }} onClick={getTableData} icon={<ReloadOutlined />} >重试</Button>
                            </>
                        }
                    />
                </Flex>
            ) : (
                <div id="echartsGoods" style={{ width: '100%', height: 'calc(75vh - 40px)' }}></div>
            )}
        </Card>
    )
}
