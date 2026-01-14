<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文章管理</span>
          <el-button type="primary"><el-icon><Plus /></el-icon>发布文章</el-button>
        </div>
      </template>
      <el-form :inline="true" class="search-form">
        <el-form-item label="标题">
          <el-input placeholder="请输入标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="栏目">
          <el-select placeholder="请选择" clearable style="width: 150px">
            <el-option label="平台公告" value="notice" />
            <el-option label="政策法规" value="policy" />
            <el-option label="新闻动态" value="news" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"><el-icon><Search /></el-icon>查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" stripe border>
        <el-table-column prop="title" label="标题" min-width="250" />
        <el-table-column prop="channel" label="栏目" width="120" />
        <el-table-column prop="author" label="作者" width="100" />
        <el-table-column prop="viewCount" label="浏览量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已发布' ? 'success' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="170" />
        <el-table-column label="操作" width="180">
          <template #default>
            <el-button type="primary" link>编辑</el-button>
            <el-button type="warning" link>预览</el-button>
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
  { id: 1, title: '关于开展2026年高技能人才培训补贴申报的通知', channel: '平台公告', author: '管理员', viewCount: 1256, status: '已发布', publishTime: '2026-01-10 10:00:00' },
  { id: 2, title: '郫都区校企合作联盟平台正式上线运营', channel: '新闻动态', author: '管理员', viewCount: 2345, status: '已发布', publishTime: '2026-01-08 09:00:00' },
  { id: 3, title: '技能大师工作室申报指南（2026年版）', channel: '政策法规', author: '管理员', viewCount: 876, status: '已发布', publishTime: '2026-01-05 14:30:00' },
  { id: 4, title: '关于举办第三届校企合作人才对接会的通知', channel: '平台公告', author: '管理员', viewCount: 0, status: '草稿', publishTime: '' }
])
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-form { margin-bottom: 16px; }
</style>
