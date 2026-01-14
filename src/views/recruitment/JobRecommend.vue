<template>
  <div class="job-recommend-page">
    <el-row :gutter="20">
      <!-- 左侧学生列表 -->
      <el-col :xs="24" :lg="10">
        <el-card>
          <template #header>
            <div class="card-header">
              <span><el-icon><User /></el-icon> 我的学生</span>
              <el-input v-model="studentSearch" placeholder="搜索学生" style="width: 200px" clearable>
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
            </div>
          </template>
          
          <div class="student-list" v-loading="loadingStudents">
            <el-checkbox-group v-model="selectedStudents">
              <div v-for="student in filteredStudents" :key="student.id" class="student-item">
                <el-checkbox :value="student.id">
                  <div class="student-info">
                    <el-avatar :size="40" :icon="UserFilled" />
                    <div class="student-detail">
                      <div class="name">{{ student.realName || student.username }}</div>
                      <div class="meta">{{ student.major || '未填写专业' }} | {{ student.phone || '未绑定手机' }}</div>
                    </div>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>
            <el-empty v-if="!filteredStudents.length && !loadingStudents" description="暂无学生" />
          </div>
          
          <div class="student-actions">
            <el-button type="primary" link @click="selectAllStudents">全选</el-button>
            <el-button type="primary" link @click="selectedStudents = []">清空</el-button>
            <span class="selected-count">已选 {{ selectedStudents.length }} 人</span>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧职位列表 -->
      <el-col :xs="24" :lg="14">
        <el-card>
          <template #header>
            <div class="card-header">
              <span><el-icon><Briefcase /></el-icon> 推荐职位</span>
              <el-input v-model="jobSearch" placeholder="搜索职位" style="width: 200px" clearable>
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
            </div>
          </template>

          <div class="job-list" v-loading="loadingJobs">
            <div v-for="job in filteredJobs" :key="job.id" class="job-item" :class="{ selected: selectedJob === job.id }" @click="selectedJob = job.id">
              <div class="job-main">
                <div class="job-title">{{ job.title }}</div>
                <div class="job-company">{{ job.companyName }}</div>
                <div class="job-tags">
                  <el-tag size="small">{{ job.salary || '面议' }}</el-tag>
                  <el-tag size="small" type="info">{{ job.location || '成都' }}</el-tag>
                  <el-tag size="small" type="success">{{ job.education || '不限' }}</el-tag>
                </div>
              </div>
              <div class="job-action">
                <el-radio :value="job.id" v-model="selectedJob" />
              </div>
            </div>
            <el-empty v-if="!filteredJobs.length && !loadingJobs" description="暂无职位" />
          </div>

          <div class="recommend-action">
            <el-button type="primary" size="large" @click="handleRecommend" :loading="recommending" :disabled="!selectedStudents.length || !selectedJob">
              <el-icon><Promotion /></el-icon>
              推荐给选中学生 ({{ selectedStudents.length }}人)
            </el-button>
          </div>
        </el-card>

        <!-- 推荐记录 -->
        <el-card style="margin-top: 20px">
          <template #header>
            <span><el-icon><List /></el-icon> 推荐记录</span>
          </template>
          <el-table :data="recommendations" v-loading="loadingRecords" max-height="300">
            <el-table-column prop="studentName" label="学生" width="120" />
            <el-table-column prop="jobTitle" label="职位" />
            <el-table-column prop="companyName" label="企业" width="150" />
            <el-table-column prop="createTime" label="推荐时间" width="160">
              <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { getStudentList, getJobList, batchRecommendJob, getMyRecommendations } from '../../api/system'

const studentSearch = ref('')
const jobSearch = ref('')
const selectedStudents = ref([])
const selectedJob = ref(null)
const loadingStudents = ref(false)
const loadingJobs = ref(false)
const loadingRecords = ref(false)
const recommending = ref(false)

const students = ref([])
const jobs = ref([])
const recommendations = ref([])

const filteredStudents = computed(() => {
  if (!studentSearch.value) return students.value
  const keyword = studentSearch.value.toLowerCase()
  return students.value.filter(s => 
    (s.realName && s.realName.toLowerCase().includes(keyword)) ||
    (s.username && s.username.toLowerCase().includes(keyword))
  )
})

const filteredJobs = computed(() => {
  if (!jobSearch.value) return jobs.value
  const keyword = jobSearch.value.toLowerCase()
  return jobs.value.filter(j => 
    (j.title && j.title.toLowerCase().includes(keyword)) ||
    (j.companyName && j.companyName.toLowerCase().includes(keyword))
  )
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ').substring(0, 16)
}

const getStatusType = (status) => {
  const types = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 0: '待查看', 1: '已查看', 2: '已投递', 3: '已忽略' }
  return texts[status] || '未知'
}

const selectAllStudents = () => {
  selectedStudents.value = filteredStudents.value.map(s => s.id)
}

const loadStudents = async () => {
  loadingStudents.value = true
  try {
    const res = await getStudentList()
    if (res.data.code === 200) {
      students.value = res.data.data || []
    }
  } catch (e) {
    console.error('加载学生列表失败', e)
  } finally {
    loadingStudents.value = false
  }
}

const loadJobs = async () => {
  loadingJobs.value = true
  try {
    const res = await getJobList({ status: 1, pageSize: 50 })
    if (res.data.code === 200) {
      jobs.value = res.data.data?.records || res.data.data || []
    }
  } catch (e) {
    console.error('加载职位列表失败', e)
  } finally {
    loadingJobs.value = false
  }
}

const loadRecommendations = async () => {
  loadingRecords.value = true
  try {
    const res = await getMyRecommendations()
    if (res.data.code === 200) {
      recommendations.value = res.data.data || []
    }
  } catch (e) {
    console.error('加载推荐记录失败', e)
  } finally {
    loadingRecords.value = false
  }
}

const handleRecommend = async () => {
  if (!selectedStudents.value.length) {
    ElMessage.warning('请选择要推荐的学生')
    return
  }
  if (!selectedJob.value) {
    ElMessage.warning('请选择要推荐的职位')
    return
  }

  recommending.value = true
  try {
    const res = await batchRecommendJob({
      studentIds: selectedStudents.value,
      jobId: selectedJob.value
    })
    if (res.data.code === 200) {
      ElMessage.success(`成功推荐给 ${selectedStudents.value.length} 名学生`)
      selectedStudents.value = []
      selectedJob.value = null
      loadRecommendations()
    } else {
      ElMessage.error(res.data.message || '推荐失败')
    }
  } catch (e) {
    ElMessage.error('推荐失败')
  } finally {
    recommending.value = false
  }
}

onMounted(() => {
  loadStudents()
  loadJobs()
  loadRecommendations()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }
}

.student-list {
  max-height: 400px;
  overflow-y: auto;
  
  .student-item {
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    
    &:hover {
      background: #f9f9f9;
    }
    
    .student-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .student-detail {
        .name {
          font-size: 14px;
          font-weight: 500;
        }
        .meta {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }
    }
  }
}

.student-actions {
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 16px;
  
  .selected-count {
    margin-left: auto;
    color: #409EFF;
    font-size: 13px;
  }
}

.job-list {
  max-height: 350px;
  overflow-y: auto;
  
  .job-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409EFF;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    }
    
    &.selected {
      border-color: #409EFF;
      background: #f0f9ff;
    }
    
    .job-main {
      flex: 1;
      
      .job-title {
        font-size: 15px;
        font-weight: 600;
        color: #333;
      }
      
      .job-company {
        font-size: 13px;
        color: #666;
        margin: 6px 0;
      }
      
      .job-tags {
        display: flex;
        gap: 8px;
      }
    }
    
    .job-action {
      margin-left: 16px;
    }
  }
}

.recommend-action {
  padding: 16px 0;
  text-align: center;
  border-top: 1px solid #f0f0f0;
}
</style>
