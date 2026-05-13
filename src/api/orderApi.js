import service from "../utils/service";

// 获取列表
export const getOrderApi = (params) => {
    return service.get('/order/list', { params });
}

// 修改订单
export const editOrderApi = (data) => {
    return service.post('/order/edit', data);
}