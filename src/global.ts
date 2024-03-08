import { Buffer } from "buffer";
import Colors from "./api/colors";
import LRCParser from "./api/parser";
import ModalService from "./api/modals";
import MusicService from "./api/service";
import Options from "./api/options";
import Screen from "./api/screen";
import modalPresets from "./components/_modals";
import process from 'process';

type AppOptions = {
  bypassLrcWarn?: boolean,
  showChangeLog: boolean
  lastVersion: string
  screen: "edit" | "timing" | "lyric"
}

const opts = new Options<AppOptions>({
  autoSave: true,
  defaultOptions: {
    lastVersion: "",
    showChangeLog: true,
    screen: "timing"
  }
});

const screen = new Screen(opts.get("screen") || "timing");

declare global {
  interface Window {
    app: {
      version: string,
      player: MusicService
      lyric: LRCParser
      screen: Screen<"edit" | "timing" | "lyric">
      modals: ModalService
      options: typeof opts
      custom: { [key: string]: any }
      colors: Colors
    }
    Buffer: typeof Buffer
    process: typeof process
  }
}

window.app = {
  version: "v2.0.1a",
  player: new MusicService(),
  modals: new ModalService(),
  lyric: new LRCParser(),
  colors: new Colors(),

  custom: modalPresets.custom || {},
  screen: screen,
  options: opts,
}

window.addEventListener('beforeunload', (e) => {
  const Lyrics = window.app.lyric
  opts.save()

  if (!Lyrics.lines.length) return;

  e.preventDefault();
  e.returnValue = 'Are you sure you will not save your changes?'
})

window.Buffer = Buffer;
window.process = process;