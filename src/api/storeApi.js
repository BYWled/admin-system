import service from "../utils/service";

// 获取列表
export const getStoreApi = (params) => {
    return service.get('/shop/info', { params });
}

// 修改店铺信息
export const editStoreApi = (data) => {
    return service.post('/shop/edit', data);
}

// 上传店铺图片
export const uploadStoreImageApi = (data) => {
    return service.post('/shop/upload', data);
}