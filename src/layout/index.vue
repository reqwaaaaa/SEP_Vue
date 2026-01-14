<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
      <div class="logo" @click="$router.push('/home')">
        <el-icon class="logo-icon"><School /></el-icon>
        <span v-show="!isCollapse" class="logo-text">校企慧</span>
      </div>
      
      <el-scrollbar class="menu-scrollbar">
        <el-menu 
          :default-active="route.path" 
          router 
          :collapse="isCollapse"
          :collapse-transition="false"
          background-color="#304156" 
          text-color="#bfcbd9" 
          active-text-color="#409EFF"
        >
          <el-menu-item index="/home">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>
          
          <!-- 系统管理 - 仅管理员可见 -->
          <el-sub-menu index="system" v-if="isAdmin">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/user">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            <el-menu-item index="/org">
              <el-icon><OfficeBuilding /></el-icon>
              <template #title>组织管理</template>
            </el-menu-item>
            <el-menu-item index="/role">
              <el-icon><UserFilled /></el-icon>
              <template #title>角色管理</template>
            </el-menu-item>
            <el-menu-item index="/menu">
              <el-icon><Menu /></el-icon>
              <template #title>菜单管理</template>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 招聘管理 -->
          <el-sub-menu index="recruitment">
            <template #title>
              <el-icon><Briefcase /></el-icon>
              <span>招聘管理</span>
            </template>
            <el-menu-item index="/job">
              <el-icon><Tickets /></el-icon>
              <template #title>{{ isHR ? '职位管理' : '职位列表' }}</template>
            </el-menu-item>
            <el-menu-item index="/resume">
              <el-icon><Document /></el-icon>
              <template #title>{{ isHR ? '简历库' : '我的简历' }}</template>
            </el-menu-item>
            <el-menu-item index="/application-record">
              <el-icon><List /></el-icon>
              <template #title>{{ isHR ? '收到的投递' : '投递记录' }}</template>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 学习中心 -->
          <el-sub-menu index="learning">
            <template #title>
              <el-icon><Reading /></el-icon>
              <span>学习中心</span>
            </template>
            <el-menu-item index="/course">
              <el-icon><VideoCamera /></el-icon>
              <template #title>{{ canManageCourse ? '课程管理' : '课程中心' }}</template>
            </el-menu-item>
            <el-menu-item index="/exam">
              <el-icon><EditPen /></el-icon>
              <template #title>{{ canManageCourse ? '考试管理' : '在线考试' }}</template>
            </el-menu-item>
            <el-menu-item index="/learning-record">
              <el-icon><DataLine /></el-icon>
              <template #title>{{ canManageCourse ? '学习统计' : '我的学习' }}</template>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 业务申报 -->
          <el-sub-menu index="application">
            <template #title>
              <el-icon><Stamp /></el-icon>
              <span>业务申报</span>
            </template>
            <el-menu-item index="/my-application">
              <el-icon><DocumentAdd /></el-icon>
              <template #title>我的申报</template>
            </el-menu-item>
            <el-menu-item index="/audit" v-if="isAuditor">
              <el-icon><Checked /></el-icon>
              <template #title>申报审核</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 内容管理 - 仅管理员可见 -->
          <el-sub-menu index="cms" v-if="isAdmin">
            <template #title>
              <el-icon><Files /></el-icon>
              <span>内容管理</span>
            </template>
            <el-menu-item index="/article">
              <el-icon><Notebook /></el-icon>
              <template #title>文章管理</template>
            </el-menu-item>
            <el-menu-item index="/channel">
              <el-icon><FolderOpened /></el-icon>
              <template #title>栏目管理</template>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/message">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>私信消息</template>
          </el-menu-item>

          <!-- 岗位推荐 - 辅导员可见 -->
          <el-menu-item index="/job-recommend" v-if="isCounselor">
            <el-icon><Promotion /></el-icon>
            <template #title>岗位推荐</template>
          </el-menu-item>

          <el-menu-item index="/report" v-if="isAdmin || canManageCourse">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>统计报表</template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-popover placement="bottom" :width="360" trigger="click">
            <template #reference>
              <el-badge :value="notifications.filter(n => !n.isRead).length" :max="99" class="header-icon" :hidden="!notifications.filter(n => !n.isRead).length">
                <el-icon><Bell /></el-icon>
              </el-badge>
            </template>
            <div class="notify-popover">
              <div class="notify-header">
                <span>消息通知</span>
                <el-button type="primary" link size="small" @click="markAllRead">全部已读</el-button>
              </div>
              <div class="notify-list">
                <div v-for="n in notifications" :key="n.id" class="notify-item" :class="{ unread: !n.isRead }" @click="n.isRead = true">
                  <el-icon :style="{ color: n.color }"><component :is="n.icon" /></el-icon>
                  <div class="notify-content">
                    <div class="notify-title">{{ n.title }}</div>
                    <div class="notify-time">{{ n.time }}</div>
                  </div>
                </div>
                <el-empty v-if="!notifications.length" description="暂无通知" :image-size="60" />
              </div>
              <div class="notify-footer">
                <el-button type="primary" link @click="$router.push('/notification')">查看全部</el-button>
              </div>
            </div>
          </el-popover>
          
          <el-tooltip content="全屏" placement="bottom">
            <el-icon class="header-icon" @click="toggleFullscreen">
              <FullScreen />
            </el-icon>
          </el-tooltip>
          
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ userStore.userInfo?.realName || userStore.userInfo?.username || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Key /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主内容区 -->
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="80px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="changingPassword">确定</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled, Bell, Checked, Warning, InfoFilled } from '@element-plus/icons-vue'
import { changePassword, getMyNotifications, getNotificationUnreadCount } from '../api/system'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const showPasswordDialog = ref(false)
const passwordFormRef = ref()
const changingPassword = ref(false)

// 用户类型判断
// 1-求职者 2-在校学生 3-企业HR 4-辅导员 5-培训讲师 6-管理员
const userType = computed(() => userStore.userInfo?.userType || 0)
const isAdmin = computed(() => userType.value === 6)
const isHR = computed(() => userType.value === 3)
const isTeacher = computed(() => userType.value === 5)
const isCounselor = computed(() => userType.value === 4)
const isAuditor = computed(() => userType.value === 6 || userType.value === 7) // 管理员或审核员
const canManageCourse = computed(() => userType.value === 5 || userType.value === 6) // 讲师或管理员

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value !== passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

// 消息通知数据
const notifications = ref([])

const loadNotifications = async () => {
  try {
    const res = await getMyNotifications()
    if (res.data.code === 200) {
      notifications.value = (res.data.data || []).slice(0, 5).map(n => ({
        ...n,
        icon: n.type === 'audit' ? 'Checked' : n.type === 'system' ? 'Setting' : 'Bell',
        color: n.type === 'audit' ? '#67C23A' : n.type === 'system' ? '#909399' : '#409EFF'
      }))
    }
  } catch (e) {
    console.error('加载通知失败', e)
  }
}

const markAllRead = () => {
  notifications.value.forEach(n => n.isRead = true)
  ElMessage.success('已全部标记为已读')
}

const handleChangePassword = async () => {
  await passwordFormRef.value.validate()
  changingPassword.value = true
  try {
    const res = await changePassword(passwordForm)
    if (res.data.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      showPasswordDialog.value = false
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      userStore.logout()
      router.push('/login')
    } else {
      ElMessage.error(res.data.message || '修改失败')
    }
  } catch (e) {
    ElMessage.error('修改失败')
  } finally {
    changingPassword.value = false
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'password':
      showPasswordDialog.value = true
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
        .then(() => {
          userStore.logout()
          ElMessage.success('已退出登录')
          router.push('/login')
        })
        .catch(() => {})
      break
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #263445;
    cursor: pointer;
    
    .logo-icon {
      font-size: 28px;
      color: #409EFF;
    }
    
    .logo-text {
      font-size: 20px;
      font-weight: bold;
      color: #fff;
      margin-left: 10px;
      white-space: nowrap;
    }
  }
  
  .menu-scrollbar {
    height: calc(100vh - 60px);
  }
  
  .el-menu {
    border-right: none;
  }
}

.main-container {
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      margin-right: 16px;
      color: #666;
      
      &:hover {
        color: #409EFF;
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .header-icon {
      font-size: 18px;
      cursor: pointer;
      color: #666;
      padding: 8px;
      border-radius: 4px;
      
      &:hover {
        background: #f5f7fa;
        color: #409EFF;
      }
    }
    
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      
      &:hover {
        background: #f5f7fa;
      }
      
      .username {
        margin: 0 8px;
        color: #333;
        font-size: 14px;
      }
      
      .el-icon {
        color: #999;
        font-size: 12px;
      }
    }
  }
}

.main {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 通知弹窗样式
.notify-popover {
  .notify-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    font-weight: 600;
  }
  
  .notify-list {
    max-height: 300px;
    overflow-y: auto;
    
    .notify-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;
      
      &:hover {
        background: #f9f9f9;
        margin: 0 -12px;
        padding: 12px;
      }
      
      &.unread {
        background: #f0f9ff;
        margin: 0 -12px;
        padding: 12px;
        
        .notify-title {
          font-weight: 600;
        }
      }
      
      .el-icon {
        font-size: 20px;
        margin-right: 12px;
        margin-top: 2px;
      }
      
      .notify-content {
        flex: 1;
        
        .notify-title {
          font-size: 14px;
          color: #333;
          line-height: 1.4;
        }
        
        .notify-time {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }
    }
  }
  
  .notify-footer {
    padding-top: 12px;
    text-align: center;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
