import { $, evaluate, openFilePicker } from "@vue-material/core";

import _presets from "../modals/presets";
import { useScreen } from "@/hooks/use-screen";

type ActiveKeys = {
	ctrl: boolean;
	alt: boolean;
	shift: boolean;
};

export type KeyEvents = Record<string, (...args: unknown[]) => void>;

export type BindItems = {
	key: KeyBind;
	label: ((keys: ActiveKeys) => string) | string;
	cond?: ((keys: ActiveKeys) => unknown) | boolean;
};

export type KeyBind = {
	label?: string;
	/** ```ts
	 * (property) special?: [ ctrl  ,  alt   , shift  ,  meta  ] | undefined
	 * ```
	 */
	special?: [boolean, boolean, boolean, boolean];
	key: string;
	block?: boolean;
};

export type Binds<T> = {
	readonly none: T;
	readonly alt: T;
	readonly ctrl: T;
	readonly shift: T;
};

export type KeyBinds<T> = {
	player: {
		playPause: T;
		seekForward: T;
		seekBackward: T;
	};

	timing: {
		adjustTimeForward: T;
		adjustTimeBackward: T;
		arrowUpFocus: T;
		arrowDownFocus: T;

		addNewLine: T;
		addNewLineReverse: T;

		deleteLine: T;

		setLineTiming: T;
		toggleEditMode: T;
		unfocusLine: T;
	};

	uploadLRC: T;
	downloadLRC: T;
	uploadAudio: T;
	showKeybinds: T;

	tabHome: T;
	tabEdit: T;
	tabTiming: T;
	tabLyrics: T;

	settings: T;
};

export function KeyboardGuides(): KeyBinds<BindItems> {
	const Player = window.app.player;
	const Lyrics = window.app.lyric;
	const screen = useScreen();
	const Keybinds = getKeybinds();

	return {
		player: {
			playPause: {
				key: Keybinds.player.playPause,
				label: () => (Player.instance.paused ? "Play" : "Pause"),
				cond: () => Player.ready,
			},
			seekBackward: {
				key: Keybinds.player.seekBackward,
				label: () => (screen.value === "timing" ? "Seek -1s" : "Seek -5s"),
				cond: () => Player.ready,
			},
			seekForward: {
				key: Keybinds.player.seekForward,
				label: () => (screen.value === "timing" ? "Seek +1s" : "Seek +5s"),
				cond: () => Player.ready,
			},
		},
		timing: {
			adjustTimeForward: {
				key: Keybinds.timing.adjustTimeForward,
				label: "Adjust line time by +100ms",
				cond: () =>
					screen.value === "timing" &&
					Player.instance.paused &&
					Lyrics.lines.length > 0 &&
					$(".lrc-line.active:not(.edit)"),
			},
			adjustTimeBackward: {
				key: Keybinds.timing.adjustTimeBackward,
				label: "Adjust line time by -100ms",
				cond: () =>
					screen.value === "timing" &&
					Player.instance.paused &&
					Lyrics.lines.length > 0 &&
					$(".lrc-line.active:not(.edit)"),
			},
			arrowUpFocus: {
				key: Keybinds.timing.arrowUpFocus,
				label: () =>
					$(".lrc-line.active")
						? "Focus to the previous line"
						: "Focus to the last line",
				cond: () => {
					if (screen.value === "timing") {
						const elem = $(".lrc-line.active:not(.edit)");
						const index = Number(elem?.dataset.index || "0");
						const count = Lyrics.lines.length;

						if (!elem && count > 0) return true;

						return count > 0 && index - 1 >= 0 && elem;
					}
				},
			},
			arrowDownFocus: {
				key: Keybinds.timing.arrowDownFocus,
				label: () =>
					$(".lrc-line.active")
						? "Focus to the next line"
						: "Focus to the first line",
				cond: () => {
					if (screen.value === "timing") {
						const elem = $(".lrc-line.active:not(.edit)");
						const index = Number(elem?.dataset.index || "0");
						const count = Lyrics.lines.length;

						if (!elem && count > 0) return true;

						return count > 0 && index + 1 < count && elem;
					}
				},
			},
			toggleEditMode: {
				key: Keybinds.timing.toggleEditMode,
				label: "Edit current line",
				cond: () =>
					screen.value === "timing" &&
					Lyrics.lines.length > 0 &&
					$(".lrc-line.active:not(.edit)"),
			},
			addNewLine: {
				key: Keybinds.timing.addNewLine,
				label: () => {
					if (Lyrics.lines.length === 0) return "Add new line";

					return $(".lrc-line.active")
						? "Add new line after focused"
						: "Add new line at the end";
				},
				cond: () => screen.value === "timing" && !$(".lrc-line.edit"),
			},
			addNewLineReverse: {
				key: Keybinds.timing.addNewLineReverse,
				label: "Add new line before focused",
				cond: () =>
					screen.value === "timing" &&
					Lyrics.lines.length > 0 &&
					$(".lrc-line.active:not(.edit)"),
			},
			deleteLine: {
				key: Keybinds.timing.deleteLine,
				label: () =>
					$(".lrc-line.active") ? "Delete focused line" : "Delete last line",
				cond: () =>
					screen.value === "timing" &&
					Lyrics.lines.length > 0 &&
					!$(".lrc-line.edit"),
			},
			setLineTiming: {
				key: Keybinds.timing.setLineTiming,
				label: "Set line time",
				cond: () =>
					screen.value === "timing" &&
					Lyrics.lines.length > 0 &&
					$(".lrc-line.active:not(.edit)"),
			},
			unfocusLine: {
				key: Keybinds.timing.unfocusLine,
				label: "Unfocus current line",
				cond: () =>
					screen.value === "timing" &&
					Lyrics.lines.length > 0 &&
					$(".lrc-line.active:not(.edit)"),
			},
		},
		downloadLRC: {
			key: Keybinds.downloadLRC,
			label: "Download LRC",
			cond: () =>
				screen.value !== "edit" &&
				Lyrics.lines.length > 0 &&
				!$(".lrc-line.edit"),
		},
		uploadAudio: {
			key: Keybinds.uploadAudio,
			label: "Upload audio",
			cond: () => screen.value !== "edit" && !$(".lrc-line.edit"),
		},
		uploadLRC: {
			key: Keybinds.uploadLRC,
			label: "Upload LRC",
			cond: () => screen.value !== "edit" && !$(".lrc-line.edit"),
		},
		showKeybinds: {
			key: Keybinds.showKeybinds,
			label: "Show keybinds",
			cond: () => screen.value !== "edit" && !$(".lrc-line.edit"),
		},

		settings: {
			key: Keybinds.settings,
			label: "Settings",
			cond: () => !$(".lrc-line.edit"),
		},

		tabHome: {
			key: Keybinds.tabHome,
			label: "To Home tab",
			cond: () => !$(".lrc-line.edit"),
		},

		tabEdit: {
			key: Keybinds.tabEdit,
			label: "To Edit tab",
			cond: () => !$(".lrc-line.edit"),
		},

		tabTiming: {
			key: Keybinds.tabTiming,
			label: "To Timing tab",
			cond: () => !$(".lrc-line.edit"),
		},

		tabLyrics: {
			key: Keybinds.tabLyrics,
			label: "To Lyric tab",
			cond: () => !$(".lrc-line.edit"),
		},
	};
}

export const keyEquivalent: Record<string, string | undefined> = {
	ArrowUp: "↑",
	ArrowDown: "↓",
	ArrowLeft: "←",
	ArrowRight: "→",
	Space: "⎵",
	" ": "⎵",
};

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
		},
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
		},
	},

	uploadLRC: {
		label: "Upload LRC",
		special: [true, false, false, false],
		block: true,
		key: "L",
	},
	downloadLRC: {
		label: "Download LRC",
		special: [true, false, false, false],
		block: true,
		key: "S",
	},
	uploadAudio: {
		label: "Upload Audio",
		special: [true, false, false, false],
		block: true,
		key: "M",
	},
	showKeybinds: {
		label: "Show Keybinds",
		special: [true, false, false, false],
		block: true,
		key: "/",
	},

	tabHome: {
		label: "To Home Mode",
		special: [true, false, true, false],
		block: true,
		key: "~",
	},

	tabEdit: {
		label: "To Edit Mode",
		special: [true, false, true, false],
		block: true,
		key: "E",
	},

	tabTiming: {
		label: "To Timing Mode",
		special: [true, false, true, false],
		block: true,
		key: "R",
	},

	tabLyrics: {
		label: "To Lyric Mode",
		special: [true, false, true, false],
		block: true,
		key: "P",
	},

	settings: {
		label: "To Settings Mode",
		special: [true, false, false, false],
		block: true,
		key: ",",
	},
};

export const keyHandlers = {
	player: {
		playPause: () => {
			const Player = window.app.player;
			Player.playPause();
		},
		seekForward: () => {
			const Player = window.app.player;
			Player.currentTime += 5;
		},
		seekBackward: () => {
			const Player = window.app.player;
			Player.currentTime -= 5;
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
		},
	},

	uploadLRC: _presets.uploadNewLrc,
	downloadLRC: _presets.download,
	showKeybinds: _presets.showKeyBinds,

	uploadAudio: () => {
		openFilePicker(
			(file) => {
				if (!file) return;
				const Player = window.app.player;
				Player.updateFile(file);
				Player.addEventListener(
					"load",
					() => {
						const lrc = Player.metadata?.common.lyrics?.join("\n");
						if (lrc?.trim().length) _presets.useAudioLRC();
					},
					{
						once: true,
					},
				);
			},
			{ accept: "audio/*" },
		);
	},
};

export function processKey(
	keybind: KeyBind | string,
	event: KeyboardEvent,
	handler?: (event: KeyboardEvent) => void,
) {
	if (typeof keybind === "string") keybind = { key: keybind };
	keybind.special ??= [false, false, false, false];

	if (
		keybind.key.toLowerCase() === event.key.toLowerCase() &&
		keybind.special[0] === event.ctrlKey &&
		keybind.special[1] === event.altKey &&
		keybind.special[2] === event.shiftKey &&
		keybind.special[3] === event.metaKey
	) {
		if (keybind.block) event.preventDefault();
		evaluate(handler, event);
	}
}

export function getKeybinds() {
	return defaultKeys;
}

// temp fix for syntax highlighting vue
export function as<T>(obj: unknown): T {
	return obj as T;
}
