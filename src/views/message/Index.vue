<template>
  <div class="message-page">
    <el-row :gutter="20">
      <!-- 会话列表 -->
      <el-col :span="8">
        <el-card class="conversation-card">
          <template #header>
            <div class="card-header">
              <span>消息列表</span>
              <el-button type="primary" size="small" @click="showNewMessage = true">
                <el-icon><Plus /></el-icon>发起私信
              </el-button>
            </div>
          </template>
          <div class="conversation-list">
            <div 
              v-for="conv in conversations" 
              :key="conv.id" 
              class="conversation-item"
              :class="{ active: currentConv?.id === conv.id }"
              @click="selectConversation(conv)"
            >
              <el-avatar :size="48" :icon="UserFilled" />
              <div class="conv-info">
                <div class="conv-name">{{ conv.target_name || '未知用户' }}</div>
                <div class="conv-last">{{ conv.last_content || '暂无消息' }}</div>
              </div>
              <div class="conv-meta">
                <div class="conv-time">{{ formatTime(conv.last_message_time) }}</div>
                <el-badge v-if="conv.unread_count > 0" :value="conv.unread_count" class="conv-badge" />
              </div>
            </div>
            <el-empty v-if="!conversations.length" description="暂无消息" :image-size="80" />
          </div>
        </el-card>
      </el-col>

      <!-- 聊天窗口 -->
      <el-col :span="16">
        <el-card class="chat-card">
          <template #header v-if="currentConv">
            <div class="chat-header">
              <span>{{ currentConv.target_name }}</span>
              <el-tag v-if="isTargetOnline" type="success" size="small">在线</el-tag>
            </div>
          </template>
          
          <div v-if="currentConv" class="chat-container">
            <div class="message-list" ref="messageListRef">
              <div 
                v-for="msg in messages" 
                :key="msg.id" 
                class="message-item"
                :class="{ 'message-self': msg.is_self }"
              >
                <el-avatar v-if="!msg.is_self" :size="36" :icon="UserFilled" />
                <div class="message-content">
                  <div class="message-text">{{ msg.content }}</div>
                  <div class="message-time">{{ formatTime(msg.create_time) }}</div>
                </div>
                <el-avatar v-if="msg.is_self" :size="36" :icon="UserFilled" />
              </div>
            </div>
            
            <div class="chat-input">
              <el-input 
                v-model="inputMessage" 
                type="textarea" 
                :rows="3" 
                placeholder="输入消息内容..."
                @keyup.ctrl.enter="sendMessage"
              />
              <div class="input-actions">
                <span class="tip">Ctrl + Enter 发送</span>
                <el-button type="primary" @click="sendMessage" :disabled="!inputMessage.trim()">
                  发送
                </el-button>
              </div>
            </div>
          </div>
          
          <el-empty v-else description="选择一个会话开始聊天" :image-size="120" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 发起私信对话框 -->
    <el-dialog v-model="showNewMessage" title="发起私信" width="400px">
      <el-form :model="newMessageForm" label-width="80px">
        <el-form-item label="接收人">
          <el-select v-model="newMessageForm.receiverId" placeholder="请选择用户" filterable style="width: 100%">
            <el-option v-for="user in userList" :key="user.id" :label="user.real_name || user.username" :value="user.id">
              <span>{{ user.real_name || user.username }}</span>
              <span style="color: #999; margin-left: 10px;">{{ user.username }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input v-model="newMessageForm.content" type="textarea" :rows="4" placeholder="请输入消息内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewMessage = false">取消</el-button>
        <el-button type="primary" @click="handleNewMessage">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { getConversations, getMessages, sendMessage as sendMessageApi, getMessageUsers } from '@/api/system'

const messageListRef = ref()
const currentConv = ref(null)
const inputMessage = ref('')
const showNewMessage = ref(false)
const isTargetOnline = ref(false)
const conversations = ref([])
const messages = ref([])
const userList = ref([])
let ws = null

const newMessageForm = reactive({
  receiverId: null,
  content: ''
})

// 获取当前用户ID
const getCurrentUserId = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      return JSON.parse(userStr).id
    } catch (e) {}
  }
  return null
}

// 初始化WebSocket
const initWebSocket = () => {
  const userId = getCurrentUserId()
  if (!userId) return
  
  const wsUrl = `ws://${window.location.hostname}:8081/ws/chat?userId=${userId}`
  ws = new WebSocket(wsUrl)
  
  ws.onopen = () => {
    console.log('WebSocket连接成功')
  }
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      handleWsMessage(data)
    } catch (e) {
      console.error('解析消息失败', e)
    }
  }
  
  ws.onclose = () => {
    console.log('WebSocket连接关闭')
    // 5秒后重连
    setTimeout(initWebSocket, 5000)
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket错误', error)
  }
}

// 处理WebSocket消息
const handleWsMessage = (data) => {
  if (data.type === 'chat') {
    const msgData = data.data
    // 如果是当前会话的消息，添加到消息列表
    if (currentConv.value && 
        (msgData.conversationId === currentConv.value.id || 
         msgData.senderId === currentConv.value.target_id)) {
      messages.value.push({
        id: Date.now(),
        content: msgData.content,
        is_self: false,
        create_time: new Date().toISOString()
      })
      nextTick(() => scrollToBottom())
    }
    // 刷新会话列表
    loadConversations()
  }
}

// 加载会话列表
const loadConversations = async () => {
  try {
    const res = await getConversations()
    conversations.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

// 加载用户列表
const loadUsers = async () => {
  try {
    const res = await getMessageUsers()
    userList.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

// 选择会话
const selectConversation = async (conv) => {
  currentConv.value = conv
  conv.unread_count = 0
  
  try {
    const res = await getMessages(conv.id)
    messages.value = res.data || []
    nextTick(() => scrollToBottom())
  } catch (e) {
    console.error(e)
  }
}

const scrollToBottom = () => {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || !currentConv.value) return
  
  const content = inputMessage.value
  inputMessage.value = ''
  
  // 先添加到本地显示
  messages.value.push({
    id: Date.now(),
    content: content,
    is_self: true,
    create_time: new Date().toISOString()
  })
  nextTick(() => scrollToBottom())
  
  // 通过WebSocket发送
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'chat',
      receiverId: currentConv.value.target_id,
      content: content,
      conversationId: currentConv.value.id
    }))
  }
  
  // 同时通过API保存
  try {
    await sendMessageApi({
      receiverId: currentConv.value.target_id,
      content: content
    })
  } catch (e) {
    console.error(e)
  }
}

// 发起新私信
const handleNewMessage = async () => {
  if (!newMessageForm.receiverId || !newMessageForm.content.trim()) {
    ElMessage.warning('请选择接收人并输入消息内容')
    return
  }
  
  try {
    const res = await sendMessageApi({
      receiverId: newMessageForm.receiverId,
      content: newMessageForm.content
    })
    
    ElMessage.success('消息已发送')
    showNewMessage.value = false
    newMessageForm.receiverId = null
    newMessageForm.content = ''
    
    // 刷新会话列表
    await loadConversations()
    
    // 选中新会话
    if (res.data?.conversationId) {
      const conv = conversations.value.find(c => c.id === res.data.conversationId)
      if (conv) selectConversation(conv)
    }
  } catch (e) {
    ElMessage.error('发送失败')
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return ['周日','周一','周二','周三','周四','周五','周六'][date.getDay()]
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadConversations()
  loadUsers()
  initWebSocket()
})

onUnmounted(() => {
  if (ws) ws.close()
})
</script>

<style lang="scss" scoped>
.message-page { height: calc(100vh - 140px); }
.conversation-card, .chat-card {
  height: 100%;
  :deep(.el-card__body) { padding: 0; height: calc(100% - 60px); }
}
.card-header, .chat-header { display: flex; justify-content: space-between; align-items: center; }
.conversation-list { height: 100%; overflow-y: auto; }
.conversation-item {
  display: flex; align-items: center; padding: 16px; cursor: pointer;
  border-bottom: 1px solid #f0f0f0; transition: background 0.3s;
  &:hover, &.active { background: #f5f7fa; }
  .conv-info {
    flex: 1; margin-left: 12px; overflow: hidden;
    .conv-name { font-size: 15px; font-weight: 500; color: #333; }
    .conv-last { font-size: 13px; color: #999; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  }
  .conv-meta { text-align: right;
    .conv-time { font-size: 12px; color: #999; }
    .conv-badge { margin-top: 8px; }
  }
}
.chat-container { height: 100%; display: flex; flex-direction: column; }
.message-list { flex: 1; padding: 20px; overflow-y: auto; }
.message-item {
  display: flex; margin-bottom: 20px;
  &.message-self {
    flex-direction: row-reverse;
    .message-content { align-items: flex-end;
      .message-text { background: #409EFF; color: #fff; }
    }
  }
  .message-content {
    display: flex; flex-direction: column; margin: 0 12px; max-width: 60%;
    .message-text { padding: 12px 16px; background: #f5f7fa; border-radius: 8px; font-size: 14px; line-height: 1.6; word-break: break-word; }
    .message-time { font-size: 12px; color: #999; margin-top: 4px; }
  }
}
.chat-input {
  padding: 16px; border-top: 1px solid #f0f0f0;
  .input-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 12px;
    .tip { font-size: 12px; color: #999; }
  }
}
</style>
