<template>
  <div class="notification-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>消息通知</span>
          <div>
            <el-button v-if="canPublish" type="primary" @click="showPublishDialog = true">
              <el-icon><Plus /></el-icon> 发布通知
            </el-button>
            <el-button type="primary" link @click="markAllRead">全部已读</el-button>
            <el-button type="danger" link @click="clearAll">清空</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="loadNotifications">
        <el-tab-pane label="全部" name="all">
          <el-badge :value="unreadCount" :hidden="!unreadCount" />
        </el-tab-pane>
        <el-tab-pane label="系统通知" name="system" />
        <el-tab-pane label="业务通知" name="business" />
        <el-tab-pane label="审核通知" name="audit" />
      </el-tabs>

      <div class="notification-list" v-loading="loading">
        <div v-for="item in filteredList" :key="item.id" class="notification-item" :class="{ unread: !item.isRead }" @click="handleRead(item)">
          <div class="notify-icon" :style="{ background: getTypeColor(item.type) }">
            <el-icon><component :is="getTypeIcon(item.type)" /></el-icon>
          </div>
          <div class="notify-main">
            <div class="notify-title">{{ item.title }}</div>
            <div class="notify-content">{{ item.content }}</div>
            <div class="notify-time">{{ formatDate(item.createTime) }}</div>
          </div>
          <div class="notify-actions">
            <el-button v-if="!item.isRead" type="primary" link size="small" @click.stop="handleRead(item)">标记已读</el-button>
            <el-button type="danger" link size="small" @click.stop="handleDelete(item)">删除</el-button>
          </div>
        </div>
        <el-empty v-if="!filteredList.length && !loading" description="暂无通知" />
      </div>

      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="page" :page-size="10" :total="total" layout="total, prev, pager, next" @current-change="loadNotifications" />
      </div>
    </el-card>

    <!-- 发布通知对话框 -->
    <el-dialog v-model="showPublishDialog" title="发布通知" width="600px">
      <el-form ref="publishFormRef" :model="publishForm" :rules="publishRules" label-width="100px">
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="publishForm.title" placeholder="请输入通知标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="通知类型" prop="type">
          <el-select v-model="publishForm.type" placeholder="请选择通知类型" style="width: 100%">
            <el-option label="系统通知" value="system" />
            <el-option label="业务通知" value="business" />
            <el-option label="审核通知" value="audit" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知内容" prop="content">
          <el-input v-model="publishForm.content" type="textarea" :rows="5" placeholder="请输入通知内容" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="目标用户" prop="targetUserTypes">
          <el-checkbox-group v-model="publishForm.targetUserTypes">
            <el-checkbox :value="1">求职者</el-checkbox>
            <el-checkbox :value="2">在校学生</el-checkbox>
            <el-checkbox :value="3">企业HR</el-checkbox>
            <el-checkbox :value="4">辅导员</el-checkbox>
            <el-checkbox :value="5">培训讲师</el-checkbox>
            <el-checkbox :value="6">管理员</el-checkbox>
          </el-checkbox-group>
          <div class="target-tips">
            <el-button type="primary" link size="small" @click="selectAllUsers">全选</el-button>
            <el-button type="primary" link size="small" @click="publishForm.targetUserTypes = []">清空</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPublishDialog = false">取消</el-button>
        <el-button type="primary" @click="handlePublish" :loading="publishing">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../stores/user'
import { getMyNotifications, markNotificationRead, markAllNotificationsRead, publishNotification } from '../../api/system'

const userStore = useUserStore()
const activeTab = ref('all')
const page = ref(1)
const total = ref(0)
const loading = ref(false)
const publishing = ref(false)
const showPublishDialog = ref(false)
const publishFormRef = ref()

// 管理员和讲师可以发布通知
const canPublish = computed(() => {
  const userType = userStore.userInfo?.userType
  return userType === 5 || userType === 6
})

const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

const filteredList = computed(() => {
  if (activeTab.value === 'all') return notifications.value
  return notifications.value.filter(n => n.type === activeTab.value)
})

const publishForm = reactive({
  title: '',
  type: 'system',
  content: '',
  targetUserTypes: []
})

const publishRules = {
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
  targetUserTypes: [{ required: true, type: 'array', min: 1, message: '请选择目标用户', trigger: 'change' }]
}

const getTypeColor = (type) => {
  const colors = { system: '#909399', business: '#409EFF', audit: '#67C23A' }
  return colors[type] || '#409EFF'
}

const getTypeIcon = (type) => {
  const icons = { system: 'Setting', business: 'Bell', audit: 'CircleCheck' }
  return icons[type] || 'Bell'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 19)
}

const selectAllUsers = () => {
  publishForm.targetUserTypes = [1, 2, 3, 4, 5, 6]
}

const loadNotifications = async () => {
  loading.value = true
  try {
    const res = await getMyNotifications()
    if (res.data.code === 200) {
      notifications.value = res.data.data || []
      total.value = notifications.value.length
    }
  } catch (e) {
    console.error('加载通知失败', e)
  } finally {
    loading.value = false
  }
}

const handleRead = async (item) => {
  if (item.isRead) return
  try {
    const res = await markNotificationRead(item.id)
    if (res.data.code === 200) {
      item.isRead = true
    }
  } catch (e) {
    console.error('标记已读失败', e)
  }
}

const markAllRead = async () => {
  try {
    const res = await markAllNotificationsRead()
    if (res.data.code === 200) {
      notifications.value.forEach(n => n.isRead = true)
      ElMessage.success('已全部标记为已读')
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const clearAll = () => {
  ElMessageBox.confirm('确定要清空所有通知吗？', '提示', { type: 'warning' })
    .then(() => {
      notifications.value = []
      ElMessage.success('已清空')
    })
    .catch(() => {})
}

const handleDelete = (item) => {
  const index = notifications.value.findIndex(n => n.id === item.id)
  if (index > -1) {
    notifications.value.splice(index, 1)
    ElMessage.success('已删除')
  }
}

const handlePublish = async () => {
  await publishFormRef.value.validate()
  publishing.value = true
  try {
    const res = await publishNotification(publishForm)
    if (res.data.code === 200) {
      ElMessage.success('通知发布成功')
      showPublishDialog.value = false
      publishForm.title = ''
      publishForm.content = ''
      publishForm.targetUserTypes = []
      loadNotifications()
    } else {
      ElMessage.error(res.data.message || '发布失败')
    }
  } catch (e) {
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-list {
  min-height: 200px;
  
  .notification-item {
    display: flex;
    align-items: flex-start;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #f9f9f9;
    }

    &.unread {
      background: #f0f9ff;
      
      .notify-title {
        font-weight: 600;
      }
    }

    .notify-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;

      .el-icon {
        font-size: 20px;
        color: #fff;
      }
    }

    .notify-main {
      flex: 1;

      .notify-title {
        font-size: 15px;
        color: #333;
        margin-bottom: 6px;
      }

      .notify-content {
        font-size: 13px;
        color: #666;
        line-height: 1.5;
        margin-bottom: 6px;
      }

      .notify-time {
        font-size: 12px;
        color: #999;
      }
    }

    .notify-actions {
      flex-shrink: 0;
      margin-left: 16px;
    }
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.target-tips {
  margin-top: 8px;
}
</style>
