<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="login-wrapper">
      <!-- 左侧介绍 -->
      <div class="login-intro">
        <div class="intro-content">
          <h1>校企慧</h1>
          <h2>公共服务平台</h2>
          <p class="desc">郫都区校企人力资源合作暨高技能人才培训联盟工作平台</p>
          <div class="features">
            <div class="feature-item">
              <el-icon><Briefcase /></el-icon>
              <span>招聘就业</span>
            </div>
            <div class="feature-item">
              <el-icon><Reading /></el-icon>
              <span>在线学习</span>
            </div>
            <div class="feature-item">
              <el-icon><Document /></el-icon>
              <span>业务申报</span>
            </div>
            <div class="feature-item">
              <el-icon><OfficeBuilding /></el-icon>
              <span>校企合作</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录框 -->
      <div class="login-box">
        <div class="login-header">
          <h2>欢迎登录</h2>
          <p>请输入您的账号信息</p>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
          <el-form-item prop="username">
            <el-input 
              v-model="form.username" 
              placeholder="用户名/手机号" 
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input 
              v-model="form.password" 
              type="password" 
              placeholder="密码" 
              size="large"
              :prefix-icon="Lock"
              show-password 
              @keyup.enter="handleLogin" 
            />
          </el-form-item>
          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              :loading="loading" 
              class="login-btn" 
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <span>还没有账号？</span>
          <el-link type="primary" :underline="false" @click="$router.push('/register')">立即注册</el-link>
        </div>

        <el-divider>其他登录方式</el-divider>
        <div class="other-login">
          <el-tooltip content="微信登录" placement="top">
            <div class="login-icon wechat">
              <el-icon><ChatDotRound /></el-icon>
            </div>
          </el-tooltip>
          <el-tooltip content="企业微信" placement="top">
            <div class="login-icon work-wechat">
              <el-icon><Promotion /></el-icon>
            </div>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="copyright">
      © 2026 郫都区校企人力资源联盟 · 校企慧公共服务平台
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, ChatDotRound, Promotion } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)
const rememberMe = ref(true)
const showRegister = ref(false)

const form = reactive({
  username: 'admin',
  password: 'admin123'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    await userStore.login(form)
    ElMessage.success('登录成功，欢迎回来！')
    router.push('/')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
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
    left: -100px;
  }

  .circle-2 {
    width: 300px;
    height: 300px;
    bottom: -50px;
    right: -50px;
  }

  .circle-3 {
    width: 200px;
    height: 200px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.login-wrapper {
  display: flex;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 1;
  max-width: 900px;
  width: 90%;
}

.login-intro {
  width: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 40px;
  display: flex;
  align-items: center;
  color: #fff;

  @media (max-width: 768px) {
    display: none;
  }

  .intro-content {
    h1 {
      font-size: 42px;
      font-weight: 700;
      margin: 0;
      letter-spacing: 4px;
    }

    h2 {
      font-size: 24px;
      font-weight: 400;
      margin: 8px 0 24px;
      opacity: 0.9;
    }

    .desc {
      font-size: 14px;
      opacity: 0.8;
      line-height: 1.8;
      margin-bottom: 40px;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        backdrop-filter: blur(10px);

        .el-icon {
          font-size: 20px;
        }

        span {
          font-size: 14px;
        }
      }
    }
  }
}

.login-box {
  width: 420px;
  padding: 60px 50px;

  @media (max-width: 768px) {
    width: 100%;
    padding: 40px 30px;
  }

  .login-header {
    text-align: center;
    margin-bottom: 40px;

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

  .login-form {
    .el-input {
      --el-input-border-radius: 8px;
    }

    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .login-btn {
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

  .login-footer {
    text-align: center;
    color: #999;
    font-size: 14px;
    margin-top: 20px;
  }

  .el-divider {
    margin: 30px 0;

    :deep(.el-divider__text) {
      color: #999;
      font-size: 13px;
    }
  }

  .other-login {
    display: flex;
    justify-content: center;
    gap: 20px;

    .login-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.3s;

      .el-icon {
        font-size: 22px;
        color: #fff;
      }

      &:hover {
        transform: scale(1.1);
      }

      &.wechat {
        background: #07c160;
      }

      &.work-wechat {
        background: #2b7bd6;
      }
    }
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
