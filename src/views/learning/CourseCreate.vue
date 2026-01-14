<template>
  <div class="course-create-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑课程' : '创建课程' }}</span>
        </div>
      </template>

      <el-steps :active="currentStep" finish-status="success" align-center style="margin-bottom: 30px">
        <el-step title="基本信息" />
        <el-step title="课程章节" />
        <el-step title="上传资源" />
        <el-step title="发布课程" />
      </el-steps>

      <!-- 步骤1: 基本信息 -->
      <div v-show="currentStep === 0" class="step-content">
        <el-form ref="basicFormRef" :model="courseForm" :rules="basicRules" label-width="100px" style="max-width: 700px">
          <el-form-item label="课程名称" prop="courseName">
            <el-input v-model="courseForm.courseName" placeholder="请输入课程名称" />
          </el-form-item>
          <el-form-item label="课程封面">
            <el-upload
              class="cover-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :data="{ type: 'image' }"
              :show-file-list="false"
              :on-success="handleCoverSuccess"
              :before-upload="beforeCoverUpload"
            >
              <img v-if="courseForm.coverUrl" :src="courseForm.coverUrl" class="cover-preview" />
              <el-icon v-else class="cover-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">支持jpg、png格式，建议尺寸 800x450</div>
          </el-form-item>
          <el-form-item label="课程类型" prop="courseType">
            <el-radio-group v-model="courseForm.courseType">
              <el-radio :value="1">公共课程</el-radio>
              <el-radio :value="2">本校课程</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="难度等级">
            <el-select v-model="courseForm.difficulty" style="width: 200px">
              <el-option label="入门" :value="1" />
              <el-option label="初级" :value="2" />
              <el-option label="中级" :value="3" />
              <el-option label="高级" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="课程简介" prop="introduction">
            <el-input v-model="courseForm.introduction" type="textarea" :rows="3" placeholder="请输入课程简介" />
          </el-form-item>
          <el-form-item label="课程详情">
            <el-input v-model="courseForm.description" type="textarea" :rows="6" placeholder="请输入课程详细介绍" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2: 课程章节 -->
      <div v-show="currentStep === 1" class="step-content">
        <div class="chapter-header">
          <el-button type="primary" @click="addChapter">
            <el-icon><Plus /></el-icon>添加章节
          </el-button>
        </div>
        <div class="chapter-list">
          <div v-for="(chapter, cIndex) in chapters" :key="chapter.id" class="chapter-item">
            <div class="chapter-title">
              <el-icon class="drag-handle"><Rank /></el-icon>
              <span>第{{ cIndex + 1 }}章</span>
              <el-input v-model="chapter.chapterName" placeholder="请输入章节名称" style="width: 300px; margin: 0 10px" />
              <el-button type="primary" link @click="addLesson(chapter)">添加课时</el-button>
              <el-button type="danger" link @click="removeChapter(cIndex)">删除</el-button>
            </div>
            <div class="lesson-list">
              <div v-for="(lesson, lIndex) in chapter.lessons" :key="lesson.id" class="lesson-item">
                <el-icon><VideoPlay /></el-icon>
                <el-input v-model="lesson.lessonName" placeholder="课时名称" style="width: 250px; margin: 0 10px" />
                <el-select v-model="lesson.lessonType" style="width: 100px">
                  <el-option label="视频" :value="1" />
                  <el-option label="文档" :value="2" />
                  <el-option label="音频" :value="3" />
                </el-select>
                <el-button type="danger" link @click="removeLesson(chapter, lIndex)">删除</el-button>
              </div>
            </div>
          </div>
          <el-empty v-if="!chapters.length" description="暂无章节，请添加" />
        </div>
      </div>

      <!-- 步骤3: 上传资源 -->
      <div v-show="currentStep === 2" class="step-content">
        <el-alert title="支持上传视频(mp4/avi)、文档(doc/docx/pdf)、PPT(ppt/pptx)等格式，文件将上传至云存储" type="info" :closable="false" style="margin-bottom: 20px" />
        
        <el-upload
          class="resource-uploader"
          drag
          :action="uploadUrl"
          :headers="uploadHeaders"
          :data="{ type: 'courseware' }"
          multiple
          :on-success="handleResourceSuccess"
          :on-progress="handleResourceProgress"
          :before-upload="beforeResourceUpload"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">单个文件不超过500MB，视频文件建议使用mp4格式</div>
          </template>
        </el-upload>

        <div class="resource-list" v-if="resources.length">
          <h4>已上传资源 ({{ resources.length }}个)</h4>
          <el-table :data="resources" stripe>
            <el-table-column prop="name" label="文件名" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)" size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" width="100" />
            <el-table-column prop="bindLesson" label="关联课时" width="200">
              <template #default="{ row }">
                <el-select v-model="row.lessonId" placeholder="选择课时" size="small" style="width: 100%">
                  <el-option-group v-for="chapter in chapters" :key="chapter.id" :label="chapter.chapterName">
                    <el-option v-for="lesson in chapter.lessons" :key="lesson.id" :label="lesson.lessonName" :value="lesson.id" />
                  </el-option-group>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button type="danger" link @click="resources.splice($index, 1)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 步骤4: 发布课程 -->
      <div v-show="currentStep === 3" class="step-content">
        <div class="publish-preview">
          <el-result icon="success" title="课程信息已完善">
            <template #sub-title>
              <div class="preview-info">
                <p><strong>课程名称：</strong>{{ courseForm.courseName }}</p>
                <p><strong>课程类型：</strong>{{ courseForm.courseType === 1 ? '公共课程' : '本校课程' }}</p>
                <p><strong>章节数量：</strong>{{ chapters.length }} 章</p>
                <p><strong>课时数量：</strong>{{ totalLessons }} 课时</p>
                <p><strong>资源数量：</strong>{{ resources.length }} 个</p>
              </div>
            </template>
            <template #extra>
              <el-button @click="saveDraft" :loading="saving">保存草稿</el-button>
              <el-button type="primary" @click="publishCourse" :loading="publishing">立即发布</el-button>
            </template>
          </el-result>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="step-actions">
        <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
        <el-button v-if="currentStep < 3" type="primary" @click="nextStep">下一步</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useUserStore } from '../../stores/user'
import { saveCourse } from '../../api/system'

const router = useRouter()
const userStore = useUserStore()
const isEdit = ref(false)
const currentStep = ref(0)
const basicFormRef = ref()
const saving = ref(false)
const publishing = ref(false)

// 上传配置
const uploadUrl = '/api/file/upload'
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}))

const courseForm = reactive({
  courseName: '',
  coverUrl: '',
  courseType: 1,
  difficulty: 1,
  introduction: '',
  description: ''
})

const basicRules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  courseType: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  introduction: [{ required: true, message: '请输入课程简介', trigger: 'blur' }]
}

const chapters = ref([])
const resources = ref([])

let chapterId = 1
let lessonId = 1

const totalLessons = computed(() => {
  return chapters.value.reduce((sum, ch) => sum + ch.lessons.length, 0)
})

const addChapter = () => {
  chapters.value.push({
    id: chapterId++,
    chapterName: '',
    lessons: []
  })
}

const removeChapter = (index) => {
  chapters.value.splice(index, 1)
}

const addLesson = (chapter) => {
  chapter.lessons.push({
    id: lessonId++,
    lessonName: '',
    lessonType: 1
  })
}

const removeLesson = (chapter, index) => {
  chapter.lessons.splice(index, 1)
}

const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!')
    return false
  }
  return true
}

const handleCoverSuccess = (res) => {
  if (res.code === 200) {
    courseForm.coverUrl = res.data.url
    ElMessage.success('封面上传成功')
  } else {
    ElMessage.error(res.message || '上传失败')
  }
}

const beforeResourceUpload = (file) => {
  const isLt500M = file.size / 1024 / 1024 < 500
  if (!isLt500M) {
    ElMessage.error('文件大小不能超过500MB!')
    return false
  }
  return true
}

const handleResourceSuccess = (res, file) => {
  if (res.code === 200) {
    resources.value.push({
      id: Date.now(),
      name: file.name,
      type: getFileType(file.name),
      size: formatSize(file.size),
      url: res.data?.url || '',
      lessonId: null
    })
    ElMessage.success(`${file.name} 上传成功`)
  } else {
    ElMessage.error(res.message || '上传失败')
  }
}

const handleResourceProgress = () => {}

const getFileType = (name) => {
  const ext = name.split('.').pop().toLowerCase()
  const typeMap = {
    mp4: '视频', avi: '视频', mov: '视频', mkv: '视频',
    doc: '文档', docx: '文档', pdf: 'PDF',
    ppt: 'PPT', pptx: 'PPT',
    mp3: '音频', wav: '音频'
  }
  return typeMap[ext] || '其他'
}

const getTypeTagType = (type) => {
  const map = { '视频': 'success', 'PDF': 'warning', 'PPT': 'danger', '文档': 'info', '音频': '' }
  return map[type] || 'info'
}

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}

const nextStep = async () => {
  if (currentStep.value === 0) {
    await basicFormRef.value.validate()
  }
  if (currentStep.value === 1 && chapters.value.length === 0) {
    ElMessage.warning('请至少添加一个章节')
    return
  }
  currentStep.value++
}

const buildCourseData = (status) => {
  return {
    ...courseForm,
    status,
    chapters: chapters.value.map((ch, cIdx) => ({
      chapterName: ch.chapterName,
      sortOrder: cIdx + 1,
      lessons: ch.lessons.map((ls, lIdx) => ({
        lessonName: ls.lessonName,
        lessonType: ls.lessonType,
        sortOrder: lIdx + 1,
        resourceUrl: resources.value.find(r => r.lessonId === ls.id)?.url || ''
      }))
    }))
  }
}

const saveDraft = async () => {
  saving.value = true
  try {
    const data = buildCourseData(1) // 1=草稿
    const res = await saveCourse(data)
    if (res.data.code === 200) {
      ElMessage.success('草稿已保存')
    } else {
      ElMessage.error(res.data.message || '保存失败')
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const publishCourse = async () => {
  publishing.value = true
  try {
    const data = buildCourseData(2) // 2=已发布
    const res = await saveCourse(data)
    if (res.data.code === 200) {
      ElMessage.success('课程发布成功')
      router.push('/course')
    } else {
      ElMessage.error(res.data.message || '发布失败')
    }
  } catch (e) {
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
}
</script>

<style lang="scss" scoped>
.card-header {
  font-size: 18px;
  font-weight: 600;
}

.step-content {
  min-height: 400px;
  padding: 20px 0;
}

.cover-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    width: 200px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #409EFF;
    }
  }

  .cover-preview {
    width: 200px;
    height: 120px;
    object-fit: cover;
  }

  .cover-icon {
    font-size: 40px;
    color: #8c939d;
  }
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.chapter-header {
  margin-bottom: 20px;
}

.chapter-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  .chapter-title {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .drag-handle {
      cursor: move;
      margin-right: 10px;
      color: #999;
    }
  }

  .lesson-list {
    padding-left: 30px;

    .lesson-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px dashed #eee;

      &:last-child {
        border-bottom: none;
      }
    }
  }
}

.resource-uploader {
  margin-bottom: 20px;
}

.resource-list {
  h4 {
    margin-bottom: 16px;
    color: #333;
  }
}

.publish-preview {
  .preview-info {
    text-align: left;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    margin: 20px 0;

    p {
      margin: 8px 0;
      color: #666;

      strong {
        color: #333;
      }
    }
  }
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>
