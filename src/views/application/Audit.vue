<template>
  <div class="page">
    <el-card>
      <template #header>
        <span>申报审核</span>
      </template>
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="申报类型">
          <el-select v-model="queryForm.type" placeholder="请选择" clearable style="width: 160px">
            <el-option label="高技能人才培训补贴" :value="1" />
            <el-option label="获奖项目启动资金" :value="2" />
            <el-option label="创业项目启动资金" :value="3" />
            <el-option label="技能大师工作室" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="待审核" :value="0" />
            <el-option label="审核中" :value="1" />
            <el-option label="已通过" :value="2" />
            <el-option label="已驳回" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="application_no" label="申报编号" width="150" />
        <el-table-column prop="application_type" label="申报类型" width="160">
          <template #default="{ row }">{{ getTypeName(row.application_type) }}</template>
        </el-table-column>
        <el-table-column prop="title" label="申报标题" min-width="200" />
        <el-table-column prop="applicant_name" label="申报人" width="100" />
        <el-table-column prop="org_name" label="所属机构" width="150" />
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
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button v-if="row.status === 0 || row.status === 1" type="success" link @click="handleAudit(row)">审核</el-button>
            <el-button type="info" link @click="handleViewRecords(row)">记录</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" title="审核申报" width="500px">
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="申报标题">
          <span>{{ currentRow?.title }}</span>
        </el-form-item>
        <el-form-item label="申报金额">
          <span class="amount">¥{{ currentRow?.amount?.toLocaleString() }}</span>
        </el-form-item>
        <el-form-item label="审核结果" required>
          <el-radio-group v-model="auditForm.result">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">不通过</el-radio>
            <el-radio :label="3">候补</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="auditForm.remark" type="textarea" :rows="4" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit" :loading="submitting">确认审核</el-button>
      </template>
    </el-dialog>

    <!-- 审核记录对话框 -->
    <el-dialog v-model="recordsDialogVisible" title="审核记录" width="600px">
      <el-timeline>
        <el-timeline-item 
          v-for="record in auditRecords" 
          :key="record.id"
          :timestamp="record.create_time"
          :type="record.audit_result === 1 ? 'success' : (record.audit_result === 2 ? 'danger' : 'warning')"
        >
          <p><strong>{{ record.auditor_name }}</strong> {{ getAuditResultName(record.audit_result) }}</p>
          <p v-if="record.audit_remark" style="color: #666;">{{ record.audit_remark }}</p>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-if="!auditRecords.length" description="暂无审核记录" />
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="申报详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申报编号">{{ currentRow?.application_no }}</el-descriptions-item>
        <el-descriptions-item label="申报类型">{{ getTypeName(currentRow?.application_type) }}</el-descriptions-item>
        <el-descriptions-item label="申报标题" :span="2">{{ currentRow?.title }}</el-descriptions-item>
        <el-descriptions-item label="申报人">{{ currentRow?.applicant_name }}</el-descriptions-item>
        <el-descriptions-item label="所属机构">{{ currentRow?.org_name }}</el-descriptions-item>
        <el-descriptions-item label="申报金额">
          <span class="amount">¥{{ currentRow?.amount?.toLocaleString() }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(currentRow?.status)">{{ getStatusName(currentRow?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申报说明" :span="2">{{ currentRow?.description || '无' }}</el-descriptions-item>
        <el-descriptions-item label="最终意见" :span="2">{{ currentRow?.final_remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getApplicationList, auditApplication, getAuditRecords } from '@/api/system'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const currentRow = ref(null)
const auditDialogVisible = ref(false)
const recordsDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const auditRecords = ref([])

const queryForm = reactive({ type: null, status: null })
const auditForm = reactive({ result: 1, remark: '' })

const typeMap = { 1: '高技能人才培训补贴', 2: '获奖项目启动资金', 3: '创业项目启动资金', 4: '技能大师工作室' }
const statusMap = { 0: { name: '待审核', tag: 'warning' }, 1: { name: '审核中', tag: '' }, 2: { name: '已通过', tag: 'success' }, 3: { name: '已驳回', tag: 'danger' }, 4: { name: '候补', tag: 'info' } }
const auditResultMap = { 1: '审核通过', 2: '审核不通过', 3: '标记为候补', 4: '退回修改' }

const getTypeName = (type) => typeMap[type] || type
const getStatusName = (status) => statusMap[status]?.name || status
const getStatusTag = (status) => statusMap[status]?.tag || ''
const getAuditResultName = (result) => auditResultMap[result] || result

const loadData = async () => {
  loading.value = true
  try {
    const res = await getApplicationList(queryForm)
    tableData.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryForm.type = null
  queryForm.status = null
  loadData()
}

const handleView = (row) => {
  currentRow.value = row
  detailDialogVisible.value = true
}

const handleAudit = (row) => {
  currentRow.value = row
  auditForm.result = 1
  auditForm.remark = ''
  auditDialogVisible.value = true
}

const submitAudit = async () => {
  if (!auditForm.result) {
    ElMessage.warning('请选择审核结果')
    return
  }
  submitting.value = true
  try {
    await auditApplication(currentRow.value.id, auditForm)
    ElMessage.success('审核成功')
    auditDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error('审核失败')
  } finally {
    submitting.value = false
  }
}

const handleViewRecords = async (row) => {
  currentRow.value = row
  try {
    const res = await getAuditRecords(row.id)
    auditRecords.value = res.data || []
    recordsDialogVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.search-form { margin-bottom: 16px; }
.amount { color: #F56C6C; font-weight: 600; }
</style>
