import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import Stats from '@/views/Stats'
import NotFound from '@/views/NotFound'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Dicer',
    component: Home
  },
  {
    path: '/stats',
    name: 'Statistics',
    component: Stats
  },
  {
      path: "*",
      name: '404',
      component: NotFound
  }
]

const router = new VueRouter({
  routes
})

export default router
