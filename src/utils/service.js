import axios from 'axios';

const service = axios.create({
    baseURL: 'http://8.137.157.16:9002',
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