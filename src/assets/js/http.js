/*封装axios*/
import axios from 'axios';
import store from "../../store";
import * as Cookies from "js-cookie";
import router from '../../router'
/*默认超时时间*/
axios.defaults.timeout = 30000;
if (typeof myConfig != 'undefined') {
    if (process.env.NODE_ENV !== 'production' && typeof myConfig.serverIp != 'undefined' && typeof myConfig.serverPort != 'undefined') {
        axios.defaults.baseURL = `http://${myConfig.serverIp}:${myConfig.serverPort}`;
    }
}
// 添加请求拦截器
axios.interceptors.request.use(function(config) {
    var token = '';
    //页面刷新时vuex中数据会被清空，需要从cookie中取
    var cookieUser = Cookies.get(store.state.cookieName)
    if (cookieUser) {
        token = JSON.parse(cookieUser).token
    } else {
        token = store.state.user.token;
    }
    if (typeof token != 'undefined' && !!token) {
        // 判断是否存在token，如果存在的话，则每个http header都加上token
        config.headers.token = token;
    }
    return config;
}, function(error) {
    return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function(response) {
    // 更新token
    let token = response.data.token || response.headers.authorization;
    if (token) {
        let data = Cookies.get(store.state.cookieName);
        //更新用户cookie中的token
        if (data != null && typeof data != 'undefined') {
            data = JSON.parse(data);
            data.token = token;
            Cookies.set(store.state.cookieName, data);
        }
        //更新vuex中的token
        store.commit('updateToken', token);
    }
    if (typeof response.data.errno != 'undefined' && response.data.errno != '0') {
        /*token无效跳转登录*/
        if (response.data.errno == '201001' || response.data.errno == '200006') {
            router.push({ name: "login" });
            return Promise.reject(response);
        } else {
            return Promise.reject(response);
        }
    } else {
        return Promise.resolve(response);
    }
}, function(error) {
    // 响应错误
    if (typeof error.data == 'undefined' || !error.data) {
        error.data = {
            errno: 999,
            error: typeof error.message != 'undefined' ? error.message : '未知错误'
        }
    }
    return Promise.reject(error);
});

/*封装axios*/
export function get(url, options = {}) {
    return new Promise((resolve, reject) => {
        axios.get(url, options).then(response => {
            resolve(response.data);
        }).catch(error => {
            reject(error.data);
        })
    })
}

export function post(url, params = {}, options = {}) {
    return new Promise((resolve, reject) => {
        axios.post(url, JSON.stringify(params), options).then(response => {
            resolve(response.data);
        }).catch(error => {
            reject(error.data);
        })
    })
}

export function del(url, options = {}) {
    return new Promise((resolve, reject) => {
        axios.delete(url, options).then(response => {
            resolve(response.data);
        }).catch(error => {
            reject(error.data);
        })
    })
}

export function patch(url) {
    return new Promise((resolve, reject) => {
        axios.patch(url).then(response => {
            resolve(response.data);
        }).catch(error => {
            reject(error.data);
        })
    })
}