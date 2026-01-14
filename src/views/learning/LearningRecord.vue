<template>
  <div class="learning-record-page">
    <el-card>
      <template #header>
        <span>{{ canManage ? '学习统计' : '我的学习' }}</span>
      </template>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stat-cards" v-if="canManage">
        <el-col :span="6">
          <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div class="stat-value">{{ stats.courseCount || 0 }}</div>
            <div class="stat-label">课程总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <div class="stat-value">{{ stats.studentCount || 0 }}</div>
            <div class="stat-label">学习人次</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <div class="stat-value">{{ examStats.examCount || 0 }}</div>
            <div class="stat-label">考试人次</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            <div class="stat-value">{{ examStats.passRate || 0 }}%</div>
            <div class="stat-label">考试及格率</div>
          </div>
        </el-col>
      </el-row>

      <!-- 我的学习记录 -->
      <div v-if="!canManage">
        <h4>课程学习</h4>
        <el-table :data="myLearning" v-loading="loading" stripe border>
          <el-table-column prop="course_name" label="课程名称" min-width="200" />
          <el-table-column prop="teacher_name" label="讲师" width="100" />
          <el-table-column prop="progress" label="学习进度" width="180">
            <template #default="{ row }">
              <el-progress :percentage="row.progress || 0" :status="row.progress >= 100 ? 'success' : ''" />
            </template>
          </el-table-column>
          <el-table-column label="学习时长" width="120">
            <template #default="{ row }">{{ formatSeconds(row.total_learn_time) }}</template>
          </el-table-column>
          <el-table-column prop="last_learn_time" label="最近学习" width="170" />
          <el-table-column prop="is_completed" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.is_completed ? 'success' : ''">{{ row.is_completed ? '已完成' : '学习中' }}</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <h4 style="margin-top: 30px;">考试记录</h4>
        <el-table :data="myExamRecords" stripe border>
          <el-table-column prop="exam_name" label="考试名称" min-width="200" />
          <el-table-column prop="course_name" label="关联课程" width="150" />
          <el-table-column prop="score" label="得分" width="80">
            <template #default="{ row }">
              <span :class="{ 'text-success': row.is_pass, 'text-danger': !row.is_pass && row.status >= 1 }">
                {{ row.status >= 1 ? row.score : '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="is_pass" label="是否及格" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.status >= 1" :type="row.is_pass ? 'success' : 'danger'">
                {{ row.is_pass ? '及格' : '不及格' }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="start_time" label="开始时间" width="170" />
          <el-table-column prop="submit_time" label="提交时间" width="170" />
        </el-table>
      </div>

      <!-- 管理员/讲师视图 -->
      <div v-else>
        <h4>学习记录明细</h4>
        <el-table :data="allLearning" v-loading="loading" stripe border>
          <el-table-column prop="real_name" label="学员" width="100" />
          <el-table-column prop="course_name" label="课程名称" min-width="200" />
          <el-table-column prop="progress" label="学习进度" width="180">
            <template #default="{ row }">
              <el-progress :percentage="row.progress || 0" :status="row.progress >= 100 ? 'success' : ''" />
            </template>
          </el-table-column>
          <el-table-column label="学习时长" width="120">
            <template #default="{ row }">{{ formatSeconds(row.total_learn_time) }}</template>
          </el-table-column>
          <el-table-column prop="last_learn_time" label="最近学习" width="170" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMyLearning, getMyExamRecords, getCourseStatistics } from '@/api/system'

const loading = ref(false)
const myLearning = ref([])
const myExamRecords = ref([])
const allLearning = ref([])
const stats = ref({})
const examStats = ref({})

const canManage = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.userType === 5 || user.userType === 6
    } catch (e) {}
  }
  return false
})

const formatSeconds = (seconds) => {
  if (!seconds) return '0分钟'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`
}

const loadData = async () => {
  loading.value = true
  try {
    if (canManage.value) {
      const statsRes = await getCourseStatistics()
      stats.value = statsRes.data || {}
      // 这里可以加载所有学习记录，暂时用模拟数据
      allLearning.value = []
    } else {
      const learningRes = await getMyLearning()
      myLearning.value = learningRes.data || []
      
      const examRes = await getMyExamRecords()
      myExamRecords.value = examRes.data || []
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.stat-cards {
  margin-bottom: 30px;
  .stat-card {
    padding: 24px;
    border-radius: 12px;
    color: #fff;
    text-align: center;
    .stat-value { font-size: 36px; font-weight: 700; }
    .stat-label { font-size: 14px; margin-top: 8px; opacity: 0.9; }
  }
}
h4 { margin: 0 0 16px; color: #333; }
.text-success { color: #67C23A; font-weight: 600; }
.text-danger { color: #F56C6C; font-weight: 600; }
</style>
