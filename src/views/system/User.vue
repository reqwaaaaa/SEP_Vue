<template>
  <div class="user-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增用户
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="queryForm.username" placeholder="请输入用户名" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryForm.phone" placeholder="请输入手机号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="orgName" label="所属机构" width="150" />
        <el-table-column prop="userType" label="用户类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getUserTypeTag(row.userType)">{{ getUserTypeName(row.userType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-switch 
              v-model="row.status" 
              :active-value="1" 
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="warning" link @click="handleResetPwd(row)">
              <el-icon><Key /></el-icon>重置密码
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!form.id" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="form.userType" placeholder="请选择用户类型" style="width: 100%">
            <el-option label="求职者" value="JOBSEEKER" />
            <el-option label="学生" value="STUDENT" />
            <el-option label="企业HR" value="ENTERPRISE" />
            <el-option label="辅导员" value="COUNSELOR" />
            <el-option label="讲师" value="TEACHER" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserPage, updateUserStatus, resetUserPassword } from '../../api/system'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const formRef = ref()

const queryForm = reactive({
  username: '',
  phone: '',
  status: null
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const form = reactive({
  id: null,
  username: '',
  realName: '',
  phone: '',
  email: '',
  userType: 'JOBSEEKER',
  status: 1
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
}

const dialogTitle = computed(() => form.id ? '编辑用户' : '新增用户')

const userTypeMap = {
  JOBSEEKER: { name: '求职者', tag: '' },
  STUDENT: { name: '学生', tag: 'success' },
  ENTERPRISE: { name: '企业HR', tag: 'warning' },
  COUNSELOR: { name: '辅导员', tag: 'info' },
  TEACHER: { name: '讲师', tag: 'info' },
  ADMIN: { name: '管理员', tag: 'danger' }
}

const getUserTypeName = (type) => userTypeMap[type]?.name || type
const getUserTypeTag = (type) => userTypeMap[type]?.tag || ''

const handleSearch = async () => {
  loading.value = true
  try {
    const res = await getUserPage({
      ...queryForm,
      page: pagination.page,
      size: pagination.size
    })
    tableData.value = res.data?.records || []
    pagination.total = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryForm.username = ''
  queryForm.phone = ''
  queryForm.status = null
  pagination.page = 1
  handleSearch()
}

const handleAdd = () => {
  Object.assign(form, {
    id: null,
    username: '',
    realName: '',
    phone: '',
    email: '',
    userType: 'JOBSEEKER',
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  submitLoading.value = true
  try {
    // TODO: 调用新增/编辑API
    ElMessage.success('操作成功')
    dialogVisible.value = false
    handleSearch()
  } catch (e) {
    console.error(e)
  } finally {
    submitLoading.value = false
  }
}

const handleStatusChange = async (row) => {
  try {
    await updateUserStatus(row.id, row.status)
    ElMessage.success('状态更新成功')
  } catch (e) {
    row.status = row.status === 1 ? 0 : 1
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', { type: 'warning' })
    .then(async () => {
      // TODO: 调用删除API
      ElMessage.success('删除成功')
      handleSearch()
    })
    .catch(() => {})
}

const handleResetPwd = (row) => {
  ElMessageBox.confirm('确定要重置该用户密码为 123456 吗？', '提示', { type: 'warning' })
    .then(async () => {
      await resetUserPassword(row.id)
      ElMessage.success('密码已重置为 123456')
    })
    .catch(() => {})
}

onMounted(() => {
  handleSearch()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 16px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
