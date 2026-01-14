<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button type="primary"><el-icon><Plus /></el-icon>新增菜单</el-button>
        </div>
      </template>
      <el-table :data="tableData" row-key="id" :tree-props="{ children: 'children' }" border>
        <el-table-column prop="name" label="菜单名称" width="200" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" width="150" />
        <el-table-column prop="permission" label="权限标识" width="180" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '显示' : '隐藏' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default>
            <el-button type="primary" link>编辑</el-button>
            <el-button type="success" link>添加子级</el-button>
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
  {
    id: 1, name: '系统管理', icon: 'Setting', path: '', permission: '', sort: 1, status: 1,
    children: [
      { id: 11, name: '用户管理', icon: 'User', path: '/user', permission: 'system:user:list', sort: 1, status: 1 },
      { id: 12, name: '组织管理', icon: 'OfficeBuilding', path: '/org', permission: 'system:org:list', sort: 2, status: 1 },
      { id: 13, name: '角色管理', icon: 'UserFilled', path: '/role', permission: 'system:role:list', sort: 3, status: 1 },
      { id: 14, name: '菜单管理', icon: 'Menu', path: '/menu', permission: 'system:menu:list', sort: 4, status: 1 }
    ]
  },
  {
    id: 2, name: '招聘管理', icon: 'Briefcase', path: '', permission: '', sort: 2, status: 1,
    children: [
      { id: 21, name: '职位管理', icon: 'Tickets', path: '/job', permission: 'recruitment:job:list', sort: 1, status: 1 },
      { id: 22, name: '简历管理', icon: 'Document', path: '/resume', permission: 'recruitment:resume:list', sort: 2, status: 1 }
    ]
  }
])
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
