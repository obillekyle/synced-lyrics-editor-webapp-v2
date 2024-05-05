import { evaluate } from "./object";

export function escapeHtml(unsafeText: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return unsafeText.replace(/[&<>"']/g, (match) => map[match]);
}

export function unscapeHtml(unsafeText: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };

  return unsafeText.replace(/(&amp;|&lt;|&gt;|&quot;|&#39;)/g, (match) => map[match]);
}

export function insertAt(text: string, index: number, value: string) {
  return text.slice(0, index) + value + text.slice(index);
}

export function replaceRange(text: string, [start, end]: [number, number], value: string) {
  return text.slice(0, start) + value + text.slice(end);
}

export function reverseString(str: string) {
  return str
    .split('')
    .reverse()
    .join('');
}

export function fixLineBreaks(str: string) {
  if (str === '' || str === '\n') return '';
  let text = '';
  let skip = true;

  str = str.endsWith('\n') ? str.slice(0, -1) : str;
  const arr = str.split('\n') as string[];

  for (let i = 0; i < arr.length; i++) {
    const line = arr[i].replace('\r', '');
    if (i == 0 && line == '') {
      text += '\n';
      continue;
    } else if (arr[i - 1] == '' && line == '' && skip) {
      text += '';
      skip = false;
      continue;
    } else if (line == '' && i !== arr.length - 1) {
      text += '\n';
      skip = true;
      continue;
    } else if (line == '' && i === arr.length - 1) {
      continue;
    } else if (i == arr.length - 1) {
      text += line;
      skip = false;
      break;
    }

    text += `${line}\n`;
    skip = false;
  }

  return text;
}


export class MutableString extends String {

  constructor(str: string) {
    super(str);
  }

  replaceAll(find: string, replace: string) {
    return new MutableString(this.toString().replace(new RegExp(find, 'g'), replace));
  }

  replaceRange([start, end]: [number, number], replace: string) {
    return new MutableString(replaceRange(this.toString(), [start, end], replace));
  }

  insert(index: number, replace: string) {
    return new MutableString(insertAt(this.toString(), index, replace));
  }

  reverse() {
    return new MutableString(reverseString(this.toString()));
  }

  escape() {
    return new MutableString(escapeHtml(this.toString()));
  }

  unescape() {
    return new MutableString(unscapeHtml(this.toString()));
  }
}


type TemplateString = [
  string[] | TemplateStringsArray,
  ...any[]
]

function toRegularString(parts: string[] | TemplateStringsArray, ...args: any[]): string {
  let result = "";
  for (let i = 0; i < parts.length; i++) {
    result += parts[i];
    if (i < args.length) {
      result += String(evaluate(args[i])).toString();
    }
  }
  return result;
}

export const mt = (...args: TemplateString | [string]) => {
  return new MutableString(toRegularString(args));
}