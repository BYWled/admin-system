import service from "../utils/service";

// 获取列表
export const getActiveApi = (params) => {
    return service.get('/active/list', { params });
}

// 添加分类
export const addActiveApi = (data) => {
    return service.post('/active/add', data);
}

// 修改分类
export const editActiveApi = (data) => {
    return service.post('/active/edit', data);
}

// 删除分类
export const deleteActiveApi = (params) => {
    return service.delete('/active/del', { params });
}