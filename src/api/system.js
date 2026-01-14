import request from '../utils/request'

// 用户管理API
export function getUserPage(params) {
  return request.get('/system/user/page', { params })
}

export function getUserById(id) {
  return request.get(`/system/user/${id}`)
}

export function updateUserStatus(id, status) {
  return request.put(`/system/user/${id}/status`, null, { params: { status } })
}

export function resetUserPassword(id, newPassword = '123456') {
  return request.put(`/system/user/${id}/reset-password`, null, { params: { newPassword } })
}

// 组织管理API
export function getOrgTree() {
  return request.get('/system/org/tree')
}

export function getOrgList() {
  return request.get('/system/org/list')
}

// 角色管理API
export function getRoleList() {
  return request.get('/system/role/list')
}

// 菜单管理API
export function getMenuTree() {
  return request.get('/system/menu/tree')
}

// ============ 申报审核API ============
export function getApplicationList(params) {
  return request.get('/application/list', { params })
}

export function getMyApplications() {
  return request.get('/application/my')
}

export function submitApplication(data) {
  return request.post('/application/submit', data)
}

export function auditApplication(id, data) {
  return request.post(`/application/audit/${id}`, data)
}

export function getAuditRecords(applicationId) {
  return request.get(`/application/audit-records/${applicationId}`)
}

// ============ 消息API ============
export function getConversations() {
  return request.get('/message/conversations')
}

export function getMessages(conversationId) {
  return request.get(`/message/list/${conversationId}`)
}

export function sendMessage(data) {
  return request.post('/message/send', data)
}

export function getMessageUsers() {
  return request.get('/message/users')
}

export function getUnreadCount() {
  return request.get('/message/unread-count')
}

// ============ 简历API ============
export function getMyResume() {
  return request.get('/resume/my')
}

export function getResumeList(params) {
  return request.get('/resume/list', { params })
}

export function getResumeById(id) {
  return request.get(`/resume/${id}`)
}

export function saveResume(data) {
  return request.post('/resume/save', data)
}

export function deleteResume(id) {
  return request.delete(`/resume/${id}`)
}

// ============ 职位API ============
export function getJobList(params) {
  return request.get('/job/list', { params })
}

export function getMyJobs() {
  return request.get('/job/my')
}

export function getJobById(id) {
  return request.get(`/job/${id}`)
}

export function saveJob(data) {
  return request.post('/job/save', data)
}

export function deleteJob(id) {
  return request.delete(`/job/${id}`)
}

export function updateJobStatus(id, status) {
  return request.put(`/job/${id}/status`, null, { params: { status } })
}

// ============ 职位申请API ============
export function applyJob(data) {
  return request.post('/job-application/apply', data)
}

export function getMyJobApplications() {
  return request.get('/job-application/my')
}

export function getJobApplicationsByJob(jobId) {
  return request.get(`/job-application/job/${jobId}`)
}

export function getEnterpriseApplications() {
  return request.get('/job-application/enterprise')
}

export function processJobApplication(id, data) {
  return request.post(`/job-application/process/${id}`, data)
}

export function getJobApplicationById(id) {
  return request.get(`/job-application/${id}`)
}

// ============ 文件API ============
export function uploadFile(file, type = 'file') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  return request.post('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function uploadVideo(file) {
  return uploadFile(file, 'video')
}

export function uploadCourseware(file) {
  return uploadFile(file, 'courseware')
}

export function uploadImage(file) {
  return uploadFile(file, 'image')
}

export function getFileDownloadUrl(path) {
  return `/api/file/download/${path}`
}

// ============ 课程API ============
export function getCourseList(params) {
  return request.get('/course/list', { params })
}

export function getCourseById(id) {
  return request.get(`/course/${id}`)
}

export function saveCourse(data) {
  return request.post('/course/save', data)
}

export function deleteCourse(id) {
  return request.delete(`/course/${id}`)
}

export function recordCourseLearning(courseId) {
  return request.post(`/course/learn/${courseId}`)
}

export function updateCourseProgress(courseId, data) {
  return request.post(`/course/progress/${courseId}`, data)
}

export function getMyLearning() {
  return request.get('/course/my-learning')
}

export function getCourseStatistics() {
  return request.get('/course/statistics')
}

// ============ 考试API ============
export function getExamList(params) {
  return request.get('/exam/list', { params })
}

export function getExamById(id) {
  return request.get(`/exam/${id}`)
}

export function saveExam(data) {
  return request.post('/exam/save', data)
}

export function deleteExam(id) {
  return request.delete(`/exam/${id}`)
}

export function startExam(examId) {
  return request.post(`/exam/start/${examId}`)
}

export function submitExam(recordId, data) {
  return request.post(`/exam/submit/${recordId}`, data)
}

export function getMyExamRecords() {
  return request.get('/exam/my-records')
}

export function getExamStatistics(examId) {
  return request.get(`/exam/statistics/${examId}`)
}

export function getExamScores(examId) {
  return request.get(`/exam/scores/${examId}`)
}


// ============ 首页数据API ============
export function getHomeStats() {
  return request.get('/home/stats')
}

export function getLatestJobs() {
  return request.get('/home/latest-jobs')
}

export function getHotCourses() {
  return request.get('/home/hot-courses')
}

export function getAnnouncements() {
  return request.get('/home/announcements')
}

// ============ 通知API ============
export function getMyNotifications() {
  return request.get('/notification/my')
}

export function getNotificationUnreadCount() {
  return request.get('/notification/unread-count')
}

export function markNotificationRead(id) {
  return request.post(`/notification/read/${id}`)
}

export function markAllNotificationsRead() {
  return request.post('/notification/read-all')
}

export function publishNotification(data) {
  return request.post('/notification/publish', data)
}

// ============ 岗位推荐API(辅导员) ============
export function getStudentList() {
  return request.get('/job-recommend/students')
}

export function recommendJob(data) {
  return request.post('/job-recommend/recommend', data)
}

export function batchRecommendJob(data) {
  return request.post('/job-recommend/batch-recommend', data)
}

export function getMyRecommendations() {
  return request.get('/job-recommend/my-recommendations')
}

// ============ 用户API ============
export function getProfile() {
  return request.get('/system/user/profile')
}

export function updateProfile(data) {
  return request.put('/system/user/profile', data)
}

export function changePassword(data) {
  return request.post('/system/user/change-password', data)
}

export function getMyStats() {
  return request.get('/system/user/my-stats')
}
