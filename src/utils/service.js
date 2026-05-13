import axios from 'axios';

// 由于资源文件同时在一个后端服务器下，所以暴露baseURL，方便后续直接反代
export const baseURL = 'https://api-admin.wled.top/api';

const service = axios.create({
    baseURL,
    timeout: 10000,
});

// 请求拦截器
service.interceptors.request.use(config => {
    // 添加token到请求头
    const token = localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')).token : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// 响应拦截器
service.interceptors.response.use(response => {
    return response.data;
}, error => {
    return Promise.reject(error);
});

export default service;