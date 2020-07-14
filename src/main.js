import Vue from 'vue'
import ElementUI from 'element-ui';
import App from './App.vue'
import router from './router'
import store from './store'
import 'element-ui/lib/theme-chalk/index.css';
import 'element-ui/lib/theme-chalk/display.css';
import Cookies from "js-cookie";
import "./assets/js/token.js";
import './assets/js/http.js';
import common from "@/assets/js/common";
import "./assets/theme/dark.scss"
import "./assets/theme/light.scss"

Vue.use(ElementUI);
Vue.config.productionTip = false;
Vue.prototype.Cookies = Cookies;
Vue.prototype.common = common;

if (typeof myConfig != 'undefined') {
    store.commit('initConfig', myConfig);
    document.title = myConfig.webName;
}

router.beforeEach((to, from, next) => {
    if (from.name == null) {
        store.commit('initUser');
    }
    let user = Cookies.get(store.state.cookieName);
    if (to.path === '/login') {
        next();
        store.commit('resetUser');
        for (let item of document.getElementsByClassName('alarmBox')) {
            item.parentNode.removeChild(item);
        }
    } else if (to.path !== '/login' && !user) {
        next({ path: '/login' })
    } else if (typeof to.meta.permission != 'undefined' && to.meta.permission != store.state.user.status) {
        next({ name: 'home' })
    } else {
        next();
    }
});

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');