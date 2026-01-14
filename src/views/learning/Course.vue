<template>
  <div class="course-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ canManage ? '课程管理' : '课程中心' }}</span>
          <el-button v-if="canManage" type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>创建课程
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="课程名称">
          <el-input v-model="queryForm.keyword" placeholder="请输入课程名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="课程类型">
          <el-select v-model="queryForm.courseType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="公共课程" :value="1" />
            <el-option label="本校课程" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="20" v-loading="loading">
        <el-col :xs="24" :sm="12" :lg="6" v-for="course in tableData" :key="course.id">
          <div class="course-card" @click="handleView(course)">
            <div class="course-cover">
              <div class="image-placeholder" :style="{ background: getGradient(course.id) }">
                <el-icon><VideoCamera /></el-icon>
              </div>
              <div class="course-type">
                <el-tag size="small" :type="course.course_type === 1 ? '' : 'success'">
                  {{ course.course_type === 1 ? '公共课程' : '本校课程' }}
                </el-tag>
              </div>
            </div>
            <div class="course-info">
              <h4 class="course-title">{{ course.course_name }}</h4>
              <p class="course-desc">{{ course.introduction || '暂无简介' }}</p>
              <div class="course-meta">
                <span><el-icon><User /></el-icon> {{ course.teacher_name || '未知' }}</span>
                <span><el-icon><View /></el-icon> {{ course.student_count || 0 }}人</span>
              </div>
              <div class="course-footer">
                <el-tag :type="course.status === 2 ? 'success' : 'info'" size="small">
                  {{ course.status === 2 ? '已发布' : '草稿' }}
                </el-tag>
                <div class="actions" @click.stop>
                  <el-button v-if="canManage" type="primary" link size="small" @click="handleEdit(course)">编辑</el-button>
                  <el-button v-else type="primary" size="small" @click="handleLearn(course)">学习</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-empty v-if="!loading && !tableData.length" description="暂无课程" />
    </el-card>

    <!-- 课程详情对话框 -->
    <el-dialog v-model="detailDialogVisible" :title="currentCourse?.course_name" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="课程类型">{{ currentCourse?.course_type === 1 ? '公共课程' : '本校课程' }}</el-descriptions-item>
        <el-descriptions-item label="授课讲师">{{ currentCourse?.teacher_name }}</el-descriptions-item>
        <el-descriptions-item label="学习人数">{{ currentCourse?.student_count || 0 }}人</el-descriptions-item>
        <el-descriptions-item label="是否免费">{{ currentCourse?.is_free ? '免费' : '¥' + currentCourse?.price }}</el-descriptions-item>
        <el-descriptions-item label="课程简介" :span="2">{{ currentCourse?.introduction || '暂无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button v-if="!canManage" type="primary" @click="handleLearn(currentCourse)">开始学习</el-button>
      </template>
    </el-dialog>

    <!-- 创建/编辑课程对话框 -->
    <el-dialog v-model="editDialogVisible" :title="courseForm.id ? '编辑课程' : '创建课程'" width="600px">
      <el-form :model="courseForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="courseForm.courseName" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="课程类型">
              <el-select v-model="courseForm.courseType" style="width: 100%">
                <el-option label="公共课程" :value="1" />
                <el-option label="本校课程" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="难度等级">
              <el-select v-model="courseForm.difficulty" style="width: 100%">
                <el-option label="入门" :value="1" />
                <el-option label="初级" :value="2" />
                <el-option label="中级" :value="3" />
                <el-option label="高级" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="课程简介">
          <el-input v-model="courseForm.introduction" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="发布状态">
          <el-radio-group v-model="courseForm.status">
            <el-radio :label="0">草稿</el-radio>
            <el-radio :label="2">发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCourse" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoCamera, User, View } from '@element-plus/icons-vue'
import { getCourseList, getCourseById, saveCourse as saveCourseApi, deleteCourse, recordCourseLearning } from '@/api/system'

const loading = ref(false)
const saving = ref(false)
const tableData = ref([])
const currentCourse = ref(null)
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const formRef = ref()

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
]
const getGradient = (id) => gradients[id % gradients.length]

const canManage = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.userType === 5 || user.userType === 6
    } catch (e) {}
  }
  return false
})

const queryForm = reactive({ keyword: '', courseType: null })
const courseForm = reactive({ id: null, courseName: '', courseType: 1, difficulty: 1, introduction: '', status: 0 })
const rules = { courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }] }

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCourseList(queryForm)
    tableData.value = res.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleReset = () => { queryForm.keyword = ''; queryForm.courseType = null; loadData() }

const handleView = async (course) => {
  try {
    const res = await getCourseById(course.id)
    currentCourse.value = res.data
    detailDialogVisible.value = true
  } catch (e) { console.error(e) }
}

const handleAdd = () => {
  Object.assign(courseForm, { id: null, courseName: '', courseType: 1, difficulty: 1, introduction: '', status: 0 })
  editDialogVisible.value = true
}

const handleEdit = (course) => {
  Object.assign(courseForm, { id: course.id, courseName: course.course_name, courseType: course.course_type, difficulty: course.difficulty, introduction: course.introduction, status: course.status })
  editDialogVisible.value = true
}

const saveCourse = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    await saveCourseApi(courseForm)
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    loadData()
  } catch (e) { ElMessage.error(e.response?.data?.message || '保存失败') }
  finally { saving.value = false }
}

const handleLearn = async (course) => {
  try {
    await recordCourseLearning(course.id)
    ElMessage.success('开始学习：' + course.course_name)
    detailDialogVisible.value = false
    loadData()
  } catch (e) { ElMessage.error('操作失败') }
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 20px; }
.course-card {
  background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  margin-bottom: 20px; transition: all 0.3s; cursor: pointer;
  &:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
  .course-cover { position: relative; height: 140px;
    .image-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 40px; }
    .course-type { position: absolute; top: 10px; left: 10px; }
  }
  .course-info { padding: 16px;
    .course-title { font-size: 15px; font-weight: 600; margin: 0 0 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .course-desc { font-size: 13px; color: #999; margin: 0 0 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .course-meta { display: flex; gap: 16px; font-size: 13px; color: #666; margin-bottom: 12px; span { display: flex; align-items: center; gap: 4px; } }
    .course-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #f0f0f0; }
  }
}
</style>
