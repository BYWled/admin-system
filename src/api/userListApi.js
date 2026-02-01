import service from "../utils/service";

// 获取用户列表
export const getUserApi = (params) => {
    return service.get('/users/list', { params });
}

// 添加用户
export const addUserApi = (data) => {
    return service.post('/users/add', data);
}

// 删除用户
export const deleteUserApi = (params) => {
    return service.get(`/users/del`, { params });
}

// 批量删除用户
export const batchDeleteUserApi = (params) => {
    return service.get('/users/batchDel', { params });
}

// 修改用户信息
export const editUserApi = (data) => {
    return service.post('/users/edit', data);
}