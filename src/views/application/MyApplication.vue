<template>
  <div class="application-page">
    <!-- 申报类型选择 -->
    <el-row :gutter="20" class="type-cards">
      <el-col :xs="12" :sm="6" v-for="type in applicationTypes" :key="type.value">
        <div class="type-card" :class="{ active: selectedType === type.value }" @click="selectType(type.value)">
          <el-icon class="type-icon" :style="{ color: type.color }"><component :is="type.icon" /></el-icon>
          <div class="type-name">{{ type.label }}</div>
          <div class="type-desc">{{ type.desc }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的申报</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新建申报
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="application_no" label="申报编号" width="160" />
        <el-table-column prop="application_type" label="申报类型" width="160">
          <template #default="{ row }">{{ getTypeName(row.application_type) }}</template>
        </el-table-column>
        <el-table-column prop="title" label="申报标题" min-width="200" />
        <el-table-column prop="amount" label="申报金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="申报时间" width="170" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button v-if="row.status === 0" type="danger" link @click="handleDelete(row)">撤回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建申报对话框 -->
    <el-dialog v-model="dialogVisible" title="新建申报" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="申报类型" prop="applicationType">
          <el-select v-model="form.applicationType" placeholder="请选择申报类型" style="width: 100%">
            <el-option v-for="type in applicationTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="申报标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入申报标题" />
        </el-form-item>
        <el-form-item label="申报金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="申报说明" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入申报说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">提交申报</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="申报详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申报编号">{{ currentRow?.application_no }}</el-descriptions-item>
        <el-descriptions-item label="申报类型">{{ getTypeName(currentRow?.application_type) }}</el-descriptions-item>
        <el-descriptions-item label="申报标题" :span="2">{{ currentRow?.title }}</el-descriptions-item>
        <el-descriptions-item label="申报金额">
          <span class="amount">¥{{ currentRow?.amount?.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(currentRow?.status)">{{ getStatusName(currentRow?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申报说明" :span="2">{{ currentRow?.description || '无' }}</el-descriptions-item>
        <el-descriptions-item label="审核意见" :span="2">{{ currentRow?.final_remark || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyApplications, submitApplication } from '@/api/system'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const selectedType = ref('')
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentRow = ref(null)
const formRef = ref()

const applicationTypes = [
  { value: 1, label: '高技能人才培训补贴', desc: '培训补贴申报', icon: 'Medal', color: '#409EFF' },
  { value: 2, label: '获奖项目启动资金', desc: '获奖项目补贴', icon: 'Trophy', color: '#E6A23C' },
  { value: 3, label: '创业项目启动资金', desc: '创业扶持资金', icon: 'Opportunity', color: '#67C23A' },
  { value: 4, label: '技能大师工作室', desc: '工作室申报', icon: 'Money', color: '#F56C6C' }
]

const form = reactive({
  applicationType: null,
  title: '',
  amount: 0,
  description: ''
})

const rules = {
  applicationType: [{ required: true, message: '请选择申报类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入申报标题', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入申报金额', trigger: 'blur' }]
}

const statusMap = { 0: { name: '待审核', tag: 'warning' }, 1: { name: '审核中', tag: '' }, 2: { name: '已通过', tag: 'success' }, 3: { name: '已驳回', tag: 'danger' }, 4: { name: '候补', tag: 'info' } }

const getTypeName = (type) => applicationTypes.find(t => t.value === type)?.label || type
const getStatusName = (status) => statusMap[status]?.name || status
const getStatusTag = (status) => statusMap[status]?.tag || ''

const selectType = (type) => {
  selectedType.value = selectedType.value === type ? '' : type
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMyApplications()
    let data = res.data || []
    if (selectedType.value) {
      data = data.filter(item => item.application_type === selectedType.value)
    }
    tableData.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  form.applicationType = selectedType.value || null
  form.title = ''
  form.amount = 0
  form.description = ''
  dialogVisible.value = true
}

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  
  submitting.value = true
  try {
    await submitApplication(form)
    ElMessage.success('申报提交成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const handleView = (row) => {
  currentRow.value = row
  detailDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要撤回该申报吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('撤回成功')
      loadData()
    })
    .catch(() => {})
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.type-cards {
  margin-bottom: 20px;
  .type-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    border: 2px solid transparent;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    &:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
    &.active { border-color: #409EFF; background: #ecf5ff; }
    .type-icon { font-size: 36px; margin-bottom: 12px; }
    .type-name { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 4px; }
    .type-desc { font-size: 12px; color: #999; }
  }
}
.card-header { display: flex; justify-content: space-between; align-items: center; }
.amount { color: #F56C6C; font-weight: 600; }
</style>
