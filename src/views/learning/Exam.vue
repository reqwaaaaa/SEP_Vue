<template>
  <div class="exam-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ canManage ? '考试管理' : '在线考试' }}</span>
          <el-button v-if="canManage" type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>创建考试
          </el-button>
        </div>
      </template>
      
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="exam_name" label="考试名称" min-width="200" />
        <el-table-column prop="course_name" label="关联课程" width="150" />
        <el-table-column prop="duration" label="考试时长" width="100">
          <template #default="{ row }">{{ row.duration }}分钟</template>
        </el-table-column>
        <el-table-column prop="total_score" label="总分" width="80" />
        <el-table-column prop="pass_score" label="及格分" width="80" />
        <el-table-column v-if="canManage" prop="exam_count" label="参考人数" width="100" />
        <el-table-column v-if="canManage" label="及格率" width="100">
          <template #default="{ row }">
            {{ row.exam_count > 0 ? Math.round(row.pass_count / row.exam_count * 100) : 0 }}%
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 0 ? 'warning' : 'info'">
              {{ statusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" :width="canManage ? 220 : 150">
          <template #default="{ row }">
            <template v-if="canManage">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" link @click="handleViewScores(row)">成绩</el-button>
              <el-button type="info" link @click="handleViewStats(row)">统计</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
            <template v-else>
              <el-button type="primary" link @click="handleViewExam(row)">查看</el-button>
              <el-button type="success" link @click="handleStartExam(row)" :disabled="row.status !== 1">参加考试</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑考试对话框 -->
    <el-dialog v-model="editDialogVisible" :title="examForm.id ? '编辑考试' : '创建考试'" width="800px" top="5vh">
      <el-form :model="examForm" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="考试名称" prop="examName">
              <el-input v-model="examForm.examName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联课程">
              <el-select v-model="examForm.courseId" placeholder="请选择" style="width: 100%" clearable>
                <el-option v-for="c in courseList" :key="c.id" :label="c.course_name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="考试时长">
              <el-input-number v-model="examForm.duration" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="总分">
              <el-input-number v-model="examForm.totalScore" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="及格分">
              <el-input-number v-model="examForm.passScore" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="考试说明">
          <el-input v-model="examForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="发布状态">
          <el-radio-group v-model="examForm.status">
            <el-radio :label="0">草稿</el-radio>
            <el-radio :label="1">发布</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-divider>题目设置</el-divider>
        <div v-for="(q, idx) in examForm.questions" :key="idx" class="question-item">
          <div class="question-header">
            <span>题目 {{ idx + 1 }}</span>
            <el-button type="danger" link @click="removeQuestion(idx)">删除</el-button>
          </div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="题型">
                <el-select v-model="q.questionType" style="width: 100%">
                  <el-option label="单选题" :value="1" />
                  <el-option label="多选题" :value="2" />
                  <el-option label="判断题" :value="3" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="分值">
                <el-input-number v-model="q.score" :min="1" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="题目内容">
            <el-input v-model="q.questionContent" type="textarea" :rows="2" />
          </el-form-item>
          <el-form-item label="选项" v-if="q.questionType !== 3">
            <el-input v-model="q.options" placeholder="A.选项1|B.选项2|C.选项3|D.选项4" />
          </el-form-item>
          <el-form-item label="正确答案">
            <el-input v-model="q.correctAnswer" :placeholder="q.questionType === 3 ? '输入 true 或 false' : '如: A 或 A,B'" style="width: 200px" />
          </el-form-item>
        </div>
        <el-button type="primary" @click="addQuestion" style="width: 100%">+ 添加题目</el-button>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveExam" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 考试统计对话框 -->
    <el-dialog v-model="statsDialogVisible" title="考试统计" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="参考人数">{{ examStats.examCount }}</el-descriptions-item>
        <el-descriptions-item label="已提交">{{ examStats.submitCount }}</el-descriptions-item>
        <el-descriptions-item label="及格人数">{{ examStats.passCount }}</el-descriptions-item>
        <el-descriptions-item label="及格率">
          {{ examStats.submitCount > 0 ? Math.round(examStats.passCount / examStats.submitCount * 100) : 0 }}%
        </el-descriptions-item>
        <el-descriptions-item label="平均分">{{ Number(examStats.avgScore || 0).toFixed(1) }}</el-descriptions-item>
        <el-descriptions-item label="最高分">{{ examStats.maxScore }}</el-descriptions-item>
        <el-descriptions-item label="最低分">{{ examStats.minScore }}</el-descriptions-item>
      </el-descriptions>
      <div class="score-distribution" v-if="examStats.distribution">
        <h4>分数分布</h4>
        <el-row :gutter="10">
          <el-col :span="6"><div class="dist-item excellent">优秀(90+): {{ examStats.distribution.excellent || 0 }}</div></el-col>
          <el-col :span="6"><div class="dist-item good">良好(80-89): {{ examStats.distribution.good || 0 }}</div></el-col>
          <el-col :span="6"><div class="dist-item pass">及格(60-79): {{ examStats.distribution.pass || 0 }}</div></el-col>
          <el-col :span="6"><div class="dist-item fail">不及格(<60): {{ examStats.distribution.fail || 0 }}</div></el-col>
        </el-row>
      </div>
    </el-dialog>

    <!-- 成绩列表对话框 -->
    <el-dialog v-model="scoresDialogVisible" title="考试成绩" width="700px">
      <el-table :data="scoreList" stripe border>
        <el-table-column prop="real_name" label="学员" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="score" label="得分" width="80">
          <template #default="{ row }">
            <span :class="{ 'text-success': row.is_pass, 'text-danger': !row.is_pass }">{{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="is_pass" label="是否及格" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_pass ? 'success' : 'danger'">{{ row.is_pass ? '及格' : '不及格' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="开始时间" width="170" />
        <el-table-column prop="submit_time" label="提交时间" width="170" />
      </el-table>
    </el-dialog>

    <!-- 参加考试对话框 -->
    <el-dialog v-model="takeExamDialogVisible" :title="currentExam?.exam_name" width="800px" :close-on-click-modal="false">
      <div class="exam-info" v-if="!examStarted">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="考试时长">{{ currentExam?.duration }}分钟</el-descriptions-item>
          <el-descriptions-item label="总分">{{ currentExam?.total_score }}分</el-descriptions-item>
          <el-descriptions-item label="及格分">{{ currentExam?.pass_score }}分</el-descriptions-item>
          <el-descriptions-item label="题目数量">{{ currentExam?.questions?.length || 0 }}题</el-descriptions-item>
          <el-descriptions-item label="考试说明" :span="2">{{ currentExam?.description || '无' }}</el-descriptions-item>
        </el-descriptions>
        <div style="text-align: center; margin-top: 20px;">
          <el-button type="primary" size="large" @click="confirmStartExam">开始答题</el-button>
        </div>
      </div>
      <div class="exam-questions" v-else>
        <div class="exam-timer">剩余时间: {{ formatTime(remainingTime) }}</div>
        <div v-for="(q, idx) in currentExam?.questions" :key="q.id" class="question-block">
          <div class="question-title">{{ idx + 1 }}. {{ q.question_content }} ({{ q.score }}分)</div>
          <div class="question-options" v-if="q.question_type === 1 || q.question_type === 2">
            <el-radio-group v-if="q.question_type === 1" v-model="userAnswers[q.id]">
              <el-radio v-for="opt in parseOptions(q.options)" :key="opt.key" :label="opt.key">{{ opt.text }}</el-radio>
            </el-radio-group>
            <el-checkbox-group v-else v-model="userAnswers[q.id]">
              <el-checkbox v-for="opt in parseOptions(q.options)" :key="opt.key" :label="opt.key">{{ opt.text }}</el-checkbox>
            </el-checkbox-group>
          </div>
          <div class="question-options" v-else-if="q.question_type === 3">
            <el-radio-group v-model="userAnswers[q.id]">
              <el-radio label="true">正确</el-radio>
              <el-radio label="false">错误</el-radio>
            </el-radio-group>
          </div>
        </div>
      </div>
      <template #footer v-if="examStarted">
        <el-button type="primary" @click="submitExamAnswers" :loading="submitting">提交答卷</el-button>
      </template>
    </el-dialog>

    <!-- 考试结果对话框 -->
    <el-dialog v-model="resultDialogVisible" title="考试结果" width="400px">
      <div class="exam-result">
        <div class="result-score" :class="{ pass: examResult?.isPass, fail: !examResult?.isPass }">
          {{ examResult?.score }}
        </div>
        <div class="result-status">
          <el-tag :type="examResult?.isPass ? 'success' : 'danger'" size="large">
            {{ examResult?.isPass ? '恭喜通过！' : '未通过' }}
          </el-tag>
        </div>
        <p>及格分数: {{ examResult?.passScore }}分</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="resultDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExamList, getExamById, saveExam as saveExamApi, deleteExam, startExam, submitExam, getExamStatistics, getExamScores, getCourseList } from '@/api/system'

const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)
const tableData = ref([])
const courseList = ref([])
const currentExam = ref(null)
const examStats = ref({})
const scoreList = ref([])
const examResult = ref(null)
const examRecordId = ref(null)
const examStarted = ref(false)
const remainingTime = ref(0)
const userAnswers = ref({})
let timer = null

const editDialogVisible = ref(false)
const statsDialogVisible = ref(false)
const scoresDialogVisible = ref(false)
const takeExamDialogVisible = ref(false)
const resultDialogVisible = ref(false)
const formRef = ref()

const statusMap = { 0: '草稿', 1: '进行中', 2: '已结束' }

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

const examForm = reactive({
  id: null, examName: '', courseId: null, duration: 60, totalScore: 100, passScore: 60,
  description: '', status: 0, questions: []
})

const rules = { examName: [{ required: true, message: '请输入考试名称', trigger: 'blur' }] }

const loadData = async () => {
  loading.value = true
  try {
    const res = await getExamList({})
    tableData.value = res.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const loadCourses = async () => {
  try {
    const res = await getCourseList({ status: 2 })
    courseList.value = res.data || []
  } catch (e) { console.error(e) }
}

const handleAdd = () => {
  Object.assign(examForm, { id: null, examName: '', courseId: null, duration: 60, totalScore: 100, passScore: 60, description: '', status: 0, questions: [] })
  editDialogVisible.value = true
}

const handleEdit = async (row) => {
  try {
    const res = await getExamById(row.id)
    const exam = res.data
    Object.assign(examForm, {
      id: exam.id, examName: exam.exam_name, courseId: exam.course_id, duration: exam.duration,
      totalScore: exam.total_score, passScore: exam.pass_score, description: exam.description,
      status: exam.status, questions: exam.questions || []
    })
    editDialogVisible.value = true
  } catch (e) { console.error(e) }
}

const addQuestion = () => {
  examForm.questions.push({ questionType: 1, questionContent: '', options: '', correctAnswer: '', score: 10 })
}

const removeQuestion = (idx) => { examForm.questions.splice(idx, 1) }

const saveExam = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    await saveExamApi(examForm)
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    loadData()
  } catch (e) { ElMessage.error(e.response?.data?.message || '保存失败') }
  finally { saving.value = false }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该考试吗？', '提示', { type: 'warning' })
    .then(async () => {
      await deleteExam(row.id)
      ElMessage.success('删除成功')
      loadData()
    }).catch(() => {})
}

const handleViewStats = async (row) => {
  try {
    const res = await getExamStatistics(row.id)
    examStats.value = res.data || {}
    statsDialogVisible.value = true
  } catch (e) { ElMessage.error(e.response?.data?.message || '获取统计失败') }
}

const handleViewScores = async (row) => {
  try {
    const res = await getExamScores(row.id)
    scoreList.value = res.data || []
    scoresDialogVisible.value = true
  } catch (e) { ElMessage.error(e.response?.data?.message || '获取成绩失败') }
}

const handleViewExam = async (row) => {
  try {
    const res = await getExamById(row.id)
    currentExam.value = res.data
    examStarted.value = false
    takeExamDialogVisible.value = true
  } catch (e) { console.error(e) }
}

const handleStartExam = async (row) => {
  try {
    const res = await getExamById(row.id)
    currentExam.value = res.data
    examStarted.value = false
    takeExamDialogVisible.value = true
  } catch (e) { console.error(e) }
}

const confirmStartExam = async () => {
  try {
    const res = await startExam(currentExam.value.id)
    examRecordId.value = res.data
    examStarted.value = true
    userAnswers.value = {}
    remainingTime.value = currentExam.value.duration * 60
    startTimer()
  } catch (e) { ElMessage.error(e.response?.data?.message || '开始考试失败') }
}

const startTimer = () => {
  timer = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      clearInterval(timer)
      submitExamAnswers()
    }
  }, 1000)
}

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const parseOptions = (optStr) => {
  if (!optStr) return []
  return optStr.split('|').map(o => {
    const [key, ...rest] = o.split('.')
    return { key: key.trim(), text: o }
  })
}

const submitExamAnswers = async () => {
  if (timer) clearInterval(timer)
  submitting.value = true
  try {
    const answers = {}
    Object.keys(userAnswers.value).forEach(k => {
      const v = userAnswers.value[k]
      answers[k] = Array.isArray(v) ? v.join(',') : v
    })
    const res = await submitExam(examRecordId.value, { answers })
    examResult.value = res.data
    takeExamDialogVisible.value = false
    resultDialogVisible.value = true
  } catch (e) { ElMessage.error('提交失败') }
  finally { submitting.value = false }
}

onMounted(() => { loadData(); loadCourses() })
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style lang="scss" scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.question-item { background: #f5f7fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;
  .question-header { display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 600; }
}
.score-distribution { margin-top: 20px;
  h4 { margin-bottom: 12px; }
  .dist-item { padding: 12px; text-align: center; border-radius: 8px; color: #fff;
    &.excellent { background: #67C23A; }
    &.good { background: #409EFF; }
    &.pass { background: #E6A23C; }
    &.fail { background: #F56C6C; }
  }
}
.text-success { color: #67C23A; font-weight: 600; }
.text-danger { color: #F56C6C; font-weight: 600; }
.exam-timer { text-align: center; font-size: 24px; font-weight: 600; color: #F56C6C; margin-bottom: 20px; }
.question-block { background: #f5f7fa; padding: 16px; border-radius: 8px; margin-bottom: 16px;
  .question-title { font-weight: 600; margin-bottom: 12px; }
  .question-options { padding-left: 20px; }
}
.exam-result { text-align: center;
  .result-score { font-size: 72px; font-weight: 700; &.pass { color: #67C23A; } &.fail { color: #F56C6C; } }
  .result-status { margin: 16px 0; }
}
</style>
