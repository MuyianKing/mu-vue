/*api统一接口*/
import { post } from './http.js';

/**登录 */
export const apiLogin = (params) => post('/login', params);

/*注销*/
export const apiLogout = () => post('/logout');

/*获取token*/
export const apiGetToken = () => post('/token');

/*创建,修改,获取用户*/
export const apiUserOpt = (params) => post('/user', params);