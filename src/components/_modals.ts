import { $, openFilePicker } from "@/api/util";

import { parse } from 'marked';

let custom = {
  download: {
    changeMode(val: number) {
      let input = $<HTMLInputElement>(".wrapper #fileName")!;
      let elem = $(".button-group.mode")!;
      elem.dataset.mode = String(val);

      if (val == 0) {
        let group = $(".button-group.preset")!;
        let preset = JSON.parse(group.dataset.value || '[]');
        input.value = this.getPreset(preset);
        input.disabled = true;
      }

      if (val == 1) {
        input.disabled = false;
      }
    },
    preset(val: number) {
      const player = window.app.player;

      let modeE = $(".button-group.mode")!;
      let group = $(".button-group.preset")!;
      let input = $<HTMLInputElement>(".wrapper #fileName")!;
      const details = player.getDetails();

      const mode = Number(modeE.dataset.mode || '0');
      const preset = JSON.parse(group.dataset.value || '[]');


      if (mode) {
        input.value += val == 0 ? details.artist || "" : "";
        input.value += val == 1 ? details.title || "" : "";
        input.value += val == 2 ? ".lrc" : "";
        return;
      };

      preset[val] = !preset[val];
      group.children[val].classList.toggle('active', preset[val]);
      group.dataset.value = JSON.stringify(preset);

      input.value = this.getPreset(preset);

    },
    getPreset(preset: number[]) {
      const player = window.app.player;
      const details = player.getDetails();

      let text = "";
      let [artist, title, ext] = preset;
      text += artist == 1 ? details.artist || "" : '';
      text += artist == 1 && title == 1 ? ' - ' : '';
      text += title == 1 ? details.title || "" : '';
      text += title == 1 && ext == 1 ? '.lrc' : '';

      return text;
    },
  }
};

function download() {
  const player = window.app.player;
  const modals = window.app.modals;
  const lyrics = window.app.lyric;

  modals.open({
    icon: 'material-symbols:download',
    id: 'download',
    title: 'Download',
    content: `    
  <div class="button-group mode" data-mode="0"> 
    <button 
      class="chip-button"
      onclick="window.app.custom.download.changeMode(0)"
    >
      Presets
    </button>
    <button 
      class="chip-button"
      onclick="window.app.custom.download.changeMode(1)"
    >
      Custom
    </button>
  </div>

  <div class="button-group preset" data-value="[1, 1, 1]"> 
    <button 
      class="chip-button active"  
      onclick="window.app.custom.download.preset(0)"
    >
      Artist
    </button>
    <button 
      class="chip-button active" 
      onclick="window.app.custom.download.preset(1)"
    >
      Title
    </button>
    <button 
      class="chip-button active" 
      onclick="window.app.custom.download.preset(2)"
    >
      .lrc
    </button>
  </div>

  <input 
    id="fileName" 
    type="text" 
    disabled 
    value="${custom.download.getPreset([1, 1, 1])}"
  />

    `,
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

          const linkElem = document.createElement('a');
          linkElem.href = URL.createObjectURL(
            new Blob([lrc], { type: 'text/plain' })
          );
          linkElem.download = name || defName;
          linkElem.click();

          close();
        },
      },
    ],
  });
}

function changelog() {
  const modals = window.app.modals;
  const options = window.app.options;

  fetch('/changelog.md')
    .then(res => res.text())
    .then(txt => {
      modals.open({
        icon: 'material-symbols:book-2-outline',
        id: 'changelog',
        title: 'Changelog',
        content: `
          <div class="changelog marked-content">${parse(txt)}</div>`,
        actions: [
          {
            text: 'Do not show again',
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
    })
}


export function useAudioLRC() {
  const player = window.app.player;
  const lyrics = window.app.lyric;
  const modals = window.app.modals;

  let lyric = player.metadata?.common.lyrics?.join("\n") || "";

  modals.open({
    icon: 'material-symbols:queue-music',
    id: "useAudioLRC",
    title: "Lyrics found",
    content: `
      <p>
        Do you want to use the lyrics embedded into the audio file?
      </p>

      <pre>${lyric}</pre>
      
      `,
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

export function uploadNewLrc() {
  const modals = window.app.modals;
  const options = window.app.options;

  const bypass = options.get("bypassLrcWarn", false);

  if (bypass) {
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

export default {
  changelog,
  custom,
  download,
  useAudioLRC,
  openLRCPicker,
  uploadNewLrc,
}