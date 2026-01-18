import service from "../utils/service";

// 获取用户信息接口
export const userInfoApi = (params) => {
    return service.get('/users/accountinfo', { params });
}