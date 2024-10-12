import type { IAudioMetadata } from "music-metadata-browser";

import { clamp, fastAvgColor, CustomEventHandler } from "@vue-material/core";
import { bufferToBlob, ImgUtil } from "@/utils/image";

export type AudioImage = {
	data: string;
	blur: string;
	color: string;
};

export type AudioDetails = {
	duration: number;
	artist?: string;
	album?: string;
	title: string;
};

type AudioServiceEvents = {
	update: undefined;
	seek: [time: number];
	playpause: [state: boolean];
	reset: undefined;
	loading: undefined;
	error: [err: Error];
	load: undefined;
};
class AudioService extends CustomEventHandler<AudioServiceEvents> {
	private _instance = new Audio();
	private cleanup = () => {};
	metadata?: IAudioMetadata;
	picture?: AudioImage;
	ready = false;

	get details() {
		return {
			duration: this._instance.duration,
			artist: this.metadata?.common.artist,
			album: this.metadata?.common.album,
			title: this.metadata?.common.title || "",
		};
	}

	get instance() {
		return this._instance;
	}

	constructor(src?: string) {
		super();

		if (src) this.src = src;
	}

	initEvents() {
		const player = this._instance;

		const onSeek = () => {
			this.currentTime = player.currentTime;
		};

		const playPause = () => {
			this.emit("playpause", !player.paused);
		};

		player.addEventListener("seeked", onSeek);
		player.addEventListener("play", playPause);
		player.addEventListener("pause", playPause);

		return () => {
			player.removeEventListener("seeked", onSeek);
			player.removeEventListener("play", playPause);
			player.removeEventListener("pause", playPause);
		};
	}

	private async loadPicture(): Promise<AudioImage | undefined> {
		const dataBuffer = this.metadata?.common.picture?.[0].data;

		if (dataBuffer) {
			const data = bufferToBlob(dataBuffer);
			const image = await ImgUtil.from(data);
			const blur = await image.resize(200).blur(5).toBlob();

			return {
				color: await fastAvgColor(data),
				data: URL.createObjectURL(data),
				blur: URL.createObjectURL(blur),
			};
		}
	}

	private loadMediaSession() {
		if (!this.metadata) return;

		const { title, artist, album } = this.metadata.common;
		navigator.mediaSession.metadata = new MediaMetadata({
			title,
			artist,
			album,
			artwork: this.picture?.data
				? [
						{
							src: this.picture.data,
							sizes: "512x512",
							type: "image/jpeg",
						},
					]
				: [],
		});

		navigator.mediaSession.setActionHandler("play", () => this.playPause());
		navigator.mediaSession.setActionHandler("pause", () => this.playPause());

		navigator.mediaSession.setActionHandler("seekto", (details) => {
			this.currentTime = details.seekTime || 0;
		});
	}

	get src() {
		return this._instance.src;
	}

	set src(src: string) {
		fetch(src).then(async (res) => {
			if (res.ok) this.updateFile(await res.blob(), true);
			throw new Error(`Failed to load audio: ${res.statusText}`);
		});
	}

	private onLoad(init?: boolean) {
		this.ready = true;
		this.loadMediaSession();
		this.cleanup = this.initEvents();
		init && this.emit("load");
		this.emit("update");
	}

	updateFile(file: Blob | File, init?: boolean) {
		setTimeout(async () => {
			const music = await import("music-metadata-browser");
			this.metadata = await music.parseBlob(file);
			this.metadata.common.title ??= "name" in file ? file.name : "";
			this.picture = await this.loadPicture();

			this._instance.addEventListener(
				"loadeddata",
				this.onLoad.bind(this, init),
				{ once: true },
			);

			this._instance.src = URL.createObjectURL(file);
			this._instance.load();
		});
	}

	playPause() {
		const instance = this._instance;
		const state = Number.isFinite(instance.duration) && instance.paused;
		state ? instance.play() : instance.pause();

		this.emit("playpause", !state);
	}

	get currentTime() {
		return this._instance.currentTime;
	}

	set currentTime(time: number) {
		const newTime = clamp(time, 0, this._instance.duration);
		this._instance.currentTime = newTime;

		this.emit("seek", newTime);
	}

	reset() {
		const player = this._instance;

		this.cleanup();
		player.pause();
		player.src = "";
		player.currentTime = 0;

		if (this.picture) {
			URL.revokeObjectURL(this.picture.data);
			URL.revokeObjectURL(this.picture.blur);
			this.picture = undefined;
		}

		this.ready = false;
		this.metadata = undefined;
		this.emit("reset");
		player.load();
	}
}

export default AudioService;
