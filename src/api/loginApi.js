import service from "../utils/service";

export const loginApi = (data) => {
    return service.post('/users/checkLogin', data);
}