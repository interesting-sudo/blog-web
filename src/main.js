import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { MotionPlugin } from '@vueuse/motion'
import './style.css'
import 'element-plus/dist/index.css'
import 'highlight.js/styles/github.css'
import App from './App.vue'
import router from './router'
import './permission'
import { initDemo } from './demo'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(MotionPlugin)

// 演示模式必须先接管网络层并注入账号，再装载路由：
// vue-router 安装时会立刻发起首次导航，守卫读不到演示账号就会被踢回登录页。
initDemo().finally(() => {
  app.use(router)
  app.mount('#app')
})
