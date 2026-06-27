import 'amfe-flexible'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Lazyload } from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'
import router from './router'
import './styles/global.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Lazyload)

app.mount('#app')
