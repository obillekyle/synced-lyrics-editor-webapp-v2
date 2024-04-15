import { CustomEventHandler } from "./event";

type ClipboardEvents = "set";
type ClipboardArgs = [text: string];


export class Clipboard extends CustomEventHandler<ClipboardEvents, ClipboardArgs> {

  private value = '';

  get supported(): boolean {
    return !!navigator.clipboard;
  }

  async set(text: string) {

    this.dispatchEvent("set", [text]);

    if (this.supported) {
      await navigator.clipboard.writeText(text);
      return;
    }

    this.value = text;

  }

  async get() {

    if (this.supported) {
      return await navigator.clipboard.readText();
    }

    return this.value;

  }
}


export default Clipboard;