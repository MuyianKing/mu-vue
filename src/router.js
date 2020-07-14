import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Main from './views/Main.vue'

Vue.use(Router);

export default new Router({
    routes: [{
            path: '/login',
            name: 'login',
            component: () =>
                import ('./views/Login.vue')
        },
        {
            path: '/',
            component: Main,
            children: [{
                path: '',
                name: 'home',
                component: Home,
                meta: {
                    title: "首页",
                    icon: 'el-icon-house',
                    keepAlive: true
                }
            }, ]
        },
        {
            path: '/user',
            component: Main,
            leaf: true,
            meta: {
                title: "用户管理",
                icon: 'el-icon-user'
            },
            children: [{
                    path: '',
                    name: 'userList',
                    component: () =>
                        import ('./views/user/index.vue'),
                    meta: {
                        title: "用户列表",
                        permission: '10'
                    }
                },
                {
                    path: 'personal',
                    name: 'personal',
                    props: true,
                    component: () =>
                        import ('./views/user/personal.vue'),
                    meta: {
                        title: "个人中心",
                        keepAlive: true,
                    }
                },
            ],
        },
        {
            path: '/',
            component: Main,
            children: [{
                path: 'about',
                name: 'about',
                component: () =>
                    import ('./views/About.vue'),
                meta: {
                    title: "关于",
                    icon: 'el-icon-collection'
                }
            }, ]
        },
    ]
})