import service from "../utils/service";

// 获取列表
export const getStoreApi = (params) => {
    return service.get('/shop/info', { params });
}

// 修改店铺信息
export const editStoreApi = (data) => {
    return service.post('/shop/edit', data);
}