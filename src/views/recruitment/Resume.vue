<template>
  <div class="resume-page">
    <!-- 求职者视图：我的简历 -->
    <el-card v-if="isJobseeker" class="my-resume-card">
      <template #header>
        <div class="card-header">
          <span>我的简历</span>
          <el-button type="primary" @click="handleEdit">
            <el-icon><Edit /></el-icon>{{ myResume ? '编辑简历' : '创建简历' }}
          </el-button>
        </div>
      </template>
      
      <div v-if="myResume" class="resume-preview">
        <div class="resume-header">
          <el-avatar :size="80" :icon="UserFilled" />
          <div class="resume-basic">
            <h2>{{ myResume.real_name }}</h2>
            <p>{{ myResume.phone }} | {{ myResume.email }}</p>
            <p>{{ educationMap[myResume.education] }} | {{ myResume.school }} | {{ myResume.major }}</p>
          </div>
        </div>
        <el-divider />
        <el-descriptions :column="2" border>
          <el-descriptions-item label="期望职位">{{ myResume.expect_job }}</el-descriptions-item>
          <el-descriptions-item label="期望薪资">{{ myResume.expect_salary ? myResume.expect_salary + 'K' : '面议' }}</el-descriptions-item>
          <el-descriptions-item label="期望地点">{{ myResume.expect_place }}</el-descriptions-item>
          <el-descriptions-item label="工作年限">{{ myResume.work_years }}年</el-descriptions-item>
          <el-descriptions-item label="自我评价" :span="2">{{ myResume.self_evaluation || '暂无' }}</el-descriptions-item>
        </el-descriptions>
        <div v-if="myResume.attachment_url" class="attachment">
          <el-button type="primary" link @click="downloadResume">
            <el-icon><Download /></el-icon>下载附件简历
          </el-button>
        </div>
      </div>
      <el-empty v-else description="您还没有创建简历，点击上方按钮创建" />
    </el-card>

    <!-- HR视图：简历列表 -->
    <el-card v-else>
      <template #header>
        <span>简历库</span>
      </template>
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" placeholder="姓名/期望职位" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="学历">
          <el-select v-model="queryForm.education" placeholder="请选择" clearable style="width: 120px">
            <el-option label="大专" :value="2" />
            <el-option label="本科" :value="3" />
            <el-option label="硕士" :value="4" />
            <el-option label="博士" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadResumeList"><el-icon><Search /></el-icon>查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="resumeList" v-loading="loading" stripe border>
        <el-table-column prop="real_name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">{{ row.gender === 1 ? '男' : '女' }}</template>
        </el-table-column>
        <el-table-column prop="education" label="学历" width="100">
          <template #default="{ row }">{{ educationMap[row.education] }}</template>
        </el-table-column>
        <el-table-column prop="school" label="毕业院校" width="150" />
        <el-table-column prop="major" label="专业" width="150" />
        <el-table-column prop="work_years" label="工作经验" width="100">
          <template #default="{ row }">{{ row.work_years }}年</template>
        </el-table-column>
        <el-table-column prop="expect_salary" label="期望薪资" width="100">
          <template #default="{ row }">{{ row.expect_salary ? row.expect_salary + 'K' : '面议' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewResume(row)">查看</el-button>
            <el-button v-if="row.attachment_url" type="success" link @click="downloadResumeFile(row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 简历编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑简历" width="700px" top="5vh">
      <el-form :model="resumeForm" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="realName">
              <el-input v-model="resumeForm.realName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="resumeForm.gender">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="resumeForm.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="resumeForm.email" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学历" prop="education">
              <el-select v-model="resumeForm.education" style="width: 100%">
                <el-option label="大专" :value="2" />
                <el-option label="本科" :value="3" />
                <el-option label="硕士" :value="4" />
                <el-option label="博士" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="毕业院校" prop="school">
              <el-input v-model="resumeForm.school" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="专业" prop="major">
              <el-input v-model="resumeForm.major" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作年限">
              <el-input-number v-model="resumeForm.workYears" :min="0" :max="50" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="期望职位">
              <el-input v-model="resumeForm.expectJob" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="期望薪资">
              <el-input-number v-model="resumeForm.expectSalary" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="期望地点">
          <el-input v-model="resumeForm.expectPlace" />
        </el-form-item>
        <el-form-item label="自我评价">
          <el-input v-model="resumeForm.selfEvaluation" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="附件简历">
          <el-upload
            :action="uploadUrl"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :show-file-list="false"
          >
            <el-button type="primary">上传附件</el-button>
          </el-upload>
          <span v-if="resumeForm.attachmentUrl" style="margin-left: 10px; color: #67C23A;">已上传</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveResume" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 简历详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="简历详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ currentResume?.real_name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentResume?.gender === 1 ? '男' : '女' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentResume?.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentResume?.email }}</el-descriptions-item>
        <el-descriptions-item label="学历">{{ educationMap[currentResume?.education] }}</el-descriptions-item>
        <el-descriptions-item label="毕业院校">{{ currentResume?.school }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ currentResume?.major }}</el-descriptions-item>
        <el-descriptions-item label="工作年限">{{ currentResume?.work_years }}年</el-descriptions-item>
        <el-descriptions-item label="期望职位">{{ currentResume?.expect_job }}</el-descriptions-item>
        <el-descriptions-item label="期望薪资">{{ currentResume?.expect_salary ? currentResume.expect_salary + 'K' : '面议' }}</el-descriptions-item>
        <el-descriptions-item label="自我评价" :span="2">{{ currentResume?.self_evaluation || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled, Edit, Download } from '@element-plus/icons-vue'
import { getMyResume, getResumeList, saveResume as saveResumeApi, getResumeById } from '@/api/system'

const loading = ref(false)
const saving = ref(false)
const myResume = ref(null)
const resumeList = ref([])
const editDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentResume = ref(null)
const formRef = ref()

const educationMap = { 1: '不限', 2: '大专', 3: '本科', 4: '硕士', 5: '博士' }

// 判断是否是求职者
const isJobseeker = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.userType === 2 || user.userType === 3 // 求职者或学生
    } catch (e) {}
  }
  return true
})

const queryForm = reactive({ keyword: '', education: null })

const resumeForm = reactive({
  id: null,
  realName: '',
  gender: 1,
  phone: '',
  email: '',
  education: 3,
  school: '',
  major: '',
  workYears: 0,
  expectJob: '',
  expectSalary: null,
  expectPlace: '',
  selfEvaluation: '',
  attachmentUrl: ''
})

const rules = {
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

const uploadUrl = '/api/file/upload'
const uploadHeaders = computed(() => ({
  Authorization: localStorage.getItem('token') || ''
}))

const loadMyResume = async () => {
  try {
    const res = await getMyResume()
    myResume.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const loadResumeList = async () => {
  loading.value = true
  try {
    const res = await getResumeList(queryForm)
    resumeList.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  if (myResume.value) {
    Object.assign(resumeForm, {
      id: myResume.value.id,
      realName: myResume.value.real_name,
      gender: myResume.value.gender,
      phone: myResume.value.phone,
      email: myResume.value.email,
      education: myResume.value.education,
      school: myResume.value.school,
      major: myResume.value.major,
      workYears: myResume.value.work_years,
      expectJob: myResume.value.expect_job,
      expectSalary: myResume.value.expect_salary,
      expectPlace: myResume.value.expect_place,
      selfEvaluation: myResume.value.self_evaluation,
      attachmentUrl: myResume.value.attachment_url
    })
  } else {
    Object.assign(resumeForm, {
      id: null, realName: '', gender: 1, phone: '', email: '',
      education: 3, school: '', major: '', workYears: 0,
      expectJob: '', expectSalary: null, expectPlace: '', selfEvaluation: '', attachmentUrl: ''
    })
  }
  editDialogVisible.value = true
}

const saveResume = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  
  saving.value = true
  try {
    await saveResumeApi(resumeForm)
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    loadMyResume()
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleUploadSuccess = (res) => {
  if (res.code === 200) {
    resumeForm.attachmentUrl = res.data.path
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败')
  }
}

const viewResume = async (row) => {
  try {
    const res = await getResumeById(row.id)
    currentResume.value = res.data
    detailDialogVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

const downloadResume = () => {
  if (myResume.value?.attachment_url) {
    window.open(`/api/file/download/${myResume.value.attachment_url}`)
  }
}

const downloadResumeFile = (row) => {
  if (row.attachment_url) {
    window.open(`/api/file/download/${row.attachment_url}`)
  }
}

onMounted(() => {
  if (isJobseeker.value) {
    loadMyResume()
  } else {
    loadResumeList()
  }
})
</script>

<style lang="scss" scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 16px; }
.resume-preview {
  .resume-header { display: flex; align-items: center; gap: 20px;
    .resume-basic { h2 { margin: 0 0 8px; } p { margin: 4px 0; color: #666; } }
  }
  .attachment { margin-top: 16px; }
}
</style>
