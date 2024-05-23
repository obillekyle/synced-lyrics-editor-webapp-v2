import { $, evaluate, openFilePicker } from '@/api/util';

import _presets from '../modals/_presets';

type ActiveKeys = {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
}

export type KeyEvents = Record<string, (...args: any[]) => any>;

export type BindItems = {
  key: KeyBind;
  label: ((keys: ActiveKeys) => string) | string;
  cond?: ((keys: ActiveKeys) => any) | boolean;
};

export type KeyBind = {
  label?: string,
  /** ```ts
   * (property) special: [ ctrl  ,  alt   , shift  ,  meta  ]
   * ```
   *  */
  special?: [boolean, boolean, boolean, boolean],
  key: string,
  block?: boolean,
}

export type Binds<T> = {
  readonly none: T;
  readonly alt: T;
  readonly ctrl: T;
  readonly shift: T;
};

export type KeyBinds<T> = {
  player: {
    playPause: T,
    seekForward: T,
    seekBackward: T,
  }

  timing: {
    adjustTimeForward: T,
    adjustTimeBackward: T,
    arrowUpFocus: T,
    arrowDownFocus: T,

    addNewLine: T,
    addNewLineReverse: T,

    deleteLine: T,

    setLineTiming: T,
    toggleEditMode: T,
    unfocusLine: T,
  }

  uploadLRC: T,
  downloadLRC: T,
  uploadAudio: T,
  showKeybinds: T,
}


export function KeyboardGuides(): KeyBinds<BindItems> {
  const Player = window.app.player;
  const Screen = window.app.screen;
  const Lyrics = window.app.lyric;
  const Keybinds = window.app.options.get('keybinds', defaultKeys);

  return {
    player: {
      playPause: {
        key: Keybinds.player.playPause,
        label: () => (Player.paused ? 'Play' : 'Pause'),
        cond: () => isFinite(Player.duration),
      },
      seekBackward: {
        key: Keybinds.player.seekBackward,
        label: () => (Screen.current === 'timing' ? 'Seek -1s' : 'Seek -5s'),
        cond: () => isFinite(Player.duration),
      },
      seekForward: {
        key: Keybinds.player.seekForward,
        label: () => (Screen.current === 'timing' ? 'Seek +1s' : 'Seek +5s'),
        cond: () => isFinite(Player.duration),
      }
    },
    timing: {
      adjustTimeForward: {
        key: Keybinds.timing.adjustTimeForward,
        label: 'Adjust line time by +100ms',
        cond: () =>
          Screen.current === 'timing'
          && Player.paused
          && Lyrics.lines.length > 0
          && $('.lrc-line.active:not(.edit)')

      },
      adjustTimeBackward: {
        key: Keybinds.timing.adjustTimeBackward,
        label: 'Adjust line time by -100ms',
        cond: () =>
          Screen.current === 'timing'
          && Player.paused
          && Lyrics.lines.length > 0
          && $('.lrc-line.active:not(.edit)')
      },
      arrowUpFocus: {
        key: Keybinds.timing.arrowUpFocus,
        label: () =>
          $('.lrc-line.active')
            ? `Focus to the previous line`
            : 'Focus to the last line',
        cond: () => {
          if (Screen.current === 'timing') {
            const elem = $('.lrc-line.active:not(.edit)');
            const index = Number(elem?.dataset.index || '0');
            const count = Lyrics.lines.length;

            if (!elem && count > 0) return true;

            return count > 0 && index - 1 >= 0 && elem
          }
        }
      },
      arrowDownFocus: {
        key: Keybinds.timing.arrowDownFocus,
        label: () =>
          $('.lrc-line.active')
            ? `Focus to the next line`
            : 'Focus to the first line',
        cond: () => {
          if (Screen.current === 'timing') {
            const elem = $('.lrc-line.active:not(.edit)');
            const index = Number(elem?.dataset.index || '0');
            const count = Lyrics.lines.length;

            if (!elem && count > 0) return true;

            return count > 0 && index + 1 < count && elem
          };
        }
      },
      toggleEditMode: {
        key: Keybinds.timing.toggleEditMode,
        label: 'Edit current line',
        cond: () =>
          Screen.current === 'timing'
          && Lyrics.lines.length > 0
          && $('.lrc-line.active:not(.edit)')
      },
      addNewLine: {
        key: Keybinds.timing.addNewLine,
        label: () => {
          if (Lyrics.lines.length === 0) return 'Add new line';

          return $('.lrc-line.active') ?
            'Add new line after focused' :
            'Add new line at the end'
        },
        cond: () =>
          Screen.current === 'timing'
          && !$('.lrc-line.edit')
      },
      addNewLineReverse: {
        key: Keybinds.timing.addNewLineReverse,
        label: 'Add new line before focused',
        cond: () =>
          Screen.current === 'timing'
          && Lyrics.lines.length > 0
          && $('.lrc-line.active:not(.edit)')
      },
      deleteLine: {
        key: Keybinds.timing.deleteLine,
        label: () =>
          $('.lrc-line.active') ?
            'Delete focused line' :
            'Delete last line',
        cond: () =>
          Screen.current === 'timing'
          && Lyrics.lines.length > 0
          && !$('.lrc-line.edit')
      },
      setLineTiming: {
        key: Keybinds.timing.setLineTiming,
        label: 'Set line time',
        cond: () =>
          Screen.current === 'timing'
          && Lyrics.lines.length > 0
          && $('.lrc-line.active:not(.edit)')
      },
      unfocusLine: {
        key: Keybinds.timing.unfocusLine,
        label: 'Unfocus current line',
        cond: () =>
          Screen.current === 'timing'
          && Lyrics.lines.length > 0
          && $('.lrc-line.active:not(.edit)')
      }
    },
    downloadLRC: {
      key: Keybinds.downloadLRC,
      label: 'Download LRC',
      cond: () =>
        Screen.current !== 'edit'
        && Lyrics.lines.length > 0
        && !$('.lrc-line.edit')
    },
    uploadAudio: {
      key: Keybinds.uploadAudio,
      label: 'Upload audio',
      cond: () =>
        Screen.current !== 'edit'
        && !$('.lrc-line.edit')
    },
    uploadLRC: {
      key: Keybinds.uploadLRC,
      label: 'Upload LRC',
      cond: () =>
        Screen.current !== 'edit'
        && !$('.lrc-line.edit')
    },
    showKeybinds: {
      key: Keybinds.showKeybinds,
      label: 'Show keybinds',
      cond: () =>
        Screen.current !== 'edit'
        && !$('.lrc-line.edit')
    }
  }
}

export const keyEquivalent: Record<string, string | undefined> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Space: "⎵",
  " ": "⎵",
}

export const defaultKeys: KeyBinds<KeyBind> = {
  player: {
    playPause: {
      label: "Play/Pause",
      special: [false, false, false, false],
      key: " ",
    },
    seekForward: {
      label: "Seek Forward",
      special: [false, false, false, false],
      key: "ArrowRight",
    },
    seekBackward: {
      label: "Seek Backward",
      special: [false, false, false, false],
      key: "ArrowLeft",
    }
  },
  timing: {
    adjustTimeForward: {
      label: "Adjust Time Forward",
      special: [false, false, false, false],
      key: "ArrowRight",
      block: true,
    },
    adjustTimeBackward: {
      label: "Adjust Time Backward",
      special: [false, false, false, false],
      key: "ArrowLeft",
      block: true,
    },
    arrowUpFocus: {
      label: "Arrow Up Focus",
      special: [false, false, false, false],
      block: true,
      key: "ArrowUp",
    },
    arrowDownFocus: {
      label: "Arrow Down Focus",
      special: [false, false, false, false],
      block: true,
      key: "ArrowDown",
    },
    deleteLine: {
      label: "Delete Line",
      special: [false, false, false, false],
      key: "Delete",
    },

    addNewLine: {
      label: "Add New Line",
      special: [false, false, false, false],
      key: "Insert",
    },
    addNewLineReverse: {
      label: "Add New Line Reverse",
      special: [false, false, true, false],
      key: "Insert",
    },
    toggleEditMode: {
      label: "Toggle Edit Mode",
      special: [false, false, false, false],
      key: "E",
    },
    setLineTiming: {
      label: "Set Line Timing",
      special: [false, false, false, false],
      key: "Enter",
    },
    unfocusLine: {
      label: "Unfocus Line",
      special: [false, false, false, false],
      key: "Escape",
    }
  },

  uploadLRC: {
    label: "Upload LRC",
    special: [true, false, false, false],
    key: "L",
  },
  downloadLRC: {
    label: "Download LRC",
    special: [true, false, false, false],
    key: "S",
  },
  uploadAudio: {
    label: "Upload Audio",
    special: [true, false, false, false],
    key: "M",
  },
  showKeybinds: {
    label: "Show Keybinds",
    special: [true, false, false, false],
    key: "/",
  }
}

export const keyHandlers = {
  player: {
    playPause: () => {
      const Player = window.app.player;
      Player.playPause();
    },
    seekForward: () => {
      const Player = window.app.player;
      Player.fastSeek(5);
    },
    seekBackward: () => {
      const Player = window.app.player;
      Player.fastSeek(-5);
    },

  },

  timing: {
    deleteLine: () => {
      const Lyrics = window.app.lyric;
      const count = Lyrics.lines.length;
      count > 0 && Lyrics.removeLine(count - 1);
    },
    addNewLine: () => {
      const Lyrics = window.app.lyric;
      Lyrics.addLine(Lyrics.EMPTYLINE);
    }
  },

  uploadLRC: _presets.uploadNewLrc,
  downloadLRC: _presets.download,
  showKeybinds: _presets.showKeyBinds,


  uploadAudio: () => {
    openFilePicker(async (file) => {
      if (!file) return;

      const Player = window.app.player;
      const Modals = window.app.modals;
      const success = await Player.updateFile(file)

      if (success) {
        const lrc = Player.metadata?.common.lyrics;
        if (lrc?.length) _presets.useAudioLRC();
        return
      }

      Modals.open({
        icon: 'material-symbols:error-outline',
        id: 'not-audio-file',
        title: 'Not an audio file',
        content: 'Please select an audio file',
        actions: [
          {
            text: 'OK',
            onClick: ({ close }) => close(),
          }
        ]
      })


    }, { accept: 'audio/*' });
  }
}


export function processKey(keybind: KeyBind | string, event: KeyboardEvent, handler?: (event: KeyboardEvent) => any) {
  if (typeof keybind == 'string') keybind = { key: keybind };
  keybind.special ??= [false, false, false, false];

  if (
    keybind.key.toLowerCase() == event.key.toLowerCase() &&
    keybind.special[0] == event.ctrlKey &&
    keybind.special[1] == event.altKey &&
    keybind.special[2] == event.shiftKey &&
    keybind.special[3] == event.metaKey
  ) {
    if (keybind.block) event.preventDefault();
    (evaluate(handler!, event) as any)?.then?.();
  }
}

export function getKeybinds() {
  return window.app.options.get('keybinds', defaultKeys)
}

// temp fix for syntax highlighting vue
export function as<T extends any>(obj: any): T {
  return obj
}
