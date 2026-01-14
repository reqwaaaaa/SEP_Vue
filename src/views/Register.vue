<template>
  <div class="register-container">
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <div class="register-wrapper">
      <div class="register-box">
        <div class="register-header">
          <h2>用户注册</h2>
          <p>加入校企慧平台，开启职业新旅程</p>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" class="register-form" label-position="top">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="form.realName" placeholder="请输入真实姓名" :prefix-icon="UserFilled" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号" :prefix-icon="Phone" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" :prefix-icon="Message" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="用户类型" prop="userType">
            <el-radio-group v-model="form.userType" class="user-type-group">
              <el-radio-button :value="1">
                <el-icon><User /></el-icon> 求职者
              </el-radio-button>
              <el-radio-button :value="2">
                <el-icon><Reading /></el-icon> 在校学生
              </el-radio-button>
              <el-radio-button :value="3">
                <el-icon><OfficeBuilding /></el-icon> 企业HR
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="form.userType === 2 || form.userType === 3" label="所属机构" prop="orgId">
            <el-select v-model="form.orgId" placeholder="请选择所属机构" style="width: 100%">
              <el-option-group v-if="form.userType === 2" label="高校">
                <el-option v-for="org in schoolList" :key="org.id" :label="org.orgName" :value="org.id" />
              </el-option-group>
              <el-option-group v-if="form.userType === 3" label="企业">
                <el-option v-for="org in enterpriseList" :key="org.id" :label="org.orgName" :value="org.id" />
              </el-option-group>
            </el-select>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="密码" prop="password">
                <el-input v-model="form.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" show-password />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" :prefix-icon="Lock" show-password />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item prop="agreement">
            <el-checkbox v-model="form.agreement">
              我已阅读并同意 <el-link type="primary" :underline="false">《用户服务协议》</el-link> 和 <el-link type="primary" :underline="false">《隐私政策》</el-link>
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" :loading="loading" class="register-btn" @click="handleRegister">
              {{ loading ? '注册中...' : '立即注册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="register-footer">
          <span>已有账号？</span>
          <el-link type="primary" :underline="false" @click="$router.push('/login')">立即登录</el-link>
        </div>
      </div>
    </div>

    <div class="copyright">
      © 2026 郫都区校企人力资源联盟 · 校企慧公共服务平台
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, UserFilled, Lock, Phone, Message } from '@element-plus/icons-vue'
import { register } from '../api/auth'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  realName: '',
  phone: '',
  email: '',
  userType: 1,
  orgId: null,
  password: '',
  confirmPassword: '',
  agreement: false
})

// 模拟机构数据
const schoolList = ref([
  { id: 2, orgName: '成都工业学院' },
  { id: 3, orgName: '四川传媒学院' }
])

const enterpriseList = ref([
  { id: 4, orgName: '成都XX科技有限公司' },
  { id: 5, orgName: '成都YY网络有限公司' }
])

const validatePassword = (rule, value, callback) => {
  if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else {
    if (form.confirmPassword) {
      formRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateAgreement = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
  ]
}

const handleRegister = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    await register({
      username: form.username,
      realName: form.realName,
      phone: form.phone,
      email: form.email,
      userType: form.userType,
      orgId: form.orgId,
      password: form.password,
      confirmPassword: form.confirmPassword
    })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 40px 20px;
}

.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }

  .circle-1 {
    width: 400px;
    height: 400px;
    top: -100px;
    right: -100px;
  }

  .circle-2 {
    width: 300px;
    height: 300px;
    bottom: -50px;
    left: -50px;
  }
}

.register-wrapper {
  z-index: 1;
  width: 100%;
  max-width: 600px;
}

.register-box {
  background: #fff;
  border-radius: 20px;
  padding: 40px 50px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 30px 20px;
  }

  .register-header {
    text-align: center;
    margin-bottom: 30px;

    h2 {
      font-size: 28px;
      color: #333;
      margin: 0 0 8px;
    }

    p {
      color: #999;
      font-size: 14px;
      margin: 0;
    }
  }

  .register-form {
    .user-type-group {
      width: 100%;
      display: flex;

      .el-radio-button {
        flex: 1;

        :deep(.el-radio-button__inner) {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
      }
    }

    .register-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  .register-footer {
    text-align: center;
    color: #999;
    font-size: 14px;
    margin-top: 20px;
  }
}

.copyright {
  position: absolute;
  bottom: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  z-index: 1;
}
</style>
