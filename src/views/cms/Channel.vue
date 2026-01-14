<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>栏目管理</span>
          <el-button type="primary"><el-icon><Plus /></el-icon>新增栏目</el-button>
        </div>
      </template>
      <el-table :data="tableData" row-key="id" :tree-props="{ children: 'children' }" border>
        <el-table-column prop="name" label="栏目名称" width="200" />
        <el-table-column prop="code" label="栏目编码" width="150" />
        <el-table-column prop="articleCount" label="文章数量" width="100" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default>
            <el-button type="primary" link>编辑</el-button>
            <el-button type="success" link>添加子栏目</el-button>
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
    id: 1, name: '平台公告', code: 'notice', articleCount: 15, sort: 1, status: 1,
    children: [
      { id: 11, name: '重要通知', code: 'notice_important', articleCount: 8, sort: 1, status: 1 },
      { id: 12, name: '一般通知', code: 'notice_normal', articleCount: 7, sort: 2, status: 1 }
    ]
  },
  { id: 2, name: '政策法规', code: 'policy', articleCount: 23, sort: 2, status: 1 },
  { id: 3, name: '新闻动态', code: 'news', articleCount: 45, sort: 3, status: 1 },
  { id: 4, name: '培训资讯', code: 'training', articleCount: 12, sort: 4, status: 1 },
  { id: 5, name: '招聘信息', code: 'recruitment', articleCount: 67, sort: 5, status: 1 }
])
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
