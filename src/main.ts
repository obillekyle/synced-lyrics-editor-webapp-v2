import './global'
import './assets/main.scss'
import './assets/markdown.scss'
import './assets/formatter.scss'

import { createApp } from 'vue'
import App from './App.vue'
import { AppScreens } from './app/main'
import modalPresets from './components/modals/presets'

createApp(App).mount('#app')
