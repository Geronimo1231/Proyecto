import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import { ToastPlugin } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Opcional: Puedes pasar opciones al ToastPlugin
app.use(ToastPlugin, {
  autoClose: 3000,        // Toasts se cierran en 3 segundos
  position: 'top-right',  // Ubicación del toast
})

app.mount('#app')
