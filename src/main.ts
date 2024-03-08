import './global'
import './assets/main.scss'
import './assets/markdown.scss'

import App from './App.vue'
import { createApp } from 'vue'
import modalPresets from './components/_modals';

createApp(App).mount('#app');

const Options = window.app.options;
if (Options.get("showChangeLog")) {
  modalPresets.changelog();
}

if (Options.get("lastVersion") !== window.app.version) {
  Options.set("lastVersion", window.app.version);
  Options.get("showChangeLog") || modalPresets.changelog();
}

