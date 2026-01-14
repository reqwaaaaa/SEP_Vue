<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col :xs="24" :lg="8">
        <el-card class="profile-card" v-loading="loading">
          <div class="avatar-section">
            <el-avatar :size="100" :icon="UserFilled" :src="userInfo.avatar" />
            <h3>{{ userInfo.realName || userInfo.username }}</h3>
            <el-tag>{{ userInfo.userTypeName || getRoleName(userInfo.userType) }}</el-tag>
          </div>
          <div class="info-list">
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span class="label">用户名</span>
              <span class="value">{{ userInfo.username }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span class="label">手机号</span>
              <span class="value">{{ userInfo.phone || '未绑定' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span class="label">邮箱</span>
              <span class="value">{{ userInfo.email || '未绑定' }}</span>
            </div>
            <div class="info-item">
              <el-icon><OfficeBuilding /></el-icon>
              <span class="label">所属组织</span>
              <span class="value">{{ userInfo.orgName || '无' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span class="label">注册时间</span>
              <span class="value">{{ formatDate(userInfo.createTime) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧详细信息 -->
      <el-col :xs="24" :lg="16">
        <el-card>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-form :model="editForm" label-width="100px" style="max-width: 500px">
                <el-form-item label="真实姓名">
                  <el-input v-model="editForm.realName" placeholder="请输入真实姓名" />
                </el-form-item>
                <el-form-item label="性别">
                  <el-radio-group v-model="editForm.gender">
                    <el-radio :value="1">男</el-radio>
                    <el-radio :value="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="editForm.phone" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="editForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="个人简介">
                  <el-input v-model="editForm.introduction" type="textarea" :rows="3" placeholder="介绍一下自己" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSave" :loading="saving">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="我的数据" name="data">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="data-card">
                    <div class="data-value">{{ myData.courseCount }}</div>
                    <div class="data-label">学习课程</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="data-card">
                    <div class="data-value">{{ myData.examCount }}</div>
                    <div class="data-label">参加考试</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="data-card">
                    <div class="data-value">{{ myData.applicationCount }}</div>
                    <div class="data-label">投递简历</div>
                  </div>
                </el-col>
              </el-row>
              <el-divider />
              <h4>最近学习</h4>
              <div class="recent-list">
                <div v-for="item in recentCourses" :key="item.id" class="recent-item">
                  <span class="name">{{ item.name }}</span>
                  <el-progress :percentage="item.progress" :stroke-width="8" style="width: 150px" />
                  <span class="time">{{ item.lastTime }}</span>
                </div>
                <el-empty v-if="!recentCourses.length" description="暂无学习记录" :image-size="60" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="账号安全" name="security">
              <div class="security-list">
                <div class="security-item">
                  <div class="security-info">
                    <el-icon><Lock /></el-icon>
                    <div>
                      <div class="title">登录密码</div>
                      <div class="desc">定期更换密码可以保护账号安全</div>
                    </div>
                  </div>
                  <el-button type="primary" link @click="showPasswordDialog = true">修改</el-button>
                </div>
                <div class="security-item">
                  <div class="security-info">
                    <el-icon><Phone /></el-icon>
                    <div>
                      <div class="title">手机绑定</div>
                      <div class="desc">{{ userInfo.phone ? '已绑定: ' + userInfo.phone : '未绑定手机号' }}</div>
                    </div>
                  </div>
                  <el-button type="primary" link @click="activeTab = 'basic'">{{ userInfo.phone ? '更换' : '绑定' }}</el-button>
                </div>
                <div class="security-item">
                  <div class="security-info">
                    <el-icon><Message /></el-icon>
                    <div>
                      <div class="title">邮箱绑定</div>
                      <div class="desc">{{ userInfo.email ? '已绑定: ' + userInfo.email : '未绑定邮箱' }}</div>
                    </div>
                  </div>
                  <el-button type="primary" link @click="activeTab = 'basic'">{{ userInfo.email ? '更换' : '绑定' }}</el-button>
                </div>
                <div class="security-item">
                  <div class="security-info">
                    <el-icon><Clock /></el-icon>
                    <div>
                      <div class="title">最后登录</div>
                      <div class="desc">{{ formatDate(userInfo.lastLoginTime) }} {{ userInfo.lastLoginIp ? '(' + userInfo.lastLoginIp + ')' : '' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="80px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePwd" :loading="changingPwd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { getProfile, updateProfile, changePassword, getMyLearning } from '../../api/system'

const userStore = useUserStore()
const router = useRouter()
const activeTab = ref('basic')
const showPasswordDialog = ref(false)
const pwdFormRef = ref()
const loading = ref(false)
const saving = ref(false)
const changingPwd = ref(false)

const userInfo = ref({
  username: '',
  realName: '',
  userType: 1,
  userTypeName: '',
  gender: 1,
  phone: '',
  email: '',
  avatar: '',
  introduction: '',
  orgName: '',
  createTime: '',
  lastLoginTime: '',
  lastLoginIp: ''
})

const editForm = reactive({
  realName: '',
  gender: 1,
  phone: '',
  email: '',
  introduction: ''
})

const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }, {
    validator: (r, v, cb) => v !== pwdForm.newPassword ? cb(new Error('两次密码不一致')) : cb(), trigger: 'blur'
  }]
}

const myData = ref({ courseCount: 0, examCount: 0, applicationCount: 0 })
const recentCourses = ref([])

const getRoleName = (type) => {
  const map = { 1: '求职者', 2: '在校学生', 3: '企业HR', 4: '辅导员', 5: '培训讲师', 6: '管理员', 7: '审核员' }
  return map[type] || '用户'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ').substring(0, 19)
}

const loadProfile = async () => {
  loading.value = true
  try {
    const res = await getProfile()
    if (res.data.code === 200) {
      const data = res.data.data
      userInfo.value = data
      editForm.realName = data.realName || ''
      editForm.gender = data.gender || 1
      editForm.phone = data.phone || ''
      editForm.email = data.email || ''
      editForm.introduction = data.introduction || ''
      myData.value = {
        courseCount: data.courseCount || 0,
        examCount: data.examCount || 0,
        applicationCount: data.applicationCount || 0
      }
    }
  } catch (e) {
    console.error('加载个人信息失败', e)
  } finally {
    loading.value = false
  }
}

const loadRecentLearning = async () => {
  try {
    const res = await getMyLearning()
    if (res.data.code === 200 && res.data.data) {
      recentCourses.value = (res.data.data || []).slice(0, 5).map(item => ({
        id: item.id,
        name: item.courseName || item.name,
        progress: item.progress || 0,
        lastTime: item.lastLearnTime ? formatDate(item.lastLearnTime) : '刚刚'
      }))
    }
  } catch (e) {
    console.error('加载学习记录失败', e)
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    const res = await updateProfile(editForm)
    if (res.data.code === 200) {
      ElMessage.success('保存成功')
      loadProfile()
      userStore.userInfo = { ...userStore.userInfo, realName: editForm.realName }
    } else {
      ElMessage.error(res.data.message || '保存失败')
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleChangePwd = async () => {
  await pwdFormRef.value.validate()
  changingPwd.value = true
  try {
    const res = await changePassword(pwdForm)
    if (res.data.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      showPasswordDialog.value = false
      pwdForm.oldPassword = ''
      pwdForm.newPassword = ''
      pwdForm.confirmPassword = ''
      userStore.logout()
      router.push('/login')
    } else {
      ElMessage.error(res.data.message || '修改失败')
    }
  } catch (e) {
    ElMessage.error('修改失败')
  } finally {
    changingPwd.value = false
  }
}

onMounted(() => {
  loadProfile()
  loadRecentLearning()
})
</script>


<style lang="scss" scoped>
.profile-card {
  text-align: center;

  .avatar-section {
    padding: 20px 0;
    border-bottom: 1px solid #f0f0f0;

    h3 { margin: 16px 0 8px; font-size: 18px; }
  }

  .info-list {
    padding: 16px 0;

    .info-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;

      .el-icon { font-size: 18px; color: #409EFF; margin-right: 12px; }
      .label { color: #999; width: 70px; }
      .value { flex: 1; color: #333; text-align: right; }
    }
  }
}

.data-card {
  text-align: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;

  .data-value { font-size: 32px; font-weight: 700; color: #409EFF; }
  .data-label { font-size: 14px; color: #999; margin-top: 8px; }
}

.recent-list {
  .recent-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    .name { flex: 1; }
    .time { color: #999; font-size: 13px; margin-left: 16px; }
  }
}

.security-list {
  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;

    .security-info {
      display: flex;
      align-items: center;

      .el-icon { font-size: 24px; color: #409EFF; margin-right: 16px; }
      .title { font-size: 15px; font-weight: 500; }
      .desc { font-size: 13px; color: #999; margin-top: 4px; }
    }
  }
}
</style>
