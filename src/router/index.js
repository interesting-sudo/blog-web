import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import Home from '../views/Home.vue'
import MyHome from '../views/MyHome.vue'
import Settings from '../views/Settings.vue'
import ChangePassword from '../views/ChangePassword.vue'
import Publish from '../views/Publish.vue'
import EditBlog from '../views/EditBlog.vue'
import BlogDetail from '../views/BlogDetail.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import UserManage from '../views/admin/UserManage.vue'
import ArticleManage from '../views/admin/ArticleManage.vue'
import CategoryManage from '../views/admin/CategoryManage.vue'
import TagManage from '../views/admin/TagManage.vue'
import CommentManage from '../views/admin/CommentManage.vue'
import NotFound from '../views/404.vue'
import ServerError from '../views/500.vue'
import { useUserStore } from '@/store/user'
import NProgress from 'nprogress'

const routes = [
  {
    path: '/',
    // 演示模式已注入账号，直接落到首页，避免与登录页守卫互相重定向
    redirect: import.meta.env.VITE_DEMO_MODE === 'true' ? '/home' : '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: '注册' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { title: '找回密码' }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { title: 'iblog' }
  },
  {
    path: '/my-home',
    name: 'MyHome',
    component: MyHome,
    meta: { title: '我的主页' }
  },
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/users',
    meta: { title: '管理后台', requiresAdmin: true },
    children: [
      {
        path: 'users',
        name: 'UserManage',
        component: UserManage,
        meta: { title: '用户管理' }
      },
      {
        path: 'articles',
        name: 'ArticleManage',
        component: ArticleManage,
        meta: { title: '文章管理' }
      },
      {
        path: 'categories',
        name: 'CategoryManage',
        component: CategoryManage,
        meta: { title: '分类管理' }
      },
      {
        path: 'tags',
        name: 'TagManage',
        component: TagManage,
        meta: { title: '标签管理' }
      },
      {
        path: 'comments',
        name: 'CommentManage',
        component: CommentManage,
        meta: { title: '评论管理' }
      }
    ]
  },
{
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { title: '个人设置' }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: { title: '修改密码' }
  },
  {
    path: '/article/:id',
    name: 'BlogDetail',
    component: BlogDetail,
    meta: { title: '文章详情' }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: Publish,
    meta: { title: '创作' }
  },
  {
    path: '/edit/:id',
    name: 'EditArticle',
    component: EditBlog,
    meta: { title: '编辑文章' }
  },
  {
    path: '/500',
    name: 'ServerError',
    component: ServerError,
    meta: { title: '500' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '404' }
  }
]

const router = createRouter({
  // 跟随 Vite 的 base，部署到子路径（如 GitHub Pages 的 /blog-web/）时才能正确匹配路由
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 管理员权限校验
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (userStore.isAdmin) {
      next()
    } else {
      next({ path: '/home' })
      NProgress.done()
    }
  } else {
    next()
  }
})

export default router
