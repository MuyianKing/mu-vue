<template>
  <el-container id="app" :class="theme">
    <el-header class="header-mode" height="80px">
      <div class="left">
        <span class="time">{{serverTime}}</span>
        <div class="date">
          <div>{{serverDay}}</div>
          <div>{{serverDate}}</div>
        </div>
      </div>

      <div class="middle">
        <router-link class="webName" to="/">
          <img alt src="../assets/img/logo-g.png" />
          {{this.$store.state.webName}}
        </router-link>
      </div>
      <div class="right">
        <el-dropdown @command="handleCommand" class="sec-menu hidden-sm-and-up" trigger="click">
          <span class="el-dropdown-link">
            <i class="el-icon-more el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="person-info">个人中心</el-dropdown-item>
            <el-dropdown-item command="logout">注销</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="tool-group hidden-xs-only">
          <a @click="handleColl" class="coll-btn" title="显示/隐藏菜单" style="margin-right:10px">
            <span :class="collLeft?'el-icon-s-unfold':'el-icon-s-fold'"></span>
          </a>
          <a @click="changeTheme" class="coll-btn" title="切换主题">
            <span class="el-icon-brush"></span>
          </a>
          <a @click="handlePerson" class="user-text" title="个人中心">
            {{this.$store.state.user.nickname?this.$store.state.user.nickname:this.$store.state.user.username}}
          </a>
          <a @click="logout" class="logout-btn" title="注销">
            <i class="el-icon-switch-button"></i>
          </a>
        </div>
      </div>
    </el-header>
    <el-container class="body-mode">
      <el-aside class="aside-mode" style="width:auto">
        <el-menu :default-active="defaultUrl" :router="true" :unique-opened="true" class="menu-list" :collapse="collLeft">
          <template v-for="(item,index) in menuList">
            <template v-if="typeof item.leaf!='undefined' && item.leaf && checkChildren(item)">
              <el-submenu :index="item.path" :key="index">
                <template slot="title">
                  <i :class="item.meta.icon"></i>
                  <span>{{item.meta.title}}</span>
                </template>
                <el-menu-item-group>
                  <template v-for="(val,key) in item.children">
                    <el-menu-item :index="item.path+'/'+val.path" :key="key+val.name" v-if="val.hidden!==true && !checkPermiss(val)">{{val.meta.title}}
                    </el-menu-item>
                  </template>
                </el-menu-item-group>
              </el-submenu>
            </template>
            <template v-else-if="typeof item.children!='undefined'">
              <template v-for="(v,k) in item.children">
                <el-menu-item :index="item.path+v.path" :key="k+v.name+v.path" v-if="v.hidden!==true && !checkPermiss(v)">
                  <i :class="v.meta.icon" v-if="typeof v.meta!='undefined' && typeof v.meta.icon!='undefined'"></i>
                  <span slot="title">{{v.meta.title}}</span>
                </el-menu-item>
              </template>
            </template>
            <template v-else>
              <el-menu-item :index="item.path" :key="index" v-if="item.hidden!==true && !checkPermiss(item)">
                <i :class="item.meta.icon" v-if="typeof item.meta!='undefined' && typeof item.meta.icon!='undefined'"></i>
                <span slot="title">{{item.meta.title}}</span>
              </el-menu-item>
            </template>
          </template>
        </el-menu>
      </el-aside>
      <el-main class="main-mode">
        <div class="menu-box">
          <el-tabs @tab-click="showTab" @tab-remove="removeTab" class="tabs-mode" type="card" v-model="curTab">
            <el-tab-pane :closable="item.path!='/'" :key="item.path" :label="item.meta.title" :name="item.path" v-for="item in cacheList"></el-tab-pane>
          </el-tabs>
          <div @click="ClearPage" class="clear-tabs el-icon-error"></div>
        </div>
        <div class="main-body">
          <keep-alive :include="include">
            <router-view @rm-tab="removeTab" v-if="$route.meta.keepAlive"></router-view>
          </keep-alive>
          <router-view @rm-tab="removeTab" v-if="!$route.meta.keepAlive"></router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import moment from "moment";
import { apiLogout } from "@/assets/js/api";

export default {
  data() {
    return {
      publicPath: process.env.BASE_URL,
      collLeft: false,
      curTab: "/",
      onlineData: {
        online: 0,
        offline: 0
      },
      curTheme: "default",
      serverTimeout: null,
      serverTime: "",
      serverDate: "",
      serverDay: "",
      theme: "dark",
      days: [
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
        "星期七"
      ]
    };
  },
  created() {
    let collLeft = this.Cookies.get("collLeft");
    if (collLeft != null) {
      this.collLeft = collLeft == "1" ? true : false;
    }
  },
  mounted() {
    this.AddPage();
    this.resizeWindow();
    this.timeInterval();
    var theme = this.Cookies.get("MUYIAN_THEME");
    if (theme) {
      this.theme = theme;
    }
  },
  computed: {
    defaultUrl() {
      return this.$route.path;
    },
    menuList() {
      let menu = [];
      let menus = this.$router.options.routes;
      menu = menus.filter(item => {
        if (item.name != "login") {
          return true;
        }
      });
      return menu;
    },
    cacheList() {
      let list = this.$store.state.pages.filter(item => item.name != "home");
      let home = this.$store.state.pages.filter(item => item.name == "home");
      if (home.length > 0) {
        list.unshift(home[0]);
      }
      return list;
    },
    include() {
      let pages = this.$store.state.pages;
      let include = [];
      for (let key in pages) {
        if (include.indexOf(pages[key]["name"]) == -1) {
          include.push(pages[key]["name"]);
        }
      }
      return include;
    }
  },
  methods: {
    //主题切换
    changeTheme() {
      this.theme = this.theme == "light" ? "dark" : "light";
      this.Cookies.set("MUYIAN_THEME", this.theme);
    },
    //时间定时器
    timeInterval() {
      this.serverTime = moment().format("HHmm");
      this.serverDate = moment().format("YYYY-MM-DD");
      this.serverDay = this.days[moment().format("e")];
      var _this = this;
      setTimeout(function() {
        _this.timeInterval();
      }, 10000);
    },
    handleColl() {
      this.collLeft = !this.collLeft;
      this.Cookies.set("collLeft", this.collLeft ? "1" : "0", { path: "" });
    },
    resizeWindow() {
      if (document.body.clientWidth < 768 && !this.collLeft) {
        this.collLeft = true;
      } else if (document.body.clientWidth > 768 && this.collLeft) {
        this.collLeft = false;
      }
    },
    showTab(path) {
      if (path.name != this.$route.fullPath) {
        this.$router.push({ path: path.name });
      }
    },
    removeTab(targetName) {
      let index = this.$store.state.pages.findIndex(
        p => p.path === this.$route.path
      );
      let item = null;
      if (index != -1) {
        item = { ...this.$store.state.pages[index] };
      }
      this.$store.commit("RemovePage", targetName);
      if (item != null && item.actived) {
        let url = "/";
        if (typeof this.$store.state.pages[index] != "undefined") {
          url = this.$store.state.pages[index].path;
        } else if (typeof this.$store.state.pages[index - 1] != "undefined") {
          url = this.$store.state.pages[index - 1].path;
        }
        this.$router.push({ path: url });
      }
    },
    AddPage: function() {
      let route = {};
      for (let k in this.$route) {
        route[k] = this.$route[k];
      }
      this.curTab = this.$route.path;
      this.$store.commit("AddPage", route);
    },
    ClearPage: function() {
      this.$confirm("确认关闭所有", { type: "warning" }).then(() => {
        this.$store.commit("ClearPage");
        this.$router.push({ path: "/" });
      });
    },
    logout() {
      this.$confirm("确认注销?").then(() => {
        apiLogout();
        this.$store.commit("ClearPage");
        this.Cookies.remove(this.$store.state.cookieName);
        this.Cookies.remove(this.$store.state.reFlushTokenName);
        this.$router.push({ path: "/login" });
      });
    },
    handleCommand(command) {
      if (command == "person-info") {
        this.handlePerson();
      } else if (command === "logout") {
        this.logout();
      }
    },
    handlePerson() {
      this.$router.push({ name: "Personal" });
    },
    checkPermiss(item) {
      return (
        typeof item.meta.permission != "undefined" &&
        item.meta.permission != this.$store.state.user.status
      );
    },
    checkChildren(item) {
      var count = 0;
      if (item.children) {
        for (var i = 0; i < item.children.length; i++) {
          if (
            item.children[i].meta.permission == this.$store.state.user.status ||
            item.children[i].meta.permission != 10
          ) {
            count++;
          }
        }
      }
      return count == 0 ? false : true;
    }
  },
  watch: {
    $route() {
      this.AddPage();
    }
  }
};
</script>

<style lang="scss">
.el-table td,
.el-table th {
  padding: 8px 0 !important;
}

.el-menu--popup-right-start {
  .el-menu-item {
    height: 35px;
    line-height: 35px;
  }
}

.label-style {
  display: inline-block;
  line-height: 30px;
  font-weight: bold;
  margin-top: 10px;
}

.menu-list:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.el-table__fixed-right::before,
.el-table__fixed::before {
  background-color: transparent;
}

.el-dialog {
  margin: 0 auto 0;
}

.el-message-box {
  border: 0;
}

.maptype_add .el-checkbox__inner::after {
  height: 10px;
  top: 2px;
  left: 7px;
}

.maptype_add .el-checkbox__inner {
  height: 19px;
  width: 19px;
}

@keyframes fadeDown {
  0% {
    transform: translateY(-80px);
  }
  50% {
    transform: translateY(10px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes fadeToRight {
  0% {
    transform: translatex(-100px);
  }
  50% {
    transform: translatex(10px);
  }
  100% {
    transform: translatex(0);
  }
}

@keyframes fadeToLeft {
  0% {
    transform: translatex(100px);
  }
  50% {
    transform: translatex(-10px);
  }
  100% {
    transform: translatex(0);
  }
}

.el-dialog__body {
  padding: 0px 20px !important;
}

::-webkit-scrollbar-corner {
  background-color: transparent;
}

#app {
  width: 100%;
  height: 100%;
  background-size: cover;

  .header-mode {
    text-align: left;
    position: relative;
    z-index: 1;
    display: flex;
    font-size: 18px;
    line-height: 80px;

    .left {
      flex: 1;
      animation: fadeToRight 1s;

      .time {
        font-size: 36px;
      }

      .date {
        display: inline-block;
        margin: 0 5px;

        div {
          height: 15px;
          line-height: 15px;
          font-size: 14px;
        }
      }
    }

    .middle {
      flex: 2;
      min-width: 400px;
      text-align: center;

      .webName {
        display: inline-block;
        background-size: 100% 60px;
        padding: 0 80px;
        animation: fadeDown 1s;
        user-select: none;
      }

      img {
        margin-top: -5px;
        height: 30px;
      }
    }

    .right {
      flex: 1;
      animation: fadeToLeft 1s;
    }

    .user-text {
      cursor: pointer;
      margin-left: 5px;
      transition: color 0.3s ease;
    }

    .webName {
      margin: 0;
      height: 60px;
      line-height: 60px;
      font-size: 24px;
      letter-spacing: 2px;
      text-decoration: none;
      font-family: "Microsoft YaHei Light", "serif";
      font-weight: bold;
      padding: 0 10px;
      transition: color 0.3s ease;
      img {
        vertical-align: middle;
      }
    }

    .sec-menu {
      position: absolute;
      top: 0;
      right: 10px;
      height: 100%;

      .el-dropdown-link {
        height: 100%;
        display: block;
        line-height: 60px;

        i {
          transform: rotate(90deg);
        }
      }
    }

    .tool-group {
      float: right;
    }

    .coll-btn {
      cursor: pointer;
      transition: color 0.3s ease;
    }

    .logout-btn {
      text-decoration: none;
      height: 60px;
      line-height: 60px;
      cursor: pointer;
      margin-left: 5px;
      font-size: 18px;
      transition: color 0.3s ease;
    }
  }

  .body-mode {
    text-align: left;
    height: calc(100% - 80px);
  }

  .collLeft {
    .main-mode {
      position: relative;
    }
  }

  .aside-mode {
    position: relative;
    transition: margin-left 0.3s;
    box-sizing: border-box;

    .menu-list {
      height: 100%;
      text-align: left;
      box-sizing: border-box;
      border: 0;
      overflow: auto;

      .el-menu-item,
      .el-submenu__title {
        color: white;
      }

      .el-menu-item,
      .el-submenu__title {
        height: 40px;
        line-height: 40px;
        border-left: 5px solid transparent;
      }

      /*二级菜单子菜单*/
      .el-menu-item-group {
        .el-menu-item-group__title {
          display: none;
        }

        .el-menu-item {
          background: none;
          height: 36px;
          line-height: 36px;
          position: relative;
        }
      }
    }
  }

  .main-mode {
    position: relative;
    padding: 0 10px 10px 10px;

    .menu-box {
      height: 36px;
      width: 100%;
      text-align: left;
      box-sizing: border-box;

      .sidebar-hide {
        margin-top: 5px;
        width: 19px;
        height: 26px;
        line-height: 26px;
        cursor: pointer;
        z-index: 1;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        float: left;
      }

      .tabs-mode {
        height: 36px;
        float: left;
        overflow: auto;
        max-width: calc(100% - 60px);

        .el-tabs__header {
          height: 100%;
          margin-bottom: 0;
          border-bottom: none;

          .el-tabs__nav-wrap {
            height: 100%;

            .el-tabs__nav-next,
            .el-tabs__nav-prev {
              height: 35px;
              line-height: 35px;
            }

            .el-tabs__nav-scroll {
              height: 100%;

              .el-tabs__nav {
                height: 100%;
                border: 0;

                .el-tabs__item {
                  height: 100%;
                  line-height: 35px;
                  padding: 0 15px;
                  border: 0;
                  margin-right: 5px;
                }
              }
            }
          }
        }
      }

      .clear-tabs {
        position: absolute;
        top: 0;
        height: 100%;
        width: 36px;
        font-size: 20px;
        padding: 8px;
        cursor: pointer;
        box-sizing: border-box;
      }
    }

    .main-body {
      margin-top: 10px;
      height: calc(100% - 46px);
      overflow: auto;
      position: relative;
    }
  }

  .clear-fix {
    &:after {
      content: "";
      display: block;
      clear: both;
    }
  }
}

::-webkit-scrollbar {
  /*滚动条整体样式*/
  /*高宽分别对应横竖滚动条的尺寸*/
  height: 8px;
  width: 8px;
}

::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 8px;
  background: rgba(144, 147, 153, 0.5);
}
::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  background: transparent;
  box-shadow: none;
  border-radius: 8px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(144, 147, 153, 0.8);
}

.clearfix:after {
  content: "";
  display: block;
  height: 0;
  visibility: hidden;
  clear: both;
}

.clearfix {
  *zoom: 1;
}

.el-notification {
  border: 0 !important;
  cursor: pointer;
  user-select: none;
}

.searchArea .el-form-item {
  margin: 0 5px 0 0 !important;
}

.btn-group {
  float: right;
}

.el-button--mini,
.el-button--mini .is-round {
  padding: 7px 8px !important;
}

.my-row {
  display: flex;
  margin-bottom: 15px;
}

.row-label-style {
  font-size: 14px;
  font-weight: bold;
  width: 30%;
  min-width: 80px;
}

.row-value-style {
  font-size: 14px;
}

.el-dialog__body {
  .el-form-item__label {
    width: 80px;
  }

  .el-form-item__content {
    margin-left: 80px;
  }

  .el-form-item__content > .el-input,
  .el-select {
    width: calc(100% - 80px) !important;
  }

  .my-btn-group {
    margin-bottom: 0 !important;
    padding-bottom: 20px;

    .el-form-item__content {
      text-align: right;
    }
  }
}
</style>
