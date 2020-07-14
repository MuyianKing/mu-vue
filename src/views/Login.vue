<template>
  <div id="login-index">
    <div class="login-box-head">
      <div class="login-logo">{{this.$store.state.webName}}</div>
    </div>
    <div class="login-box-main row">
      <div class="login-box-body">
        <h3 class="login-text">用户登录</h3>
        <div>
          <el-form ref="loginForm" :model="loginForm" :rules="loginRules" :disabled="formDisabled">
            <el-form-item prop="username" style="margin-bottom:25px">
              <el-input class="input-style" placeholder="用户名" v-model="loginForm.username" suffix-icon="el-icon-s-custom"></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input placeholder="请输入密码" v-model="loginForm.password" show-password :suffix-icon="showeye?'el-icon-view':''" @focus="showeye=false" @blur="pwdBlur"></el-input>
            </el-form-item>
            <div style="color:#f56c6c;font-size:12px;position:absolute;top:200px">{{errorLogin}}</div>
            <div style="display:flex;item;justify-content : space-between">
              <el-form-item>
                <el-checkbox v-model="loginForm.checked">记住我</el-checkbox>
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="isDoctor">医护人员</el-checkbox>
              </el-form-item>
            </div>
            <el-button type="primary" size="small" @click="login(loginForm)">登录</el-button>
          </el-form>
        </div>
      </div>
    </div>
    <div class="login-box-footer">
      <b>{{this.$store.state.version}}</b>
    </div>
  </div>
</template>

<script>
import { apiLogin } from "@/assets/js/api.js";
import CryptoJS from "crypto-js";

export default {
  name: "login",
  data() {
    let isUserName = (rule, value, callback) => {
      let patter = /^[0-9a-zA-Z_]*$/g;
      if (!patter.test(value)) {
        return callback(new Error("只能输入英文和数字"));
      } else {
        callback();
      }
    };
    return {
      formDisabled: false,
      //表单数据
      loginForm: {
        username: "",
        password: "",
        checked: true,
        flg: false
      },
      isDoctor: false,
      //显示密码的眼睛
      showeye: true,
      //表单校验
      loginRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { validator: isUserName }
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }]
      },
      errorLogin: ""
    };
  },
  mounted() {
    var _this = this;
    //回车登录
    document.onkeydown = function() {
      let key = window.event.keyCode;
      if (key == 13) {
        _this.login();
      }
    };
    //记住密码
    if (this.Cookies.get("hlSavePwd") && !!this.Cookies.get("hlPassword")) {
      this.loginForm.checked = true;
      this.loginForm.username = this.Cookies.get("hlUserName");
      this.loginForm.password = this.getPwd(this.Cookies.get("hlPassword"));
      this.showeye = false;
    }
  },
  destroyed() {
    document.onkeydown = null;
  },
  methods: {
    setPwd(word) {
      var key = CryptoJS.enc.Utf8.parse("hlkjmmgl");
      var srcs = CryptoJS.enc.Utf8.parse(word);
      var encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      return encrypted.toString();
    },
    getPwd(word) {
      var key = CryptoJS.enc.Utf8.parse("hlkjmmgl");
      var decrypt = CryptoJS.AES.decrypt(word, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      return CryptoJS.enc.Utf8.stringify(decrypt).toString();
    },
    //如果密码为空，失去焦点时显示眼睛
    pwdBlur() {
      if (this.loginForm.password == "") {
        this.showeye = true;
      }
    },
    //登录
    login() {
      this.$refs["loginForm"].validate(valid => {
        //表单验证通过
        if (valid) {
          //禁用表单防止多次登录
          this.formDisabled = true;
          let _this = this;
          this.loginForm.flg = this.isDoctor ? 1 : 0;
          apiLogin(this.loginForm)
            .then(data => {
              _this.formDisabled = false;
              let user = {
                id: data.id,
                username: data.username,
                status: data.status,
                nickname: data.nick,
                token: data.token
              };
              //保存用户cookie
              _this.Cookies.set(this.$store.state.cookieName, user);
              //更新vuex用户信息
              _this.$store.commit("updateUser", user);
              _this.$router.push({ name: "home" });
              //记住密码
              if (this.loginForm.checked) {
                _this.Cookies.set("hlUserName", this.loginForm.username);
                _this.Cookies.set(
                  "hlPassword",
                  this.setPwd(this.loginForm.password)
                );
                _this.Cookies.set("hlSavePwd", true);
              } else {
                _this.Cookies.remove("hlUserName");
                _this.Cookies.remove("hlPassword");
                _this.Cookies.remove("hlSavePwd");
              }
            })
            .catch(error => {
              this.formDisabled = false;
              if (error.errno == 200005) {
                _this.errorLogin = "用户名或密码错误";
              } else {
                _this.errorLogin = `登录失败`;
              }
            });
        } else {
          return false;
        }
      });
    },
    reset() {
      this.$refs["loginForm"].resetFields();
    }
  },
  computed: {}
};
</script>

<style scoped lang="scss">
$baseColor: #009dff;
$color: #ccc;
#login-index {
  height: 100%;
  width: 100%;
  background-color: #222848;

  * {
    box-sizing: border-box;
  }

  .login-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    color: #ccc;
  }

  .login-box-head {
    height: 90px;
    text-align: center;
    padding-top: 15px;
    animation: slide-down 1s ease-in-out;
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 10px #000;
  }

  .login-logo {
    letter-spacing: 4px;
    font-weight: bold;
    font-size: 40px;
    height: 60px;
    line-height: 60px;
    box-sizing: border-box;
    margin: 0;
    display: inline-block;
    padding-left: 60px;
    background: url("../assets/img/logo.png") center left no-repeat;
    background-size: auto 60px;
    color: #ccc;
  }

  .login-box-main {
    height: calc(100% - 120px);
    display: flex;
    align-items: center;
    background: url("../assets/img/login-bg.png") no-repeat 25% center;
    background-size: 500px;
  }

  .login-box-body {
    width: 380px;
    height: 350px;
    padding: 20px 60px 60px;
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 8px 7px rgba(0, 0, 0, 0.1);
    position: absolute;
    right: 10%;
    top: 30%;
    text-align: left;
  }

  .login-text {
    color: #ccc;
    text-align: center;
    margin-bottom: 15px;
    font-size: 24px;
    font-weight: normal;
  }

  .login-box-footer {
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    padding: 0 5px;
    line-height: 30px;
    text-align: left;
    color: #ccc;
  }

  @keyframes slide-down {
    0% {
      transform: translateY(-15px);
      box-shadow: 0 0 0 transparent;
    }
    50% {
      transform: translateY(3px);
      box-shadow: 0 2px 0 transparent;
    }
    100% {
      transform: translateY(0);
      box-shadow: 0 2px 10px #000;
    }
  }

  .el-button {
    width: 100%;
    height: 38px;
    font-size: 18px;
    font-weight: bold;
  }

  .el-form-item {
    margin-bottom: 15px;
  }
}
</style>

