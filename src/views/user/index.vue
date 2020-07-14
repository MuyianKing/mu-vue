<template>
  <div id="user-index">
    <!--查询条件-->
    <el-form :inline="true" size="small" class="searchArea">
      <el-form-item>
        <el-input v-model.trim="searchParam.username" placeholder="用户名" @change="getSearchData" style="width:140px"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model.trim="searchParam.nickname" placeholder="昵称" @change="getSearchData" style="width:140px"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model.trim="searchParam.phone" placeholder="手机号码" @change="getSearchData" style="width:160px"></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchParam.status" placeholder="账户类型" @change="getSearchData" style="max-width: 140px;">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button size="small" type="primary" @click="getSearchData">查询</el-button>
      </el-form-item>
      <div class="btn-group">
        <el-button size="small" type="success" style="margin-right: 5px;" @click="add">创建用户</el-button>
      </div>
    </el-form>
    <!-- 表格 -->
    <el-table :data="userList" v-loading="searchLoading" style="margin: 10px 0">
      <el-table-column type="index" :index="indexMethod" label=" "></el-table-column>
      <el-table-column label="用户名" property="username" min-width="110px" show-overflow-tooltip></el-table-column>
      <el-table-column label="昵称" property="nickname" min-width="110px" show-overflow-tooltip></el-table-column>
      <el-table-column label="手机号码" property="phone" min-width="110px"></el-table-column>
      <el-table-column label="邮箱" property="email" min-width="160px" show-overflow-tooltip></el-table-column>
      <el-table-column label="账户类型" min-width="90px">
        <template slot-scope="scope">
          <span>{{scope.row.status=="1"?"普通用户":"管理员"}}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" property="created_at" sortable min-width="150px"></el-table-column>
      <el-table-column label="更新时间" property="updated_at" sortable min-width="150px"></el-table-column>
      <el-table-column label="操作" width="268px" fixed="right">
        <template slot-scope="scope">
          <el-button type="success" plain size="mini" @click="detail(scope.$index,scope.row)">查看</el-button>
          <el-button type="primary" plain size="mini" @click="edit(scope.row)">修改信息</el-button>
          <el-button type="warning" plain size="mini" @click="updatepwd(scope.row.id)">修改密码</el-button>
          <el-button type="danger" plain size="mini" @click="del(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination v-if="count!==0" background layout="total,prev, pager, next" :total="count" :page-size="pageSize" :current-page.sync="page" @current-change="getData"></el-pagination>
    <!-- 查看 -->
    <el-dialog title="详细" :visible.sync="detailVisible" width="50%">
      <div class="my-row">
        <div class="row-label-style">用户名</div>
        <div class="row-value-style">{{userInfo.username}}</div>
      </div>
      <div class="my-row">
        <div class="row-label-style">昵称</div>
        <div class="row-value-style">{{userInfo.nickname}}</div>
      </div>
      <div class="my-row">
        <div class="row-label-style">手机号码</div>
        <div class="row-value-style">{{userInfo.phone}}</div>
      </div>
      <div class="my-row">
        <div class="row-label-style">邮箱</div>
        <div class="row-value-style">{{userInfo.email}}</div>
      </div>
      <div class="my-row">
        <div class="row-label-style">账户类型</div>
        <div class="row-value-style">{{userInfo.status==1?"普通账户":"管理员账户"}}</div>
      </div>
      <div class="my-row">
        <div class="row-label-style">创建时间</div>
        <div class="row-value-style">{{userInfo.created_at}}</div>
      </div>
      <div class="my-row">
        <div class="row-label-style">更新时间</div>
        <div class="row-value-style">{{userInfo.updated_at}}</div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="edit(userInfo)">修改</el-button>
        <el-button size="small" type="danger" @click="del(userInfo.id)">删除</el-button>
      </span>
    </el-dialog>
    <!-- 修改 -->
    <el-dialog :title="typeof userForm.id =='undefined'?'添加':'修改'" :visible.sync="addVisible" width="50%" :before-close="handleBeforeCloseDialog" :destroy-on-close="true">
      <el-form :model="userForm" :rules="userRules" ref="userForm" v-loading="addLoading">
        <el-form-item label="用户名" prop="username" v-if="typeof userForm.id =='undefined'">
          <el-input v-model="userForm.username"/>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="userForm.nickname"/>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="userForm.phone"/>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email"/>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="typeof userForm.id =='undefined'">
          <el-input v-model="userForm.password" show-password/>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmpwd" v-if="typeof userForm.id =='undefined'">
          <el-input v-model="userForm.confirmpwd" show-password/>
        </el-form-item>
        <el-form-item label="账户类型" v-if="typeof userInfo.id =='undefined'">
          <el-select v-model="userForm.status" placeholder="请选择">
            <el-option v-for="item in statusSelOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="my-btn-group">
          <el-button size="small" type="primary" class="button-style" @click="save('userForm')">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 修改密码 -->
    <el-dialog title="修改密码" :visible.sync="passwordvisible" width="50%" :before-close="handleBeforeCloseDialog" :destroy-on-close="true">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" v-loading="addLoading">
        <el-form-item label="新密码" prop="new_password">
          <el-input v-model="passwordForm.new_password" show-password/>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmpwd">
          <el-input v-model="passwordForm.confirmpwd" show-password/>
        </el-form-item>
        <el-form-item class="my-btn-group">
          <el-button size="small" type="primary" class="button-style" @click="savepwd('passwordForm')">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>

</template>
<script>
import { apiUserOpt } from "@/assets/js/api.js";

export default {
  name: "userList",
  data() {
    //确认密码
    let validatePass = (rule, value, callback) => {
      if (value !== this.passwordForm.new_password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value !== this.userForm.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    //用户名不能重复
    let validateUsername = (rule, value, callback) => {
      if (this.userForm.id) {
        callback();
      } else {
        let data = {
          offset: 1,
          limit: 1,
          opt: "check",
          username: value,
          type: "1"
        };
        apiUserOpt(data)
          .then(data => {
            if (data.errno == 0) {
              var regex = /^[0-9A-Za-z]+$/;
              if (!value.match(regex)) {
                callback(new Error("用户名只能是数字和英文组成"));
              } else {
                callback();
              }
            }
          })
          .catch(() => {
            callback(new Error("用户名已存在!"));
          });
      }
    };
    return {
      count: 0,
      page: 1,
      pageSize: this.$store.state.pageSize,
      searchParam: {
        username: "",
        nickname: "",
        phone: "",
        email: "",
        status: "",
        limit: this.$store.state.pageSize,
        opt: "get"
      },
      userList: [],
      userRules: {
        username: [
          { required: true, message: "请填写用户名", trigger: "blur" },
          { validator: validateUsername, trigger: "blur" }
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" }
        ],
        confirmpwd: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          { validator: validatePass2, trigger: "blur" }
        ]
      },
      passwordRules: {
        new_password: [
          { required: true, message: "密码不能为空", trigger: "blur" }
        ],
        confirmpwd: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          { validator: validatePass, trigger: "blur" }
        ]
      },
      searchLoading: false,
      addLoading: false,
      // 显示查看页面
      detailVisible: false,
      //显示详细页面
      addVisible: false,
      userInfo: {},
      //表单参数
      userForm: {},
      //修改密码
      passwordvisible: false,
      passwordForm: {},
      //账户类型
      statusOptions: [
        {
          value: "",
          label: "全部"
        },
        {
          value: "10",
          label: "管理员"
        },
        {
          value: "1",
          label: "普通用户"
        }
      ],
      statusSelOpt: [
        {
          value: "10",
          label: "管理员"
        },
        {
          value: "1",
          label: "普通用户"
        }
      ]
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    //获取数据
    getData() {
      this.searchLoading = true;
      this.searchParam.offset = (this.page - 1) * this.pageSize;
      apiUserOpt(this.searchParam)
        .then(data => {
          this.userList = data.data;
          this.count = data.count;
        })
        .catch(e => {
          this.common.alertError("获取数据失败", e);
        })
        .finally(() => {
          this.searchLoading = false;
        });
    },
    getSearchData() {
      this.page = 1;
      this.getData();
    },
    //新增
    add() {
      this.userInfo = {};
      this.userForm = { status: "1" };
      this.addVisible = true;
      this.detailVisible = false;
    },
    //查看
    detail(index, item) {
      this.detailVisible = true;
      this.userInfo = { ...item };
    },
    //修改
    edit(item) {
      this.addVisible = true;
      this.detailVisible = false;
      item.status = item.status.toString();
      var { id, nickname, phone, email, status } = item;
      this.userForm = { id, nickname, phone, email, status };
    },
    //保存
    save(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.userForm.id) {
            this.userForm.opt = "update";
          } else {
            this.userForm.opt = "create";
          }
          this.addLoading = true;
          apiUserOpt(this.userForm)
            .then(() => {
              this.$message.success("保存成功");
              this.getData();
            })
            .catch(() => {
              this.$message.error(`保存失败`);
            })
            .finally(() => {
              this.addLoading = false;
              this.addVisible = false;
              this.passwordvisible = false;
            });
        }
      });
    },
    //修改密码
    updatepwd(id) {
      this.passwordvisible = true;
      this.passwordForm = { id };
    },
    //修改密码保存
    savepwd(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.passwordForm.opt = "update_password";
          Reflect.deleteProperty(this.passwordForm, "confirmpwd");
          apiUserOpt(this.passwordForm)
            .then(() => {
              this.$message.success("修改成功");
              this.passwordvisible = false;
              this.getData();
            })
            .catch(() => {
              this.$message.error(`修改失败`);
            });
        }
      });
    },
    //删除
    del(id) {
      this.$confirm("确认删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        apiUserOpt({ id: id, opt: "delete" })
          .then(() => {
            this.$message.success("删除成功");
            this.detailVisible = false;
            this.getData();
          })
          .catch(() => {
            this.$message.error(`删除失败`);
          });
      });
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
    },
    //索引
    indexMethod(index) {
      return index + 1;
    }
  },
  computed: {}
};
</script>
<style scoped lang="scss">
#user-index {
}
</style>
