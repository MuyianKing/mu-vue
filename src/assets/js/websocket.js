import store from '@/store.js';

class sosSocket {
    // 初始化参数
    constructor(handleOnMessage) {
        let hostname = location.hostname;
        let port = myConfig.sostPort;
        //如果是开发环境，调用配置文件中的ip和端口
        if (typeof myConfig != 'undefined' && process.env.NODE_ENV !== 'production') {
            if (typeof myConfig.serverIp != 'undefined') {
                hostname = myConfig.serverIp;
            }
            if (typeof myConfig.mySocketPort != 'undefined') {
                port = myConfig.mySocketPort;
            }
        }
        //websocket地址
        this.wsUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${hostname}:${port}/hl`;
        //websocket对象
        this.ws = null;
        //重新连接的定时器
        this.WBTime = null;
        //重新连接的锁
        this.lockReconnect = false;
        //重新连接的定时器
        this.reTimeout = null;
        //onMessage的回调
        this.handleOnMessage = typeof handleOnMessage === 'function' ? handleOnMessage : () => {};
        this.closeFlg = false;
    }

    //创建连接
    createWebSocket() {
        var token = store.state.user.token
        if (!token) {
            clearTimeout(this.WBTime);
            this.WBTime = setTimeout(() => {
                this.createWebSocket()
            }, 15000);
            return;
        }
        try {
            this.ws = new WebSocket(this.wsUrl);
            this.init();
        } catch (e) {
            this.reconnect(this.wsUrl);
        }
    }

    init() {
        this.closeFlg = false;
        let _this = this;
        //心跳检测
        let heartCheck = {
            timeout: 150000,
            timeoutObj: null,
            serverTimeoutObj: null,
            start() {
                let self = this;
                this.timeoutObj && clearTimeout(this.timeoutObj);
                this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
                this.timeoutObj = setTimeout(function() {
                    //这里发送一个心跳，后端收到后，返回一个心跳消息
                    _this.ws.send("999");
                    //一定时间后还没有收到消息，说明连接已经断开，需要关闭当前连接重新连接
                    self.serverTimeoutObj = setTimeout(function() {
                        _this.reconnect();
                    }, self.timeout);
                }, this.timeout)
            },
            close() {
                this.timeoutObj && clearTimeout(this.timeoutObj);
                this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
            }
        };
        this.ws.onclose = function() {
            if (!_this.closeFlg) {
                _this.reconnect()
            } else {
                heartCheck.close()
            }
        };
        this.ws.onerror = function() {
            _this.reconnect();
        };
        this.ws.onopen = function() {
            heartCheck.start()
        };
        this.ws.onmessage = function(data) {
            heartCheck.start();
            //拿到任何消息都说明当前连接是正常的
            _this.handleOnMessage(this.ws, data);
        }
    }

    //重新连接
    reconnect() {
        if (!this.lockReconnect) {
            this.lockReconnect = true;
            this.closeFlg = true;
            this.ws && this.ws.close();
            this.closeFlg = false;
            //没连接上会一直重连，设置延迟避免请求过多
            this.createWebSocket();
            setTimeout(() => {
                this.lockReconnect = false
            }, 3000)
        } else {
            setTimeout(() => {
                this.reconnect()
            }, 3000)
        }
    }
}

export default sosSocket;