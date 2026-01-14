<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>组织管理</span>
          <el-button type="primary"><el-icon><Plus /></el-icon>新增组织</el-button>
        </div>
      </template>
      <el-tree :data="treeData" :props="{ label: 'name', children: 'children' }" default-expand-all>
        <template #default="{ node, data }">
          <div class="tree-node">
            <span>{{ data.name }}</span>
            <span class="tree-actions">
              <el-button type="primary" link size="small">编辑</el-button>
              <el-button type="success" link size="small">添加子级</el-button>
              <el-button type="danger" link size="small">删除</el-button>
            </span>
          </div>
        </template>
      </el-tree>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const treeData = ref([
  {
    id: 1,
    name: '郫都区人社局',
    children: [
      { id: 2, name: '就业促进科' },
      { id: 3, name: '职业能力建设科' },
      { id: 4, name: '人才服务中心' }
    ]
  },
  {
    id: 5,
    name: '成都工业学院',
    children: [
      { id: 6, name: '计算机学院' },
      { id: 7, name: '机械工程学院' }
    ]
  },
  {
    id: 8,
    name: '四川传媒学院',
    children: [
      { id: 9, name: '新媒体学院' }
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
.tree-node {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;
}
.tree-actions {
  opacity: 0;
  transition: opacity 0.3s;
}
.el-tree-node:hover .tree-actions {
  opacity: 1;
}
</style>
