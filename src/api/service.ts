import { FastAverageColor } from 'fast-average-color';
import type { IAudioMetadata } from 'music-metadata-browser';

import { clamp } from './util';

const fac = new FastAverageColor();

export type AudioOptions = {
  currentPos: number;
  onLoad: (this: MusicService) => void;
};

export type AudioImage = {
  data: string;
  color: string;
  blur: string;
};

export type AudioDetails = {
  duration: number;
  artist?: string;
  album?: string;
  title: string;
};

const updatedEvent = new CustomEvent('musicupdated', { bubbles: false });
const seekedEvent = new CustomEvent('seeked', { bubbles: false });
const resetEvent = new CustomEvent('reset', { bubbles: false });

class MusicService extends Audio {
  constructor();
  constructor(file: File, opts?: AudioOptions);
  constructor(file?: File, opts?: AudioOptions) {
    super();

    file && this.updateFile(file, opts).then();
  }

  getDetails(): AudioDetails {
    return {
      duration: this.duration,
      artist: this.metadata?.common.artist,
      album: this.metadata?.common.album,
      title: this.metadata?.common.title || '',
    };
  }

  async updateFile(file?: File | Blob, opts?: AudioOptions) {
    if (!file) return false;
    this.reset(true);

    try {
      const music = await import('music-metadata-browser');
      this.metadata = await music.parseBlob(file);
      this.currentTime = opts?.currentPos ?? 0;

      const handler = () => {
        opts?.onLoad?.call(this);
        this.removeEventListener('loadedmetadata', handler);
        this.dispatchEvent(updatedEvent);
      };
      this.addEventListener('loadedmetadata', handler);

      this.picture = await this.getImage();
      this.src = URL.createObjectURL(file);
      this.loadMediaSession();

      this.load();
    } catch (e) {
      console.error(e);
      return false;
    }

    return true;
  }

  private loadMediaSession() {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: this.metadata?.common.title,
      artist: this.metadata?.common.artist,
      album: this.metadata?.common.album,
      artwork: this.picture?.data
        ? [
            {
              src: this.picture.data,
              sizes: '512x512',
              type: 'image/jpeg',
            },
          ]
        : [],
    });

    navigator.mediaSession.setActionHandler('seekbackward', () => {
      this.fastSeek(-5);
    });

    navigator.mediaSession.setActionHandler('seekforward', () => {
      this.fastSeek(5);
    });
  }

  playPause() {
    isFinite(this.duration) && this.paused ? this.play() : this.pause();
  }

  setVolume(volume: number) {
    if (volume === 0) {
      this.muted = true;
      return;
    }

    this.muted = false;
    this.volume = clamp(volume / 100, 0.01, 100);
  }

  fastSeek(time: number): void {
    if (this.currentTime + time >= this.duration) {
      this.currentTime = this.duration;
    } else if (this.currentTime + time <= 0) {
      this.currentTime = 0;
    } else {
      this.currentTime += time;
    }

    this.dispatchEvent(seekedEvent);
  }

  private async getImage(): Promise<AudioImage> {
    let imageData = { data: '', color: '#454545', blur: '' };
    const image = this.metadata?.common.picture?.[0].data;

    if (image) {
      const Image = (await import('image-js')).default;
      const audioImage = await Image.load(image);

      const color = fac.getColorAsync(audioImage.getCanvas());
      const data = audioImage.toBlob('image/jpeg');
      const blur = audioImage
        .resize({ width: 200, height: 200 })
        .blurFilter({ radius: 4 })
        .toBlob();

      const awaited = await Promise.all([color, data, blur]);

      imageData.color = awaited[0].hexa;
      imageData.data = URL.createObjectURL(awaited[1]);
      imageData.blur = URL.createObjectURL(awaited[2]);
    }
    return imageData;
  }

  reset(ignore: boolean = false) {
    this.pause();

    this.src && URL.revokeObjectURL(this.src);
    this.picture?.blur && URL.revokeObjectURL(this.picture.blur);
    this.picture?.data && URL.revokeObjectURL(this.picture.data);

    this.src = '';
    this.picture = undefined;
    this.metadata = undefined;

    this.currentTime = 0;

    this.dispatchEvent(resetEvent);
    this.load();

    if (!ignore) {
      this.dispatchEvent(updatedEvent);
    }
  }
}

interface MusicService extends HTMLAudioElement {
  metadata: IAudioMetadata | undefined;
  picture: AudioImage | undefined;

  addEventListener<K extends keyof HTMLMediaElementEventMap>(
    type: K,
    listener: (this: HTMLAudioElement, ev: HTMLMediaElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions | undefined
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions | undefined
  ): void;
  addEventListener(
    type: 'musicupdated',
    listener: (this: MusicService, ev: CustomEvent) => any,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListener<K extends keyof HTMLMediaElementEventMap>(
    type: K,
    listener: (this: HTMLAudioElement, ev: HTMLMediaElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions | undefined
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions | undefined
  ): void;
  removeEventListener(
    type: 'musicupdated',
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions | undefined
  ): void;

  updateFile(file: File, opts?: AudioOptions): Promise<boolean>;
}

window.customElements.define('music-service', MusicService, {
  extends: 'audio',
});

export default MusicService;
