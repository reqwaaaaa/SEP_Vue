<template>
  <div class="job-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isHR ? '职位管理' : '职位列表' }}</span>
          <el-button v-if="isHR" type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>发布职位
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="职位名称">
          <el-input v-model="queryForm.keyword" placeholder="请输入职位名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="职位类型">
          <el-select v-model="queryForm.jobType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="全职" :value="1" />
            <el-option label="兼职" :value="2" />
            <el-option label="实习" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="job_name" label="职位名称" min-width="180" />
        <el-table-column prop="enterprise_name" label="企业名称" width="150" />
        <el-table-column label="薪资范围" width="120">
          <template #default="{ row }">
            <span class="salary">{{ row.salary_min }}-{{ row.salary_max }}K</span>
          </template>
        </el-table-column>
        <el-table-column prop="work_place" label="工作地点" width="120" />
        <el-table-column prop="education" label="学历要求" width="100">
          <template #default="{ row }">{{ educationMap[row.education] }}</template>
        </el-table-column>
        <el-table-column prop="job_type" label="职位类型" width="100">
          <template #default="{ row }">{{ jobTypeMap[row.job_type] }}</template>
        </el-table-column>
        <el-table-column v-if="isHR" prop="apply_count" label="投递数" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '招聘中' : '已关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" :width="isHR ? 200 : 150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">详情</el-button>
            <template v-if="isHR">
              <el-button type="success" link @click="handleViewApply(row)">查看投递</el-button>
              <el-button type="warning" link @click="handleEdit(row)">编辑</el-button>
            </template>
            <template v-else>
              <el-button type="success" link @click="handleApply(row)" :disabled="row.status !== 1">投递</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 职位详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="职位详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="职位名称">{{ currentJob?.job_name }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ currentJob?.enterprise_name }}</el-descriptions-item>
        <el-descriptions-item label="薪资范围">
          <span class="salary">{{ currentJob?.salary_min }}-{{ currentJob?.salary_max }}K</span>
        </el-descriptions-item>
        <el-descriptions-item label="工作地点">{{ currentJob?.work_place }}</el-descriptions-item>
        <el-descriptions-item label="学历要求">{{ educationMap[currentJob?.education] }}</el-descriptions-item>
        <el-descriptions-item label="经验要求">{{ experienceMap[currentJob?.experience] }}</el-descriptions-item>
        <el-descriptions-item label="招聘人数">{{ currentJob?.recruit_num }}人</el-descriptions-item>
        <el-descriptions-item label="职位类型">{{ jobTypeMap[currentJob?.job_type] }}</el-descriptions-item>
        <el-descriptions-item label="职位描述" :span="2">{{ currentJob?.description || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="任职要求" :span="2">{{ currentJob?.requirement || '暂无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer v-if="!isHR">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleApply(currentJob)" :disabled="currentJob?.status !== 1">立即投递</el-button>
      </template>
    </el-dialog>

    <!-- 发布/编辑职位对话框 -->
    <el-dialog v-model="editDialogVisible" :title="jobForm.id ? '编辑职位' : '发布职位'" width="700px">
      <el-form :model="jobForm" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职位名称" prop="jobName">
              <el-input v-model="jobForm.jobName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位类型" prop="jobType">
              <el-select v-model="jobForm.jobType" style="width: 100%">
                <el-option label="全职" :value="1" />
                <el-option label="兼职" :value="2" />
                <el-option label="实习" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低薪资">
              <el-input-number v-model="jobForm.salaryMin" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高薪资">
              <el-input-number v-model="jobForm.salaryMax" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工作地点">
              <el-input v-model="jobForm.workPlace" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="招聘人数">
              <el-input-number v-model="jobForm.recruitNum" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学历要求">
              <el-select v-model="jobForm.education" style="width: 100%">
                <el-option label="不限" :value="1" />
                <el-option label="大专" :value="2" />
                <el-option label="本科" :value="3" />
                <el-option label="硕士" :value="4" />
                <el-option label="博士" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经验要求">
              <el-select v-model="jobForm.experience" style="width: 100%">
                <el-option label="不限" :value="0" />
                <el-option label="1年以下" :value="1" />
                <el-option label="1-3年" :value="2" />
                <el-option label="3-5年" :value="3" />
                <el-option label="5-10年" :value="4" />
                <el-option label="10年以上" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="职位描述">
          <el-input v-model="jobForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="任职要求">
          <el-input v-model="jobForm.requirement" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveJob" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 投递对话框 -->
    <el-dialog v-model="applyDialogVisible" title="投递简历" width="400px">
      <div v-if="myResume">
        <p>您将投递简历到：<strong>{{ selectedJob?.job_name }}</strong></p>
        <p>使用简历：<strong>{{ myResume.real_name }}的简历</strong></p>
      </div>
      <el-empty v-else description="您还没有创建简历，请先创建简历">
        <el-button type="primary" @click="goToResume">去创建简历</el-button>
      </el-empty>
      <template #footer v-if="myResume">
        <el-button @click="applyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApply" :loading="applying">确认投递</el-button>
      </template>
    </el-dialog>

    <!-- 查看投递记录对话框 -->
    <el-dialog v-model="applyListDialogVisible" title="投递记录" width="900px">
      <el-table :data="applyList" stripe border>
        <el-table-column prop="real_name" label="求职者" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="education" label="学历" width="80">
          <template #default="{ row }">{{ educationMap[row.education] }}</template>
        </el-table-column>
        <el-table-column prop="school" label="毕业院校" width="150" />
        <el-table-column prop="work_years" label="工作经验" width="100">
          <template #default="{ row }">{{ row.work_years }}年</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="applyStatusMap[row.status]?.tag">{{ applyStatusMap[row.status]?.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewApplyResume(row)">查看简历</el-button>
            <el-button type="success" link @click="processApply(row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 处理投递对话框 -->
    <el-dialog v-model="processDialogVisible" title="处理投递" width="500px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-select v-model="processForm.status" style="width: 100%">
            <el-option label="已查看" :value="2" />
            <el-option label="通过筛选" :value="3" />
            <el-option label="面试邀请" :value="4" />
            <el-option label="已录用" :value="5" />
            <el-option label="不合适" :value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="processForm.hrRemark" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item v-if="processForm.status === 4" label="面试时间">
          <el-date-picker v-model="processForm.interviewTime" type="datetime" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="processForm.status === 4" label="面试地点">
          <el-input v-model="processForm.interviewPlace" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProcess" :loading="processing">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getJobList, getMyJobs, getJobById, saveJob as saveJobApi, applyJob as applyJobApi, getMyResume, getJobApplicationsByJob, processJobApplication, getResumeById } from '@/api/system'

const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const applying = ref(false)
const processing = ref(false)
const tableData = ref([])
const currentJob = ref(null)
const myResume = ref(null)
const selectedJob = ref(null)
const applyList = ref([])
const currentApply = ref(null)

const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const applyDialogVisible = ref(false)
const applyListDialogVisible = ref(false)
const processDialogVisible = ref(false)

const formRef = ref()

const educationMap = { 1: '不限', 2: '大专', 3: '本科', 4: '硕士', 5: '博士' }
const experienceMap = { 0: '不限', 1: '1年以下', 2: '1-3年', 3: '3-5年', 4: '5-10年', 5: '10年以上' }
const jobTypeMap = { 1: '全职', 2: '兼职', 3: '实习' }
const applyStatusMap = {
  1: { name: '待查看', tag: 'warning' },
  2: { name: '已查看', tag: '' },
  3: { name: '通过筛选', tag: 'success' },
  4: { name: '面试邀请', tag: 'success' },
  5: { name: '已录用', tag: 'success' },
  6: { name: '不合适', tag: 'info' }
}

const isHR = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.userType === 4 // HR
    } catch (e) {}
  }
  return false
})

const queryForm = reactive({ keyword: '', jobType: null })

const jobForm = reactive({
  id: null, jobName: '', jobType: 1, salaryMin: 0, salaryMax: 0,
  workPlace: '', recruitNum: 1, education: 1, experience: 0,
  description: '', requirement: ''
})

const processForm = reactive({
  status: 2, hrRemark: '', interviewTime: null, interviewPlace: ''
})

const rules = {
  jobName: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
  jobType: [{ required: true, message: '请选择职位类型', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = isHR.value ? await getMyJobs() : await getJobList(queryForm)
    tableData.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.jobType = null
  loadData()
}

const handleView = async (row) => {
  try {
    const res = await getJobById(row.id)
    currentJob.value = res.data
    detailDialogVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

const handleAdd = () => {
  Object.assign(jobForm, {
    id: null, jobName: '', jobType: 1, salaryMin: 0, salaryMax: 0,
    workPlace: '', recruitNum: 1, education: 1, experience: 0,
    description: '', requirement: ''
  })
  editDialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(jobForm, {
    id: row.id, jobName: row.job_name, jobType: row.job_type,
    salaryMin: row.salary_min, salaryMax: row.salary_max,
    workPlace: row.work_place, recruitNum: row.recruit_num,
    education: row.education, experience: row.experience,
    description: row.description, requirement: row.requirement
  })
  editDialogVisible.value = true
}

const saveJob = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  
  saving.value = true
  try {
    await saveJobApi(jobForm)
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleApply = async (row) => {
  selectedJob.value = row
  try {
    const res = await getMyResume()
    myResume.value = res.data
  } catch (e) {}
  applyDialogVisible.value = true
}

const submitApply = async () => {
  applying.value = true
  try {
    await applyJobApi({ jobId: selectedJob.value.id, resumeId: myResume.value.id })
    ElMessage.success('投递成功')
    applyDialogVisible.value = false
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '投递失败')
  } finally {
    applying.value = false
  }
}

const goToResume = () => {
  applyDialogVisible.value = false
  router.push('/recruitment/resume')
}

const handleViewApply = async (row) => {
  try {
    const res = await getJobApplicationsByJob(row.id)
    applyList.value = res.data || []
    applyListDialogVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

const viewApplyResume = async (row) => {
  try {
    const res = await getResumeById(row.resume_id)
    currentJob.value = res.data
    detailDialogVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

const processApply = (row) => {
  currentApply.value = row
  Object.assign(processForm, { status: 2, hrRemark: '', interviewTime: null, interviewPlace: '' })
  processDialogVisible.value = true
}

const submitProcess = async () => {
  processing.value = true
  try {
    await processJobApplication(currentApply.value.id, processForm)
    ElMessage.success('处理成功')
    processDialogVisible.value = false
    // 刷新列表
    const res = await getJobApplicationsByJob(currentApply.value.job_id)
    applyList.value = res.data || []
  } catch (e) {
    ElMessage.error('处理失败')
  } finally {
    processing.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 16px; }
.salary { color: #F56C6C; font-weight: 600; }
</style>
