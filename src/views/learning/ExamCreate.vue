<template>
  <div class="exam-create-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑考试' : '创建考试' }}</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>

      <el-steps :active="currentStep" finish-status="success" align-center style="margin-bottom: 30px">
        <el-step title="基本信息" />
        <el-step title="添加题目" />
        <el-step title="发布考试" />
      </el-steps>

      <!-- 步骤1: 基本信息 -->
      <div v-show="currentStep === 0" class="step-content">
        <el-form ref="basicFormRef" :model="examForm" :rules="basicRules" label-width="100px" style="max-width: 600px">
          <el-form-item label="考试名称" prop="examName">
            <el-input v-model="examForm.examName" placeholder="请输入考试名称" />
          </el-form-item>
          <el-form-item label="关联课程">
            <el-select v-model="examForm.courseId" placeholder="选择关联课程(可选)" style="width: 100%">
              <el-option v-for="c in courseList" :key="c.id" :label="c.courseName" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="考试时长">
            <el-input-number v-model="examForm.duration" :min="10" :max="300" /> 分钟
          </el-form-item>
          <el-form-item label="总分">
            <el-input-number v-model="examForm.totalScore" :min="10" :max="200" />
          </el-form-item>
          <el-form-item label="及格分数">
            <el-input-number v-model="examForm.passScore" :min="0" :max="examForm.totalScore" />
          </el-form-item>
          <el-form-item label="考试时间">
            <el-date-picker v-model="examForm.timeRange" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间" style="width: 100%" />
          </el-form-item>
          <el-form-item label="允许次数">
            <el-input-number v-model="examForm.allowTimes" :min="0" /> <span style="color:#999;margin-left:8px">0表示不限</span>
          </el-form-item>
          <el-form-item label="考试说明">
            <el-input v-model="examForm.description" type="textarea" :rows="3" placeholder="请输入考试说明" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2: 添加题目 -->
      <div v-show="currentStep === 1" class="step-content">
        <div class="question-header">
          <el-button type="primary" @click="addQuestion(1)">添加单选题</el-button>
          <el-button type="success" @click="addQuestion(2)">添加多选题</el-button>
          <el-button type="warning" @click="addQuestion(3)">添加判断题</el-button>
          <el-button type="info" @click="addQuestion(5)">添加简答题</el-button>
        </div>
        <div class="question-list">
          <div v-for="(q, index) in questions" :key="q.id" class="question-item">
            <div class="question-title">
              <span class="q-num">{{ index + 1 }}.</span>
              <el-tag :type="getQuestionTypeTag(q.questionType)" size="small">{{ getQuestionTypeName(q.questionType) }}</el-tag>
              <el-input-number v-model="q.score" :min="1" :max="50" size="small" style="width:80px;margin-left:10px" /> 分
              <el-button type="danger" link @click="questions.splice(index, 1)" style="margin-left:auto">删除</el-button>
            </div>
            <el-input v-model="q.questionContent" type="textarea" :rows="2" placeholder="请输入题目内容" style="margin: 10px 0" />
            
            <!-- 选择题选项 -->
            <div v-if="q.questionType === 1 || q.questionType === 2" class="options-area">
              <div v-for="(opt, oi) in q.options" :key="oi" class="option-item">
                <span class="opt-label">{{ String.fromCharCode(65 + oi) }}.</span>
                <el-input v-model="q.options[oi]" placeholder="选项内容" style="flex:1" />
                <el-button type="danger" link @click="q.options.splice(oi, 1)" v-if="q.options.length > 2">删除</el-button>
              </div>
              <el-button type="primary" link @click="q.options.push('')" v-if="q.options.length < 6">+ 添加选项</el-button>
              <div class="correct-answer">
                <span>正确答案：</span>
                <el-radio-group v-if="q.questionType === 1" v-model="q.correctAnswer">
                  <el-radio v-for="(opt, oi) in q.options" :key="oi" :value="String.fromCharCode(65 + oi)">{{ String.fromCharCode(65 + oi) }}</el-radio>
                </el-radio-group>
                <el-checkbox-group v-else v-model="q.correctAnswerArr">
                  <el-checkbox v-for="(opt, oi) in q.options" :key="oi" :value="String.fromCharCode(65 + oi)">{{ String.fromCharCode(65 + oi) }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            
            <!-- 判断题 -->
            <div v-if="q.questionType === 3" class="correct-answer">
              <span>正确答案：</span>
              <el-radio-group v-model="q.correctAnswer">
                <el-radio value="T">正确</el-radio>
                <el-radio value="F">错误</el-radio>
              </el-radio-group>
            </div>
            
            <!-- 简答题参考答案 -->
            <div v-if="q.questionType === 5">
              <el-input v-model="q.correctAnswer" type="textarea" :rows="2" placeholder="参考答案(用于批改参考)" />
            </div>
            
            <el-input v-model="q.analysis" placeholder="答案解析(可选)" style="margin-top:10px" />
          </div>
          <el-empty v-if="!questions.length" description="暂无题目，请添加" />
        </div>
        <div class="question-summary">
          共 {{ questions.length }} 题，总分 {{ totalQuestionScore }} 分
        </div>
      </div>

      <!-- 步骤3: 发布考试 -->
      <div v-show="currentStep === 2" class="step-content">
        <el-result icon="success" title="考试信息已完善">
          <template #sub-title>
            <div class="preview-info">
              <p><strong>考试名称：</strong>{{ examForm.examName }}</p>
              <p><strong>考试时长：</strong>{{ examForm.duration }} 分钟</p>
              <p><strong>总分/及格：</strong>{{ examForm.totalScore }} / {{ examForm.passScore }} 分</p>
              <p><strong>题目数量：</strong>{{ questions.length }} 题</p>
              <p><strong>实际总分：</strong>{{ totalQuestionScore }} 分</p>
            </div>
          </template>
          <template #extra>
            <el-button @click="saveDraft">保存草稿</el-button>
            <el-button type="primary" @click="publishExam">立即发布</el-button>
          </template>
        </el-result>
      </div>

      <div class="step-actions">
        <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
        <el-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const isEdit = ref(false)
const currentStep = ref(0)
const basicFormRef = ref()

const examForm = reactive({
  examName: '',
  courseId: null,
  duration: 60,
  totalScore: 100,
  passScore: 60,
  timeRange: null,
  allowTimes: 0,
  description: ''
})

const basicRules = {
  examName: [{ required: true, message: '请输入考试名称', trigger: 'blur' }]
}

const courseList = ref([
  { id: 1, courseName: 'Java基础入门' },
  { id: 2, courseName: 'Spring Boot实战' }
])

const questions = ref([])
let questionId = 1

const totalQuestionScore = computed(() => questions.value.reduce((sum, q) => sum + q.score, 0))

const addQuestion = (type) => {
  questions.value.push({
    id: questionId++,
    questionType: type,
    questionContent: '',
    options: type === 1 || type === 2 ? ['', '', '', ''] : [],
    correctAnswer: '',
    correctAnswerArr: [],
    analysis: '',
    score: type === 5 ? 10 : 5
  })
}

const getQuestionTypeName = (type) => {
  const map = { 1: '单选题', 2: '多选题', 3: '判断题', 4: '填空题', 5: '简答题' }
  return map[type] || ''
}

const getQuestionTypeTag = (type) => {
  const map = { 1: 'primary', 2: 'success', 3: 'warning', 4: 'info', 5: '' }
  return map[type] || ''
}

const nextStep = async () => {
  if (currentStep.value === 0) {
    await basicFormRef.value.validate()
  }
  if (currentStep.value === 1 && questions.value.length === 0) {
    ElMessage.warning('请至少添加一道题目')
    return
  }
  currentStep.value++
}

const saveDraft = () => {
  ElMessage.success('草稿已保存')
}

const publishExam = () => {
  ElMessage.success('考试发布成功')
  router.push('/exam')
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.step-content { min-height: 400px; padding: 20px 0; }
.question-header { margin-bottom: 20px; display: flex; gap: 10px; }
.question-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.question-title {
  display: flex;
  align-items: center;
  .q-num { font-weight: bold; margin-right: 8px; }
}
.options-area { padding-left: 20px; }
.option-item {
  display: flex;
  align-items: center;
  margin: 8px 0;
  .opt-label { width: 24px; font-weight: bold; }
}
.correct-answer {
  margin-top: 12px;
  padding: 10px;
  background: #e8f4ff;
  border-radius: 4px;
}
.question-summary {
  text-align: center;
  padding: 16px;
  background: #f0f9eb;
  border-radius: 8px;
  color: #67c23a;
  font-weight: bold;
}
.preview-info {
  text-align: left;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  p { margin: 8px 0; }
}
.step-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>
