<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary"><el-icon><Plus /></el-icon>新增角色</el-button>
        </div>
      </template>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default>
            <el-button type="primary" link>编辑</el-button>
            <el-button type="warning" link>权限配置</el-button>
            <el-button type="danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tableData = ref([
  { id: 1, name: '超级管理员', code: 'SUPER_ADMIN', description: '系统超级管理员，拥有所有权限', status: 1 },
  { id: 2, name: '平台管理员', code: 'ADMIN', description: '平台管理员，管理日常运营', status: 1 },
  { id: 3, name: '企业HR', code: 'ENTERPRISE_HR', description: '企业招聘负责人', status: 1 },
  { id: 4, name: '高校辅导员', code: 'COUNSELOR', description: '高校辅导员，管理学生', status: 1 },
  { id: 5, name: '培训讲师', code: 'TEACHER', description: '在线课程讲师', status: 1 }
])
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
