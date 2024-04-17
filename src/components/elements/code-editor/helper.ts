import type { KeyBind } from "@/components/keybinds/keys";

export type EditorSelection = {
  type: 'forward' | 'backward';
  start: { line: number; char: number };
  endAt: { line: number; char: number };
}

export type HistoryItem = (
  | {
    id: number;
    type: 'add';
    items: {
      line: number;
      char: number;
      text: string;
    }[];
  }
  | {
    id: number;
    type: 'remove';
    items: {
      line: number;
      char: number;
      text: string;
    }[];
  }
)

export type LineItem = {
  id: number;
  text: string;
}



export type EditorKeyBinds<T extends any> = {
  prevLine: T;
  nextLine: T;
  prevChar: T;
  nextChar: T;
  prevWord: T;
  nextWord: T;

  selectPrevLine: T;
  selectNextLine: T;
  selectNextChar: T;
  selectPrevChar: T;
  selectFullLine: T;
  selectAllLines: T;

  copy: T;
  cut: T;
  paste: T;
  undo: T;
  redo: T;
  save: T;

  scrollUp: T;
  scrollDown: T;
  scrollLeft: T;
  scrollRight: T;

  indent: T;
  newLine: T;
  newPrevLine: T;
  newNextLine: T;

  removeChar: T;
  removeWord: T;
  removeNextChar: T;
  removeNextWord: T;

  toggleComment: T;

}

// special: [ctrlKey, altKey, shiftKey, metaKey]
export const editorKeyBinds: EditorKeyBinds<KeyBind | string> = {
  prevLine: "ArrowUp",
  nextLine: "ArrowDown",
  prevChar: "ArrowLeft",
  nextChar: "ArrowRight",

  prevWord: {
    special: [true, false, false, false],
    key: "ArrowLeft",
  },
  nextWord: {
    special: [true, false, false, false],
    key: "ArrowRight",
  },

  selectPrevLine: {
    special: [false, false, true, false],
    key: "ArrowUp",
  },
  selectNextLine: {
    special: [false, false, true, false],
    key: "ArrowDown",
  },
  selectNextChar: {
    special: [false, false, true, false],
    key: "ArrowRight",
  },
  selectPrevChar: {
    special: [false, false, true, false],
    key: "ArrowLeft",
  },
  selectFullLine: {
    special: [false, false, true, false],
    key: "a",
  },
  selectAllLines: {
    special: [true, false, false, false],
    key: "a",
  },

  copy: {
    special: [true, false, false, false],
    key: "c",
    block: true,
  },
  cut: {
    special: [true, false, false, false],
    key: "x",
    block: true,
  },
  paste: {
    special: [true, false, false, false],
    key: "v",
    block: true,
  },

  undo: {
    special: [false, false, false, false],
    key: "z",
  },
  redo: {
    special: [true, false, false, false],
    key: "z",
  },

  save: {
    special: [true, false, false, false],
    key: "s",
    block: true,
  },

  scrollUp: {
    special: [true, false, false, false],
    key: "ArrowUp",
  },
  scrollDown: {
    special: [true, false, false, false],
    key: "ArrowDown",
  },
  scrollLeft: {
    special: [true, false, false, false],
    key: "ArrowLeft",
  },
  scrollRight: {
    special: [true, false, false, false],
    key: "ArrowRight",
  },

  indent: "Tab",
  newLine: "Enter",
  newPrevLine: {
    special: [true, false, true, false],
    key: "Enter",
  },
  newNextLine: {
    special: [true, false, false, false],
    key: "Enter",
  },

  removeChar: "Backspace",
  removeWord: {
    special: [true, false, false, false],
    key: "Backspace",
  },
  removeNextChar: "Delete",
  removeNextWord: {
    special: [true, false, false, false],
    key: "Delete",
  },

  toggleComment: {
    special: [true, false, false, false],
    key: "/",
  },
}

export type TextDimensionsFn = (text: string) => { width: number; height: number };
export type ScrollToFN = (pos: { x?: number, y?: number }, smooth?: boolean) => void;

// regex

export const SELECTION_KEYWORD_MATCHER = /\s*[\w\d][^\ ]*|\s*.[^\ \w\d]*/g;


// boolean;

export function isKeyboardKey(key: string) {
  return key.match(/[\w\s.,\/#!$%\^&\*;:{}=\-_`~()\]\['@"\\+<>\?]/);
}


// other

export function defaultFormatter(v: string) {
  const arr = v.split('\n');
  let text = '';

  for (let i = 0; i < arr.length; i++) {
    text += `<span>${arr[i] || '<br/>'}</span>`;
  }

  return text;
}

type Line = {
  id: number;
  text: string;
}

export function linesToString(line: Line[]) {
  return line.reduce((prev, curr, index) => {
    prev += curr?.text || '';

    if (index != line.length - 1) {
      prev += '\n';
    }

    return prev;
  }, '');
}

export function stringToLines(text: string): Line[] {
  const arr = text.split('\n');
  const line: Line[] = [];

  for (let i = 0; i < arr.length; i++) {
    line.push({
      id: i,
      text: arr[i],
    });
  }

  return line;

}

const pairMap: Record<string, string | undefined> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  "'": "'",
  '<': '>',
  '`': '`',
};

export function getPair(str: string): string | undefined {
  return pairMap[str];
}


