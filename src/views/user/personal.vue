<template>
  <div id="personal">
    <div v-if="detailVisible" class="personal-body">
      <el-row style="margin-top:20px" v-if="!userType">
        <el-col :span="6">
          <div class="text-style">用户名</div>
        </el-col>
        <el-col :span="18">
          <div class="text-style">{{userInfo.username}}</div>
        </el-col>
      </el-row>
      <el-row style="margin-top:20px" v-if="userType">
        <el-col :span="6">
          <div class="text-style">姓名</div>
        </el-col>
        <el-col :span="18">
          <div class="text-style">{{userInfo.user}}</div>
        </el-col>
      </el-row>
      <el-row v-if="!userType">
        <el-col :span="6">
          <div class="text-style">昵称</div>
        </el-col>
        <el-col :span="18">
          <div class="text-style">{{userInfo.nickname}}</div>
        </el-col>
      </el-row>
      <el-row v-if="!userType">
        <el-col :span="6">
          <div class="text-style">手机号码</div>
        </el-col>
        <el-col :span="18">
          <div class="text-style">{{userInfo.phone}}</div>
        </el-col>
      </el-row>
      <el-row v-if="!userType">
        <el-col :span="6">
          <div class="text-style">邮箱</div>
        </el-col>
        <el-col :span="18">
          <div class="text-style">{{userInfo.email}}</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <div class="text-style">账户类型</div>
        </el-col>
        <el-col :span="18">
          <div class="text-style">{{userType?"医护人员":userInfo.status==1?"普通账户":"管理员"}}</div>
        </el-col>
      </el-row>
      <el-row v-if="!userType">
        <el-col :span="6">
          <div class="text-style">创建时间</div>
        </el-col>
        <el-col :span="18">
          <div class="text-style">{{userInfo.created_at}}</div>
        </el-col>
      </el-row>
      <el-row v-if="!userType">
        <el-col :span="6">
          <div class="text-style">更新时间</div>
        </el-col>
        <el-col :span="18">
          <div class="text-style">{{userInfo.updated_at}}</div>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer" style="text-align: right;">
        <el-button type="primary" size="mini" @click="edit()">修改信息</el-button>
        <el-button type="danger" size="mini" @click="updatePwd(userInfo.id)">修改密码</el-button>
      </div>
    </div>

    <el-dialog title="修改个人信息" :visible.sync="updatevisible" width="50%" :before-close="handleBeforeCloseDialog" :destroy-on-close="true">
      <el-form :model="userForm" ref="userForm" v-if="updatevisible" v-loading="addLoading">
        <el-form-item label="昵称" v-if="!userType">
          <el-input v-model="userForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="姓名" v-if="userType">
          <el-input v-model="userForm.user"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" v-if="!userType">
          <el-input v-model="userForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" v-if="!userType">
          <el-input v-model="userForm.email"></el-input>
        </el-form-item>
        <el-form-item label="账户类型" v-if="typeof userInfo.id =='undefined'&&!userType">
          <el-select v-model="userForm.status" placeholder="请选择">
            <el-option v-for="item in statusSelOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" class="button-style" @click="save()">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="修改密码" :visible.sync="passwordvisible" width="50%" :before-close="handleBeforeCloseDialog" :destroy-on-close="true">
      <el-form :model="passwordForm" :rules="pwdRules" ref="passwordForm" v-loading="addLoading">
        <el-form-item label="原密码" prop="orig_password">
          <el-input v-model="passwordForm.orig_password"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
          <el-input v-model="passwordForm.new_password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmpwd">
          <el-input v-model="passwordForm.confirmpwd" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" class="button-style" @click="savepwd('passwordForm')">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { apiUserOpt, apiLogout } from "@/assets/js/api";

export default {
  name: "Personal",
  data() {
    //确认密码
    let validatePass = (rule, value, callback) => {
      if (value !== this.passwordForm.new_password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      //修改密码表单
      passwordForm: {},
      //表单参数
      userForm: {},
      //用户信息
      userInfo: {},
      //详细
      detailVisible: true,
      //修改密码
      passwordvisible: false,
      //修改
      updatevisible: false,
      addLoading: false,
      pwdRules: {
        orig_password: [
          { required: true, message: "原密码不能为空", trigger: "blur" }
        ],
        new_password: [
          { required: true, message: "密码不能为空", trigger: "blur" }
        ],
        confirmpwd: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          { validator: validatePass, trigger: "blur" }
        ]
      },
      statusSelOpt: [
        {
          value: "10",
          label: "管理员"
        },
        {
          value: "1",
          label: "普通用户"
        }
      ],
      //1-医护人员 0-系统用户
      userType: this.$store.state.user.status == 2
    };
  },
  mounted: function() {
    this.getUser();
  },
  methods: {
    //获取用户信息
    getUser() {
      //医护人员
      let searchParam = {
        offset: 0,
        limit: 1,
        opt: "get",
        username: this.$store.state.user.username
      };
      apiUserOpt(searchParam)
        .then(data => {
          if (data.errno == 0 && data.data.length > 0) {
            this.userInfo = data.data[0];
          }
        })
        .catch(e => {
          this.common.alertError("获取数据失败", e);
        });
    },
    //修改
    edit() {
      this.updatevisible = true;
      if (this.userType) {
        var {
          userid,
          username,
          user,
          pos,
          hospital,
          dep,
          major,
          intro
        } = this.userInfo;
        this.userForm = {
          userid,
          username,
          user,
          pos,
          hospital,
          dep,
          major,
          intro
        };
      } else {
        var { id, nickname, phone, email } = this.userInfo;
        this.userForm = { id, nickname, phone, email };
      }
    },
    //保存个人信息
    save() {
      this.userForm.opt = "update";
      this.addLoading = true;
      apiUserOpt(this.userForm)
        .then(() => {
          this.$message.success("修改成功");
          this.getUser();
        })
        .catch(() => {
          this.$message.error(`修改失败`);
        })
        .finally(() => {
          this.addLoading = false;
          this.updatevisible = false;
          this.passwordvisible = false;
        });
    },
    //修改密码
    updatePwd(id) {
      this.passwordvisible = true;
      this.passwordForm = { id };
    },
    //保存密码
    savepwd(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.passwordForm.opt = "update_password";
          this.addLoading = true;
          Reflect.deleteProperty(this.passwordForm, "confirmpwd");
          apiUserOpt(this.passwordForm)
            .then(() => {
              this.$confirm("密码修改成功,请重新登录", {
                showClose: false,
                showCancelButton: false
              }).then(() => {
                this.logout();
              });
            })
            .catch(() => {
              this.$message.error(`修改失败`);
            })
            .finally(() => {
              this.addLoading = false;
              this.updatevisible = false;
              this.passwordvisible = false;
            });
        }
      });
    },
    //注销
    logout() {
      apiLogout();
      this.$store.commit("ClearPage");
      this.Cookies.remove(this.$store.state.cookieName);
      this.Cookies.remove(this.$store.state.reFlushTokenName);
      this.$router.push({ path: "/login" });
    },
    //关闭查看页面
    handleBeforeCloseDialog(done) {
      this.$confirm("确认关闭?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        done();
      });
    }
  }
};
</script>

<style scoped lang="scss">
#personal {
  .personal-body {
    padding: 10px 10px 20px 10px;
  }

  .text-style {
    font-size: 14px;
    font-weight: bold;
    padding-left: 20px;
  }

  .el-select {
    width: 100%;
  }

  .el-row {
    margin-bottom: 20px;
  }

  .el-row:last-child {
    margin-bottom: 0;
  }

  .button-style {
    margin-bottom: 20px;
    float: right;
  }
}
</style>
