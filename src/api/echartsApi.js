import service from "../utils/service";

// 获取首页统计数据
export const getStatsApi = () => {
    return service.get('/stats/total');
}

// 获取商品统计
export const getGoodsApi = () => {
    return service.get('/stats/goods');
}

// 获取订单统计
export const getOrderApi = () => {
    return service.get('/stats/order');
}