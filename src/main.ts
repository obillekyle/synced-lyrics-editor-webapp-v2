import './global'
import './assets/main.scss'
import './assets/markdown.scss'
import './assets/formatter.scss'

import App from './App.vue'
import { createApp } from 'vue'
import modalPresets from './components/modals/_presets';

createApp(App).mount('#app');

const Options = window.app.options;
if (Options.get("showChangeLog")) {
  modalPresets.changelog();
}

if (Options.get("version") !== window.app.version) {
  Options.set("version", window.app.version);
  modalPresets.changelog();
}

