import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { title: '首页' }
      },
      // 系统管理
      {
        path: 'user',
        name: 'User',
        component: () => import('../views/system/User.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'org',
        name: 'Org',
        component: () => import('../views/system/Org.vue'),
        meta: { title: '组织管理' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('../views/system/Role.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('../views/system/Menu.vue'),
        meta: { title: '菜单管理' }
      },
      // 招聘管理
      {
        path: 'job',
        name: 'Job',
        component: () => import('../views/recruitment/Job.vue'),
        meta: { title: '职位管理' }
      },
      {
        path: 'resume',
        name: 'Resume',
        component: () => import('../views/recruitment/Resume.vue'),
        meta: { title: '简历管理' }
      },
      {
        path: 'application-record',
        name: 'ApplicationRecord',
        component: () => import('../views/recruitment/ApplicationRecord.vue'),
        meta: { title: '投递记录' }
      },
      {
        path: 'job-recommend',
        name: 'JobRecommend',
        component: () => import('../views/recruitment/JobRecommend.vue'),
        meta: { title: '岗位推荐' }
      },
      // 学习中心
      {
        path: 'course',
        name: 'Course',
        component: () => import('../views/learning/Course.vue'),
        meta: { title: '课程管理' }
      },
      {
        path: 'exam',
        name: 'Exam',
        component: () => import('../views/learning/Exam.vue'),
        meta: { title: '考试管理' }
      },
      {
        path: 'exam/create',
        name: 'ExamCreate',
        component: () => import('../views/learning/ExamCreate.vue'),
        meta: { title: '创建考试' }
      },
      {
        path: 'course/create',
        name: 'CourseCreate',
        component: () => import('../views/learning/CourseCreate.vue'),
        meta: { title: '创建课程' }
      },
      {
        path: 'learning-record',
        name: 'LearningRecord',
        component: () => import('../views/learning/LearningRecord.vue'),
        meta: { title: '学习记录' }
      },
      // 业务申报
      {
        path: 'my-application',
        name: 'MyApplication',
        component: () => import('../views/application/MyApplication.vue'),
        meta: { title: '我的申报' }
      },
      {
        path: 'audit',
        name: 'Audit',
        component: () => import('../views/application/Audit.vue'),
        meta: { title: '申报审核' }
      },
      // 内容管理
      {
        path: 'article',
        name: 'Article',
        component: () => import('../views/cms/Article.vue'),
        meta: { title: '文章管理' }
      },
      {
        path: 'channel',
        name: 'Channel',
        component: () => import('../views/cms/Channel.vue'),
        meta: { title: '栏目管理' }
      },
      // 消息中心
      {
        path: 'message',
        name: 'Message',
        component: () => import('../views/message/Index.vue'),
        meta: { title: '私信消息' }
      },
      {
        path: 'notification',
        name: 'Notification',
        component: () => import('../views/notification/Index.vue'),
        meta: { title: '消息通知' }
      },
      // 统计报表
      {
        path: 'report',
        name: 'Report',
        component: () => import('../views/report/Index.vue'),
        meta: { title: '统计报表' }
      },
      // 个人中心
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/profile/Index.vue'),
        meta: { title: '个人中心' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 校企慧` : '校企慧公共服务平台'
  
  const userStore = useUserStore()
  const whiteList = ['/login', '/register']
  if (!whiteList.includes(to.path) && !userStore.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
