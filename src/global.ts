import { Buffer } from 'buffer';
import Clipboard from './api/clipboard';
import Colors from '@/api/colors';
import { I18N } from './api/i18n';
import LRCParser from '@/api/parser';
import ModalService from '@/api/modals';
import MusicService from '@/api/service';
import Screen from '@/api/screen';
import options from '@/app/options';
import presets from '@/components/modals/_presets';
import process from 'process';
import type { Screens } from './app/main';
import FileManager from './api/util/files';

const appVer = Number(import.meta.env.VITE_VERSION_CODE ?? 0);
const appVerString = import.meta.env.VITE_VERSION ?? 'unknown';
const screen = new Screen(options.get('screen', 'timing'));
const lang = options.get('lang', 'en');

declare global {
  interface Window {
    app: {
      colors: Colors;
      version: number;
      version_string: string;
      player: MusicService;
      lyric: LRCParser;
      i18n: I18N<string>;
      clipboard: Clipboard;
      screen: Screen<Screens>;
      modals: ModalService;
      files: FileManager;
      options: typeof options;
      presets: typeof presets;
    };
    Buffer: typeof Buffer;
    process: typeof process;
  }
}

window.app = {
  version: appVer,
  version_string: appVerString,

  colors: new Colors(),
  player: new MusicService(),
  modals: new ModalService(),
  lyric: new LRCParser(),
  clipboard: new Clipboard(),
  i18n: new I18N(lang),
  files: new FileManager(),

  presets,
  screen,
  options,
};

window.addEventListener('beforeunload', (e) => {
  const Lyrics = window.app.lyric;
  options.save();

  if (!Lyrics.lines.length) return;

  e.preventDefault();
  e.returnValue = 'Are you sure you will not save your changes?';
});

window.Buffer = Buffer;
window.process = process;
