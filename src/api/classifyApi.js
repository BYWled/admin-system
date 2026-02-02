import service from "../utils/service";

// 获取列表
export const getClassifyApi = (params) => {
    return service.get('/goods/catelist', { params });
}

// 添加分类
export const addClassifyApi = (data) => {
    return service.post('/goods/addcate', data);
}

// 修改分类
export const editClassifyApi = (data) => {
    return service.post('/goods/editcate', data);
}

// 删除分类
export const deleteClassifyApi = (params) => {
    return service.get('/goods/delcate', { params });
}