import { CustomEventHandler } from "@vue-material/core";

type ClipboardEvents = {
	set: [text: string];
};

export class Clipboard extends CustomEventHandler<ClipboardEvents> {
	private value = "";

	get supported(): boolean {
		return !!navigator.clipboard;
	}

	async set(text: string) {
		this.dispatchEvent("set", text);

		if (this.supported) {
			await navigator.clipboard.writeText(text);
			return;
		}

		this.value = text;
	}

	async get() {
		return this.supported ? await navigator.clipboard.readText() : this.value;
	}
}

export default Clipboard;
