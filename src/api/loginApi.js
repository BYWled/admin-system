import service from "../utils/service";

// 登录接口
export const loginApi = (data) => {
    return service.post('/users/checkLogin', data);
}

// 验证token接口
export const verifyTokenApi = (token) => {
    return service.get('/users/checktoken', { params: token });
} 