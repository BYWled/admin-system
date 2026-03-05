import service from "../utils/service";

// 获取列表
export const getGoodsApi = (params) => {
    return service.get('/goods/list', { params });
}

// 添加商品
export const addGoodsApi = (data) => {
    return service.post('/goods/add', data);
}

// 修改商品
export const editGoodsApi = (data) => {
    return service.post('/goods/edit', data);
}

// 删除商品
export const deleteGoodsApi = (params) => {
    return service.get('/goods/del', { params });
}

// 获取商品分类列表
export const getCategoryApi = () => {
    return service.get('/goods/categories');
}

// 上传商品图
export const uploadGoodsImgApi = (data) => {
    return service.post('/goods/goods_img_upload', data);
}