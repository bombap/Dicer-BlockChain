import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import mixinsMain from '@/mixins'
import Loader from '@/components/Loader'
import router from './router'
import store from './store'
import VueMeta from 'vue-meta'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import VueMobileDetection from 'vue-mobile-detection'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@/assets/style.css'

Vue.use(VueMeta)
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use(VueMobileDetection)
Vue.component('Loader', Loader)
Vue.config.productionTip = false

new Vue({
  mixins: [mixinsMain],
  router,
  store,
  render: h => h(App)
}).$mount('#app')
