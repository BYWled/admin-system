import service from "../utils/service";

// 获取用户信息接口
export const userInfoApi = (params) => {
    return service.get('/users/accountinfo', { params });
}

// 检查旧密码接口
export const checkPassApi = (params) => {
    return service.get('/users/checkoldpwd', { params });
}

// 修改密码接口
export const changePassApi = (data) => {
    return service.post('/users/editpwd', data);
}