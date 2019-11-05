import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faGlobe, faCrosshairs, faCalendarDay, faClock, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome'

import './main.scss'

Vue.config.productionTip = false

Vue.use(BootstrapVue)

library.add(
  faGlobe,
  faCrosshairs,
  faCalendarDay,
  faClock,
  faEdit,
  faTrashAlt
)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('font-awesome-layers', FontAwesomeLayers)
Vue.component('font-awesome-layers-text', FontAwesomeLayersText)

new Vue({
  render: h => h(App)
}).$mount('#app')
