import { addPX } from './css';

export function $<T extends Element = HTMLElement>(
  selector: string,
  element?: Element | EventTarget | null
): T | null {
  return ((element as Element) || document).querySelector(selector);
}

export function getParent(
  element: HTMLElement | null,
  selector: string,
  self?: boolean,
  deep = 10
): HTMLElement | null {
  if (deep <= 0 || !element) return null;
  if (self && element.matches(selector)) return element;

  return getParent(element.parentElement, selector, true, deep - 1);
}

export function onSelfEvent<T extends Event>(
  event: T,
  handler: (event: T) => any
) {
  const target = event.target as HTMLElement;
  const currentTarget = event.currentTarget as HTMLElement;

  if (target === currentTarget) {
    handler(event);
  }
}

export type BoxDimensions = {
  height: number;
  width: number;
};
let cdtID: ReturnType<typeof setTimeout> | null = null;
export function charDimensions(
  parent?: HTMLElement,
  text = 'A'
): BoxDimensions {
  parent ??= document.body;
  let span: HTMLSpanElement | null = $('span.char-dimensions', parent);

  if (!span) {
    span = document.createElement('span');
    span.style.position = 'fixed';
    span.style.whiteSpace = 'pre';
    span.style.visibility = 'hidden';
    span.style.pointerEvents = 'none';
    span.style.opacity = '0';
    span.className = 'char-dimensions';
    parent.appendChild(span);
  }

  span.textContent = text;

  const rect = span.getBoundingClientRect();
  const width = Number(rect.width.toFixed(2));
  const height = Number(rect.height.toFixed(2));

  if (cdtID) {
    clearTimeout(cdtID);
    cdtID = null;
  }

  cdtID = setTimeout(() => span && span.remove(), 50);
  return { width, height };
}

export async function openFilePickerAsync(): Promise<File | null>;
export async function openFilePickerAsync(options: {
  accept?: string;
}): Promise<File | null>;
export async function openFilePickerAsync(options: {
  accept?: string;
  multiple: true;
}): Promise<File[] | null>;
export async function openFilePickerAsync(
  options: { accept?: string; multiple?: boolean } = {}
) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = options.accept || '';
  input.multiple = options.multiple ?? false;

  return new Promise<File | File[] | null>((resolve) => {
    input.onchange = function () {
      resolve(
        options.multiple ? [...(input.files || [])] : input.files?.[0] || null
      );
      this.removeEventListener('change', input.onchange!);
    };
    input.click();
  });
}

export function openFilePicker(callback: (file: File | null) => any): void;
export function openFilePicker(
  callback: (file: File | null) => any,
  options: { accept?: string }
): void;
export function openFilePicker(
  callback: (file: File[]) => any,
  options: { accept?: string; multiple: true }
): void;
export function openFilePicker(
  callback: (file: any) => any,
  options: { accept?: string; multiple?: boolean } = {}
) {
  openFilePickerAsync(options).then((file) => callback(file)?.then?.());
}

export function rippleEffect(e: MouseEvent, to?: string) {
  const target = e.currentTarget as HTMLElement;
  const element = to ? $(to, target) || target : target;

  if ('disabled' in element && element.disabled) return;

  const rect = element.getBoundingClientRect();
  const ripple = document.createElement('span');

  ripple.className = 'ripple';
  ripple.style.left = addPX(e.clientX - rect.left);
  ripple.style.top = addPX(e.clientY - rect.top);
  ripple.style.width = addPX(
    rect.height > rect.width ? rect.height : rect.width
  );
  ripple.style.height = ripple.style.width;

  ripple.addEventListener('animationend', () => ripple.remove());

  element.appendChild(ripple);
}

export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
