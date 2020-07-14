import Cookies from "js-cookie";
import store from "../../store";
import { apiGetToken } from './api.js';

let timeRange = 60000;

function refushToken() {
    var tokenName = store.state.reFlushTokenName
    var oldTimestamp = Number.parseInt(Cookies.get(tokenName));
    if (!oldTimestamp) {
        oldTimestamp = Date.now();
        Cookies.set(tokenName, Date.now());
    }
    var oldtime = Date.now() - oldTimestamp;
    //保证至少在timeRange后才从新获取数据，页面刷新时在timeRange之内不会请求数据
    if (oldtime >= timeRange) {
        apiGetToken().then(() => {
            Cookies.set(tokenName, Date.now());
        }).catch(() => {
            setTimeout(function() {
                refushToken();
            }, 5000);
        }).finally(() => {
            setTimeout(function() {
                refushToken();
            }, timeRange);
        })
    } else {
        //刷新页面之后，重置定时器，
        setTimeout(function() {
            refushToken();
        }, timeRange - oldtime);
    }
}
//定时刷新token
refushToken();