import { Message } from 'element-ui';

/**
 * 判断给定值是否为 '' null undefined 'null' 'undefined'
 * @param {*} val 
 */
const isTrue = (val) => {
    if (val && val != "null" && val != "undefined") {
        return true
    }
    return false;
}

/**
 * 打印错误
 * @param {string} errMsg 错误提示
 * @param {Object} e 错误回调的error对象
 * 
 */
const alertError = (errMsg = '系统错误', e = null) => {
    console.log(e);
    if (e) {
        if (e.errno != '201001' && e.errno != '200006') {
            Message.error(`${errMsg} ${e.error}`)
        } else if (e.error == 'Network Error') {
            Message.error('网络失去连接')
        }
    } else {
        Message.error(errMsg)
    }
}

export default {
    isTrue,
    alertError
}