import { $, openFilePicker } from "@/api/util";

import Settings from "./settings.vue";
import changelogScreen from "./changelogScreen.vue";
import downloadScreen from './download.vue';
import keyBindsGuide from "../keybinds/guide.vue";
import loadLyrics from "./loadLyrics.vue";

function download() {
  const player = window.app.player;
  const modals = window.app.modals;
  const lyrics = window.app.lyric;

  modals.open({
    icon: 'material-symbols:download',
    id: 'download',
    title: 'Download',
    content: downloadScreen,
    actions: [
      {
        text: 'Cancel',
        onClick: ({ close }) => close(),
      },
      {
        text: 'Download',
        onClick: ({ close }) => {
          const data = player.getDetails();
          data.artist = data.artist ? data.artist + ' - ' : '';

          const defName = `${data.artist}${data.title}.lrc`;
          const name = $<HTMLInputElement>('#fileName')?.value;

          const lrc = lyrics.stringify();
          const blob = new Blob([lrc], { type: 'text/plain' })

          const linkElem = document.createElement('a');
          linkElem.href = URL.createObjectURL(blob);
          linkElem.download = name || defName;
          linkElem.click();

          setTimeout(() => URL.revokeObjectURL(linkElem.href), 6000);

          close();
        },
      },
    ],
  });
}

function changelog() {
  const modals = window.app.modals;
  const options = window.app.options;

  modals.open({
    icon: 'material-symbols:book-2-outline',
    id: 'changelog',
    title: 'Changelog',
    content: changelogScreen,
    actions: [
      {
        text: 'Do not show again',
        role: 'secondary',
        onClick: ({ close }) => {
          options.set("showChangeLog", false);
          close();
        },
      },
      {
        text: 'OK',
        onClick: ({ close }) => close(),
      }
    ]
  })
}


function useAudioLRC() {
  const player = window.app.player;
  const lyrics = window.app.lyric;
  const modals = window.app.modals;

  let lyric = player.metadata?.common.lyrics?.join("\n") || "";

  modals.open({
    icon: 'material-symbols:queue-music',
    id: "useAudioLRC",
    title: "Lyrics found",
    content: loadLyrics,
    actions: [
      {
        text: "No",
        onClick: ({ close }) => {
          close();
        },
      },
      {
        text: "Yes",
        onClick: ({ close }) => {
          lyrics.parse(lyric);
          close();
        },
      },
    ],
  })
}

function openLRCPicker() {
  const lyric = window.app.lyric;

  openFilePicker((file) => {
    if (!file) return;

    file.text().then((txt) => {
      lyric.parse(txt);
    })
  }, {
    accept: ".lrc",
  })
}

function uploadNewLrc() {
  const modals = window.app.modals;
  const options = window.app.options;
  const lyrics = window.app.lyric;

  const bypass = options.get("bypassLrcWarn", false);

  if (bypass || lyrics.lines.length === 0) {
    openLRCPicker();
    return;
  }

  modals.open({
    icon: "material-symbols:lyrics-outline",
    id: "uploadNewLrcOldNotEmpty",
    title: "Upload LRC file?",
    content: "Old lyrics will be overwritten",
    actions: [
      {
        text: "Continue, do not show again",
        role: "secondary",
        onClick: ({ close }) => {
          options.set("bypassLrcWarn", true);
          openLRCPicker();
          close();
        }
      },
      {
        text: "Cancel",
        onClick: ({ close }) => {
          close();
        }
      },
      {
        text: "OK",
        onClick: ({ close }) => {
          openLRCPicker();
          close();
        }
      }
    ]
  })
}

function showKeyBinds() {
  const modals = window.app.modals;

  modals.open({
    icon: "material-symbols:keyboard-outline",
    id: "keyBinds",
    title: "Key Binds",
    content: keyBindsGuide,
    actions: [
      {
        text: "OK",
        onClick: ({ close }) => close(),
      }
    ],
  })
}

function openSettings() {
  window.app.modals.open({
    id: "settings",
    content: Settings,
    options: {
      width: 768,
      height: 600,
      noWrapperSpacing: true,
      mobileFullscreen: true,
    }
  })
}

export default {
  changelog,
  download,
  useAudioLRC,
  openLRCPicker,
  openSettings,
  uploadNewLrc,
  showKeyBinds,
}