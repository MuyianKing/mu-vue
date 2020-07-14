<template>
    <div class="about">
        <h5>程序下载</h5>
        <el-link type="primary" :href="this.downLoadUrl" target="_blank">定位系统依赖服务</el-link>
        <br>
        <el-link type="primary" :href="this.BrowserDownLoadUrl" target="_blank">360浏览器</el-link>
        <h5>更新日志</h5>
        <el-timeline :reverse="true">
            <el-timeline-item placement="top" v-for="(item,index) in versionData" :key="index" :timestamp="item.time"
                              type="primary">
                <el-card shadow="hover">
                    <h4>{{item.version}} 更新日志</h4>
                    <p v-for="(value,key) in item.log" :key="key">{{value}}</p>
                </el-card>
            </el-timeline-item>
        </el-timeline>
    </div>
</template>
<script>
    export default {
        name: 'aboutr',
        data() {
            return {
                versionData: [
                    {
                        version: 'V0.0.1',
                        time: '2019-07-07',
                        log: ['增加【设备管理】', '增加【报警历史】', '增加【用户管理】']
                    },
                    {
                        version: 'V0.0.2',
                        time: '2019-07-10',
                        log: ['【个人中心】增加系统通知相关配置', '【监控列表】增加实时预览']
                    },
                    {
                        version: 'V0.0.3',
                        time: '2019-07-11',
                        log: ['修复【用户列表】修改不保存影响列表数据', '修复【监控列表】删除报错', '修复【首页】轨迹未从头播放']
                    },
                    {
                        version: 'V0.0.4',
                        time: '2019-07-12',
                        log: ['【报警历史】增加过滤', '【监控列表】增加分页']
                    },
                    {
                        version: 'V0.1.0',
                        time: '2019-07-16',
                        log: ['优化配置项导入方式', '匹配点位经纬度', '【首页】轨迹增加热力图模式', '【标签列表】调整显示模式']
                    },
                    {
                        version: 'V0.2.0',
                        time: '2019-07-22',
                        log: ['地图模块优化，显示效果更好']
                    },
                    {
                        version: 'V0.2.1',
                        time: '2019-08-03',
                        log: ['视频转换端口可配置']
                    },
                    {
                        version: 'V0.3.0',
                        time: '2019-09-18',
                        log: ['增加对同为摄像头RTSP的支持', '增加其他摄像头通过onvif自动获取rtsp地址', '增加【监控列表】、【标签列表】过滤条件', '【监控列表】IP地址点击跳转']
                    },
                    {
                        version: 'V0.3.1',
                        time: '2019-10-21',
                        log: ['移除【监控列表】、【报警历史】、【用户列表】分页页数修改功能']
                    },
                    {
                        version: 'V0.5.0',
                        time: '2019-12-02',
                        log: ['【首页】增加添加基站、添加区域、视频追踪功能', '标签绑定人员增加人员类型区分']
                    },
                    {
                        version: 'V0.5.1',
                        time: '2019-12-09',
                        log: ['修复【视频追踪】四个视频显示不全']
                    },
                    {
                        version: 'V1.0.0',
                        time: '2019-12-18',
                        log: [
                            '修复【用户列表】权限错误',
                            '增加【组织架构】、【访客记录】模块', '地图只显示已绑定人员的标签',
                            '轨迹查询默认提示当前已绑定的人员姓名，也可手动输入历史绑定的人员姓名',
                            '标签绑定人员增加读取身份证功能，增加绑定访客、身份证照片',
                            '视频追踪框变小，默认只可以查看已绑定人员的标签',
                            '增加【首页】模块'
                        ]
                    },
                    {
                        version: 'V1.1.0',
                        time: '2019-12-25',
                        log: [
                            '地图增加wms服务的支持，增加配置项切换geojson和wms'
                        ]
                    },
                    {
                        version: 'V1.2.0',
                        time: '2019-12-26',
                        log: [
                            '修改图标文字颜色，区分犯人和警察，修改犯人图标',
                            '移除报警信息上的不再显示按钮',
                            '标签解绑增加刻盘选项'
                        ]
                    },
                    {
                        version: 'V1.2.1',
                        time: '2019-12-30',
                        log: [
                            '修复轨迹无法播放',
                            '只显示已绑定人员的标签的报警信息'
                        ]
                    },
                    {
                        version: 'V1.2.2',
                        time: '2020-03-28',
                        log: [
                            '移除对h5s播放摄像头视频的依赖，使用wfs.js播放',
                        ]
                    },
                    {
                        version: 'V1.2.3',
                        time: '2020-04-26',
                        log: [
                                '报警地址posX和posY重计算',
                                '标签列表，监控列表等条件输入优化',
                        ]
                    },
                    {
                        version: 'V1.2.4',
                        time: '2020-05-13',
                        log: [
                            '修复对身份证读卡器读取失败后，不断弹出读取身份证失败的bug',
                            '修复报警，定位用的websocket断开后重连时间间隔过长',
                            '增加侦测剪断报警消除',
                            '多窗口时，会出现token认证失败的情况',
                            '增加了报警管理等，对围栏报警，消失报警，剪断报警增加了实时报警',
                            '修复其他已知bug'
                        ]
                    }
                ]
            }
        },
        computed: {
            baseUrl() {
                let baseUrl = location.protocol + '//' + location.host + '/';
                if (process.env.NODE_ENV !== 'production' && typeof myConfig.serverIp != 'undefined' && typeof myConfig.serverPort != 'undefined') {
                    baseUrl = location.protocol + '//' + myConfig.serverIp + ':' + myConfig.serverPort + '/';
                }
                return baseUrl;
            },
            downLoadUrl() {
                if (typeof myConfig != 'undefined' && typeof myConfig.serverDownLoadUrl != 'undefined') {
                    return this.baseUrl + myConfig.serverDownLoadUrl;
                } else {
                    return this.baseUrl + 'tools/uwb_client.zip';
                }
            },
            BrowserDownLoadUrl() {
                if (typeof myConfig != 'undefined' && typeof myConfig.browserDownLoadUrl != 'undefined') {
                    return this.baseUrl + myConfig.browserDownLoadUrl;
                } else {
                    return this.baseUrl + 'tools/360cse.exe';
                }
            }
        }
    }
</script>
<style scoped lang="scss">
    .about {
        text-align: left;
        height: 100%;
    }
</style>
