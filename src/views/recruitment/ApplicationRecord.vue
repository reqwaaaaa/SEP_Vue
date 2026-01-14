<template>
  <div class="page">
    <el-card>
      <template #header>
        <span>{{ isHR ? '收到的投递' : '我的投递记录' }}</span>
      </template>
      
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="job_name" label="职位名称" min-width="180" />
        <el-table-column v-if="isHR" prop="real_name" label="求职者" width="100" />
        <el-table-column v-if="isHR" prop="phone" label="手机号" width="120" />
        <el-table-column v-if="!isHR" prop="enterprise_name" label="企业名称" width="150" />
        <el-table-column v-if="!isHR" label="薪资" width="120">
          <template #default="{ row }">
            <span class="salary">{{ row.salary_min }}-{{ row.salary_max }}K</span>
          </template>
        </el-table-column>
        <el-table-column v-if="isHR" prop="education" label="学历" width="80">
          <template #default="{ row }">{{ educationMap[row.education] }}</template>
        </el-table-column>
        <el-table-column v-if="isHR" prop="work_years" label="工作经验" width="100">
          <template #default="{ row }">{{ row.work_years }}年</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.tag">{{ statusMap[row.status]?.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="投递时间" width="170" />
        <el-table-column label="操作" :width="isHR ? 180 : 100">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">{{ isHR ? '查看简历' : '查看详情' }}</el-button>
            <el-button v-if="isHR" type="success" link @click="handleProcess(row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" :title="isHR ? '简历详情' : '投递详情'" width="600px">
      <template v-if="isHR">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ currentRow?.real_name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentRow?.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentRow?.email }}</el-descriptions-item>
          <el-descriptions-item label="学历">{{ educationMap[currentRow?.education] }}</el-descriptions-item>
          <el-descriptions-item label="毕业院校">{{ currentRow?.school }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{ currentRow?.major }}</el-descriptions-item>
          <el-descriptions-item label="工作年限">{{ currentRow?.work_years }}年</el-descriptions-item>
          <el-descriptions-item label="期望薪资">{{ currentRow?.expect_salary ? currentRow.expect_salary + 'K' : '面议' }}</el-descriptions-item>
          <el-descriptions-item label="自我评价" :span="2">{{ currentRow?.self_evaluation || '暂无' }}</el-descriptions-item>
        </el-descriptions>
        <div v-if="currentRow?.attachment_url" style="margin-top: 16px;">
          <el-button type="primary" @click="downloadResume">
            <el-icon><Download /></el-icon>下载附件简历
          </el-button>
        </div>
      </template>
      <template v-else>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="职位名称">{{ currentRow?.job_name }}</el-descriptions-item>
          <el-descriptions-item label="企业名称">{{ currentRow?.enterprise_name }}</el-descriptions-item>
          <el-descriptions-item label="薪资范围">
            <span class="salary">{{ currentRow?.salary_min }}-{{ currentRow?.salary_max }}K</span>
          </el-descriptions-item>
          <el-descriptions-item label="工作地点">{{ currentRow?.work_place }}</el-descriptions-item>
          <el-descriptions-item label="投递状态">
            <el-tag :type="statusMap[currentRow?.status]?.tag">{{ statusMap[currentRow?.status]?.name }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="投递时间">{{ currentRow?.create_time }}</el-descriptions-item>
          <el-descriptions-item v-if="currentRow?.hr_remark" label="HR反馈" :span="2">{{ currentRow.hr_remark }}</el-descriptions-item>
          <el-descriptions-item v-if="currentRow?.interview_time" label="面试时间">{{ currentRow.interview_time }}</el-descriptions-item>
          <el-descriptions-item v-if="currentRow?.interview_place" label="面试地点">{{ currentRow.interview_place }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <!-- 处理对话框 -->
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
import { Download } from '@element-plus/icons-vue'
import { getMyJobApplications, getEnterpriseApplications, processJobApplication, getJobApplicationById } from '@/api/system'

const loading = ref(false)
const processing = ref(false)
const tableData = ref([])
const currentRow = ref(null)
const detailDialogVisible = ref(false)
const processDialogVisible = ref(false)

const educationMap = { 1: '不限', 2: '大专', 3: '本科', 4: '硕士', 5: '博士' }
const statusMap = {
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
      return user.userType === 4
    } catch (e) {}
  }
  return false
})

const processForm = reactive({
  status: 2, hrRemark: '', interviewTime: null, interviewPlace: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = isHR.value ? await getEnterpriseApplications() : await getMyJobApplications()
    tableData.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleView = async (row) => {
  try {
    const res = await getJobApplicationById(row.id)
    currentRow.value = res.data
    detailDialogVisible.value = true
  } catch (e) {
    currentRow.value = row
    detailDialogVisible.value = true
  }
}

const handleProcess = (row) => {
  currentRow.value = row
  Object.assign(processForm, { status: 2, hrRemark: '', interviewTime: null, interviewPlace: '' })
  processDialogVisible.value = true
}

const submitProcess = async () => {
  processing.value = true
  try {
    await processJobApplication(currentRow.value.id, processForm)
    ElMessage.success('处理成功')
    processDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('处理失败')
  } finally {
    processing.value = false
  }
}

const downloadResume = () => {
  if (currentRow.value?.attachment_url) {
    window.open(`/api/file/download/${currentRow.value.attachment_url}`)
  }
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.salary { color: #F56C6C; font-weight: 600; }
</style>
