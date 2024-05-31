import './global';
import './assets/main.scss';
import './assets/markdown.scss';
import './assets/formatter.scss';

import App from './App.vue';
import { createApp } from 'vue';
import modalPresets from './components/modals/_presets';
import { AppScreens } from './app/main';

createApp(App).mount('#app');

const Options = window.app.options;
const Lang = window.app.i18n;

function init() {
  if (Options.get('version') !== window.app.version) {
    Options.set('version', window.app.version);
    console.log('initial');
  } else if (Options.get('showChangeLog')) {
    modalPresets.changelog();
  }

  const urlParams = new URLSearchParams(window.location.search);
  const lyrics = urlParams.get('l');
  const screen = urlParams.get('s');

  if (lyrics) {
    modalPresets.useQueryLRC(lyrics);
  }

  if (screen) {
    const screenValue = AppScreens[Number(screen)];
    screenValue && window.app.screen.set(screenValue);
  }

  if (location.pathname.startsWith('/lyric-card')) {
    console.log('lyric-card');
  } else {
    window.history.replaceState({}, document.title, '/');
  }

  Lang.removeEventListener('ready', init);
}

Lang.addEventListener('ready', init);
