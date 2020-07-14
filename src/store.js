import Vue from 'vue'
import Vuex from 'vuex'
import * as Cookies from "js-cookie";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        cookieName: 'HLRFID_user',
        reFlushTokenName: 'HLRFID_fresh',
        webName: '',
        version: '',
        serverIp: '',
        serverPort: '',
        user: {},
        pages: [],
        pageSize: 50,
        baseUrl: '',
        sosFlg: false,
        downloadUrl: '',
        initSos: 0,
        sosResult: 0,
        sosNotify: new Map()
    },
    mutations: {
        //初始化配置
        initConfig: (state, data) => {
            if (data && typeof data != 'undefined') {
                for (let k in data) {
                    state[k] = data[k];
                }
            }
        },
        //初始化用户信息
        initUser: (state) => {
            let data = Cookies.get(state.cookieName);
            if (data && typeof data != 'undefined') {
                data = JSON.parse(data);
                state.user = data;
            }
        },
        //更新用户信息
        updateUser: (state, data) => {
            state.user = {...state.user, ...data };
        },
        //更新sos结果
        updateSosResult(state) {
            state.sosResult++
        },
        updateSosFlg(state, data) {
            state.sosFlg = data
        },
        updateInitSos(state) {
            state.initSos = state.initSos + 1
        },
        //更新token
        updateToken: (state, token) => {
            state.user.token = token;
        },
        updateBaseUrl(state, protocol) {
            if (process.env.NODE_ENV !== 'production' && typeof myConfig.serverIp != 'undefined' && typeof myConfig.serverPort != 'undefined') {
                state.baseUrl = protocol + "//" + state.serverIp + ":" + state.serverPort + "/"
                state.downloadUrl = location.origin + '/download.html?file='
            } else {
                state.baseUrl = location.origin + "/"
                state.downloadUrl = state.baseUrl + 'web/download.html?file='
            }
        },
        //注销用户信息
        resetUser: (state) => {
            Cookies.remove(state.cookieName);
            state.user = {};
        },
        AddPage: (state, data) => {
            //添加页面
            let home = state.pages.filter(item => item.name == 'home');
            if (home.length == '0') {
                state.pages.unshift({
                    name: 'home',
                    path: '/',
                    meta: { title: "首页" }
                });
            }
            let page = state.pages.find(p => p.path === data.path);
            if (page == null) {
                state.pages.push({...data, actived: true });
            } else {
                page.actived = true;
                state.pages.filter(p => p.actived && p.path != data.path).forEach(p => {
                    p.actived = false;
                })
            }
        },
        RemovePage: (state, path) => {
            let index = state.pages.findIndex(p => p.path === path);
            if (index != -1) {
                state.pages.splice(index, 1);
            }
        },
        ClearPage: (state) => {
            let home = state.pages.filter(item => item.name == 'home');
            if (home.length == '0') {
                home = [{
                    name: 'home',
                    path: '/',
                    meta: { title: "首页" }
                }];
            }
            state.pages = home;
        },
    },
    actions: {}
})