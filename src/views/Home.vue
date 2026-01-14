<template>
  <div class="home">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h2>欢迎使用校企慧公共服务平台</h2>
        <p>郫都区校企人力资源合作暨高技能人才培训联盟工作平台</p>
      </div>
      <div class="welcome-time">
        <div class="date">{{ currentDate }}</div>
        <div class="time">{{ currentTime }}</div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card" style="--card-color: #409EFF">
          <div class="stat-icon"><el-icon><User /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.userCount || 0 }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card" style="--card-color: #67C23A">
          <div class="stat-icon"><el-icon><Briefcase /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.jobCount || 0 }}</div>
            <div class="stat-label">职位数量</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card" style="--card-color: #E6A23C">
          <div class="stat-icon"><el-icon><Reading /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.courseCount || 0 }}</div>
            <div class="stat-label">课程数量</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card" style="--card-color: #F56C6C">
          <div class="stat-icon"><el-icon><Document /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.applicationCount || 0 }}</div>
            <div class="stat-label">申报数量</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 平台公告 -->
      <el-col :xs="24" :lg="16">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><Bell /></el-icon> 平台公告</span>
              <el-button type="primary" link @click="$router.push('/article')">更多 &gt;</el-button>
            </div>
          </template>
          <div class="announcement-list">
            <div v-for="item in announcements" :key="item.id" class="announcement-item">
              <el-tag size="small" :type="item.type === 'important' ? 'danger' : 'info'">
                {{ item.type === 'important' ? '重要' : '通知' }}
              </el-tag>
              <span class="title">{{ item.title }}</span>
              <span class="date">{{ item.createTime }}</span>
            </div>
            <el-empty v-if="!announcements.length" description="暂无公告" :image-size="80" />
          </div>
        </el-card>
      </el-col>

      <!-- 快捷入口 -->
      <el-col :xs="24" :lg="8">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><Grid /></el-icon> 快捷入口</span>
            </div>
          </template>
          <div class="quick-grid">
            <div class="quick-item" @click="$router.push('/job')">
              <div class="quick-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                <el-icon><Briefcase /></el-icon>
              </div>
              <span>{{ isHR ? '发布职位' : '找工作' }}</span>
            </div>
            <div class="quick-item" @click="$router.push('/resume')">
              <div class="quick-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                <el-icon><Document /></el-icon>
              </div>
              <span>{{ isHR ? '简历库' : '我的简历' }}</span>
            </div>
            <div class="quick-item" @click="$router.push('/course')">
              <div class="quick-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                <el-icon><Reading /></el-icon>
              </div>
              <span>{{ canManageCourse ? '课程管理' : '学习课程' }}</span>
            </div>
            <div class="quick-item" @click="$router.push('/my-application')">
              <div class="quick-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
                <el-icon><EditPen /></el-icon>
              </div>
              <span>业务申报</span>
            </div>
            <div class="quick-item" @click="$router.push('/exam')">
              <div class="quick-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
                <el-icon><List /></el-icon>
              </div>
              <span>{{ canManageCourse ? '考试管理' : '在线考试' }}</span>
            </div>
            <div class="quick-item" @click="$router.push('/message')">
              <div class="quick-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <span>私信消息</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 最新职位 -->
      <el-col :xs="24" :lg="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><Briefcase /></el-icon> 最新职位</span>
              <el-button type="primary" link @click="$router.push('/job')">更多 &gt;</el-button>
            </div>
          </template>
          <div class="job-list">
            <div v-for="job in latestJobs" :key="job.id" class="job-item" @click="$router.push('/job')">
              <div class="job-info">
                <div class="job-title">{{ job.title }}</div>
                <div class="job-company">{{ job.company }}</div>
              </div>
              <div class="job-salary">{{ job.salary }}</div>
            </div>
            <el-empty v-if="!latestJobs.length" description="暂无职位" :image-size="80" />
          </div>
        </el-card>
      </el-col>

      <!-- 热门课程 -->
      <el-col :xs="24" :lg="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><Reading /></el-icon> 热门课程</span>
              <el-button type="primary" link @click="$router.push('/course')">更多 &gt;</el-button>
            </div>
          </template>
          <div class="course-list">
            <div v-for="(course, idx) in hotCourses" :key="course.id" class="course-item" @click="$router.push('/course')">
              <div class="image-placeholder" :style="{ background: gradients[idx % gradients.length] }">
                <el-icon><Picture /></el-icon>
              </div>
              <div class="course-info">
                <div class="course-title">{{ course.title }}</div>
                <div class="course-meta">
                  <span><el-icon><User /></el-icon> {{ course.teacher || '未知讲师' }}</span>
                  <span><el-icon><View /></el-icon> {{ course.viewCount || 0 }}人学习</span>
                </div>
              </div>
            </div>
            <el-empty v-if="!hotCourses.length" description="暂无课程" :image-size="80" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/user'
import { getHomeStats, getLatestJobs, getHotCourses, getAnnouncements } from '../api/system'

const userStore = useUserStore()
const currentDate = ref('')
const currentTime = ref('')
let timer = null

const stats = ref({})
const announcements = ref([])
const latestJobs = ref([])
const hotCourses = ref([])

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
]

const userType = computed(() => userStore.userInfo?.userType || 0)
const isHR = computed(() => userType.value === 3)
const canManageCourse = computed(() => userType.value === 5 || userType.value === 6)

const updateTime = () => {
  const now = new Date()
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  currentDate.value = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 ${weekDays[now.getDay()]}`
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
}

const loadData = async () => {
  try {
    const [statsRes, jobsRes, coursesRes, announcementsRes] = await Promise.all([
      getHomeStats(),
      getLatestJobs(),
      getHotCourses(),
      getAnnouncements()
    ])
    stats.value = statsRes.data || {}
    latestJobs.value = jobsRes.data || []
    hotCourses.value = coursesRes.data || []
    announcements.value = announcementsRes.data || []
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  loadData()
})

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style lang="scss" scoped>
.home {
  .welcome-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px; padding: 24px 32px; margin-bottom: 20px;
    display: flex; justify-content: space-between; align-items: center; color: #fff;
    .welcome-content { h2 { margin: 0 0 8px; font-size: 24px; } p { margin: 0; opacity: 0.9; font-size: 14px; } }
    .welcome-time { text-align: right; .date { font-size: 14px; opacity: 0.9; } .time { font-size: 32px; font-weight: 600; font-family: monospace; } }
  }
  .stat-row { margin-bottom: 20px; }
  .stat-card {
    background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: all 0.3s;
    &:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .stat-icon { width: 56px; height: 56px; border-radius: 12px; background: var(--card-color);
      display: flex; align-items: center; justify-content: center; margin-right: 16px;
      .el-icon { font-size: 28px; color: #fff; }
    }
    .stat-info { .stat-value { font-size: 28px; font-weight: 700; color: #333; } .stat-label { font-size: 14px; color: #999; margin-top: 4px; } }
  }
  .content-card { .card-header { display: flex; justify-content: space-between; align-items: center; span { display: flex; align-items: center; gap: 8px; font-weight: 600; } } }
  .announcement-list {
    .announcement-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0;
      &:last-child { border-bottom: none; }
      .el-tag { margin-right: 12px; flex-shrink: 0; }
      .title { flex: 1; color: #333; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; &:hover { color: #409EFF; } }
      .date { color: #999; font-size: 13px; margin-left: 16px; flex-shrink: 0; }
    }
  }
  .quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
    .quick-item { display: flex; flex-direction: column; align-items: center; padding: 16px 8px; border-radius: 8px; cursor: pointer; transition: background 0.3s;
      &:hover { background: #f5f7fa; }
      .quick-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; .el-icon { font-size: 24px; color: #fff; } }
      span { font-size: 13px; color: #666; }
    }
  }
  .job-list {
    .job-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer;
      &:last-child { border-bottom: none; }
      .job-info { .job-title { font-size: 15px; color: #333; font-weight: 500; &:hover { color: #409EFF; } } .job-company { font-size: 13px; color: #999; margin-top: 4px; } }
      .job-salary { color: #F56C6C; font-weight: 600; font-size: 15px; }
    }
  }
  .course-list {
    .course-item { display: flex; padding: 12px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer;
      &:last-child { border-bottom: none; }
      .image-placeholder { width: 100px; height: 60px; border-radius: 6px; margin-right: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; }
      .course-info { flex: 1; display: flex; flex-direction: column; justify-content: center;
        .course-title { font-size: 15px; color: #333; font-weight: 500; &:hover { color: #409EFF; } }
        .course-meta { font-size: 13px; color: #999; margin-top: 8px; display: flex; gap: 16px; span { display: flex; align-items: center; gap: 4px; } }
      }
    }
  }
}
</style>
