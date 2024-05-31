<script setup lang="ts">
  import { ref, type HTMLAttributes, watch, onMounted, computed, h } from 'vue';
  import {
    addPX,
    getCSSValue,
    openFilePicker,
    openFilePickerAsync,
    rippleEffect,
    throttler,
  } from '@/api/util';
  import SquareImage from '../elements/square-image.vue';
  import ColorThief from 'color-thief-ts';
  import Styles from '../styles.vue';
  import Colors from '@/api/colors';
  import Color from 'color';
  import type { SelectItem } from '../elements/Select/select.vue';
  import Button from '../elements/Button/button.vue';
  import Select from '../elements/Select/select.vue';
  import TextInput from '../elements/Input/text-input.vue';
  import WavyDivider from '../elements/Divider/wavy-divider.vue';
  import Divider from '../elements/Divider/divider.vue';
  import ButtonGroup from '../elements/Button/button-group.vue';
  import Scroller from '../elements/Text/scroller.vue';
  import Switch from '../elements/Switches/switch.vue';
  import Slider from '../elements/Slider/slider.vue';
  import IconButton from '../elements/Button/icon-button.vue';
  import CircularProgress from '../elements/Progress/circular-progress.vue';
  import { Icon } from '@iconify/vue/dist/iconify.js';
  import FontSelect from './font-select.vue';
  import h2c from 'html2canvas';

  const title = ref('Hold my hand');
  const artist = ref('Random Artist');
  const currentTime = ref(0);
  const duration = ref(0);
  const lyricLine = ref<number[]>([]);
  const lyric = ref('');
  const lrcEffect = ref(false);
  const font = ref('Roboto Flex');
  const lyricsBalance = ref(false);
  const lyricsAlign = ref(0);
  const borderRadius = ref(12);
  const image = ref<File | Blob | string>('/assets/gemini-generated-image.jpg');
  const colorObj = new Colors();
  const colorThief = new ColorThief();
  const downloadType = ref([0]);
  const downloadSize = ref([0]);
  const imgStyle = ref([0]);
  const imgSize = ref([1]);
  const imgRadius = ref(6);
  const padding = ref(16);
  const color = ref('');
  const lyricsSize = ref(30);
  const lyricsWeight = ref(500);
  const loading = ref(false);

  const downloadTypes: SelectItem[] = [
    { name: 'PNG', id: 'png' },
    { name: 'JPG', id: 'jpg' },
    { name: 'WEBP', id: 'webp' },
  ];

  const lyricsAligns = [
    { label: 'left', value: 0 },
    { label: 'center', value: 1 },
    { label: 'right', value: 2 },
  ];

  const downloadSizes: SelectItem[] = [
    { name: 'Original', id: 1 },
    { name: 'x2', id: 2 },
    { name: 'x4', id: 4 },
  ];

  const imgSizes = [
    { id: 48, name: '48px' },
    { id: 64, name: '64px' },
    { id: 80, name: '80px' },
    { id: 96, name: '96px' },
    { id: 128, name: '128px' },
  ];

  const toggleEffect = () => {
    lrcEffect.value = !lrcEffect.value;
  };

  const content = ref<HTMLElement | null>(null);

  const Player = window.app.player;
  const Lyrics = window.app.lyric;

  async function getColor() {
    const imgString: string =
      typeof image.value === 'string'
        ? image.value
        : URL.createObjectURL(image.value);

    const avgColor = await colorThief.getColorAsync(imgString);
    color.value = Color(avgColor).hex();

    if (imgString.startsWith('blob:') && Player.picture?.data !== imgString) {
      URL.revokeObjectURL(imgString);
    }
  }

  function download(url: string) {
    const link = document.createElement('a');
    link.download = `${artist.value} - ${title.value} [Lyrics Card].${downloadTypes[downloadType.value[0]].id}`;
    link.href = url;
    link.click();
    loading.value = false;
  }

  function getLRCLineValue(id: number) {
    const line = Lyrics.lines[id];
    if (!line) return;
    return typeof line.data == 'string'
      ? line.data
      : line.data.map(({ line }) => line).join('');
  }

  function downloadImage() {
    loading.value = true;
    const img = content.value;
    if (!img) return;

    setTimeout(() => {
      const scale = downloadSizes[downloadSize.value[0]].id;
      switch (downloadType.value[0]) {
        case 0:
          h2c(img, { scale: Number(scale) }).then((dataUrl) =>
            download(dataUrl.toDataURL('image/png'))
          );
          break;
        case 1:
          h2c(img, { scale: Number(scale) }).then((dataUrl) =>
            download(dataUrl.toDataURL('image/jpeg'))
          );
          break;
        case 2:
          h2c(img, { scale: Number(scale) }).then((dataUrl) =>
            download(dataUrl.toDataURL('image/webp'))
          );
          break;
      }
    });
  }

  const lrcLines = computed(() =>
    Lyrics.getRaw().lines.map((line) => {
      return {
        id: line.id,
        name:
          typeof line.data == 'string'
            ? line.data || '<Empty>'
            : line.data.map(({ line }) => line).join(''),
      };
    })
  );

  const lyricText = computed(() => {
    const id = lyricLine.value[0];
    if (id !== undefined) {
      const lineData = Lyrics.lines[lyricLine.value[0]].data;

      switch (typeof lineData) {
        case 'string':
          return lineData;
        case 'object':
          return lineData.map(({ line }) => line).join('');
        default:
          return lyric.value;
      }
    }
    return lyric.value;
  });

  const imageStyles: any[] = [
    { id: 'default', name: 'Rounded' },
    { id: 'circle', name: 'Wavy Circle' },
    { id: 'scalloped-square', name: 'Scalloped Square' },
  ];

  const fonts = ['JetBrains Mono', 'Roboto Flex', 'Arial', 'Times New Roman'];

  const lrcWeight = [200, 300, 400, 500, 600, 700, 800];

  async function uploadImage() {
    const file = await openFilePickerAsync({ accept: 'image/*' });

    if (!file) return;
    image.value = file;
  }

  function useEditorMeta() {
    const details = Player.getDetails();
    title.value = details.title;
    artist.value = details.artist || '';
    image.value = Player.picture?.data || '';
  }

  function setColor() {
    throttler(
      () => {
        colorObj.set(Color(color.value));
      },
      {
        key: 'lrc-card-color',
        blockTime: 100,
        endCall: true,
      }
    );
  }

  function toApp() {
    history.pushState(null, '', '/');
  }

  watch(color, setColor);
  watch(image, getColor);
  onMounted(() => {
    getColor();
  });
</script>

<template>
  <div class="app-wrapper">
    <div class="lyric-card-editor">
      <Styles :-colors="colorObj" tag=".lyric-card" />

      <div class="section-wrapper">
        <div class="section main">
          <div class="flex align-center lyric-card-editor-header">
            <Button
              left-icon="material-symbols:queue-music"
              @click="toApp"
              :disabled="loading"
              label="SLEv2"
              variant="subtle"
              radius="sm"
            />
            <h1>Lyric Card Editor</h1>
          </div>

          <div class="preview-card" ref="content">
            <div
              class="lyric-card"
              :style="{
                '--radius': getCSSValue(borderRadius),
                '--padding': getCSSValue(padding),
                '--lrcSize': addPX(lyricsSize),
                '--lrcWeight': lyricsWeight,
                '--lrcAlign': lyricsAligns[lyricsAlign].label,
                '--lrcBalance': lyricsBalance ? 'balance' : 'initial',
                fontFamily: font,
              }"
            >
              <div class="lyric-card-header">
                <SquareImage
                  :src="image"
                  :size="imgSizes[imgSize[0]].id"
                  :radius="imgRadius"
                  :frame="imageStyles[imgStyle[0]].id"
                />
                <div class="lyric-details">
                  <h1 class="lyric-title">{{ title }}</h1>
                  <h2 class="lyric-artist">{{ artist }}</h2>
                </div>
              </div>

              <div class="lyric-card-body">
                <p class="lyric-text">
                  {{ lyricText }}
                </p>
              </div>
            </div>
          </div>
          <WavyDivider />
        </div>
        <div class="scroll-wrapper">
          <div class="section download">
            <Divider label="Card Style" />
            <div class="special">
              <div class="name">Color</div>
              <Scroller class="desc">Set the theme color</Scroller>
              <div class="other">
                <input type="color" v-model="color" />
              </div>
            </div>

            <div class="flex">
              <IconButton
                icon="material-symbols:crop-landscape-outline"
                title="Card Padding"
              />
              <Slider v-model="padding" :min="0" :max="64" />
            </div>

            <div class="flex">
              <IconButton
                icon="material-symbols:border-style-rounded"
                title="Border Radius"
              />
              <Slider v-model="borderRadius" :min="0" :max="100" />
            </div>

            <Select
              required
              :items="fonts"
              :option-comp="FontSelect"
              :value="[fonts.indexOf(font)]"
              :change="(v) => (font = fonts[v[0]])"
            />

            <Divider label="Download Options" />
            <Select
              required
              :value="downloadSize"
              :items="downloadSizes"
              :change="(v) => (downloadSize = v)"
            />
            <div class="actions flex">
              <Select
                required
                :value="downloadType"
                :items="downloadTypes"
                :change="(v) => (downloadType = v)"
              />
              <CircularProgress v-if="loading" :diameter="32" :stroke="4" />
              <Button
                @click="downloadImage"
                left-icon="material-symbols:download"
                v-else
              >
                Download
              </Button>
            </div>
          </div>
        </div>
        <div class="scroll-wrapper editor">
          <div class="section">
            <Divider label="Song Details" />
            <TextInput v-model="title" placeholder="Title" span />
            <TextInput v-model="artist" placeholder="Artist" span />
            <ButtonGroup>
              <Button
                label="Use Editor Meta"
                @click="useEditorMeta"
                variant="outline"
              />
              <Button
                label="Upload Audio File"
                disabled
                variant="outline"
                title="Not available at the moment"
              />
            </ButtonGroup>

            <Divider label="Lyrics" />

            <TextInput
              v-if="lyricLine.length"
              :placeholder="getLRCLineValue(lyricLine[0]) || '<Empty>'"
              @click="lyricLine = []"
              right-icon="material-symbols:close"
              disabled
              span
            />
            <TextInput
              v-else
              v-model="lyric"
              placeholder="Paste your lyrics here..."
              span
            />
            <div class="flex">
              <Select
                :items="lrcLines"
                :value="lyricLine"
                :change="(v) => (lyricLine = v)"
                placeholder="Select from the lyrics editor"
              />
            </div>

            <div
              class="special"
              @pointerdown="rippleEffect"
              @click="toggleEffect"
              v-if="lyricLine.length"
            >
              <div class="name">Lyrics Effect</div>
              <Scroller class="desc">
                Use previous and next lines from the editor (temporarily
                unavailable at the moment)
              </Scroller>
              <div class="switch">
                <Switch v-model="lrcEffect" />
              </div>
            </div>

            <div
              class="special"
              @pointerdown="rippleEffect"
              @click="lyricsBalance = !lyricsBalance"
            >
              <div class="name">Balance Lyrics</div>
              <Scroller class="desc">Wrap the text evenly</Scroller>
              <div class="switch">
                <Switch v-model="lyricsBalance" />
              </div>
            </div>

            <div class="flex">
              <IconButton
                icon="material-symbols:text-fields"
                title="Font Size"
              />
              <Slider v-model="lyricsSize" :min="12" :max="64" />
            </div>

            <div class="flex">
              <IconButton
                icon="mdi:format-text-variant-outline"
                title="Font Weight"
              />
              <Slider v-model="lyricsWeight" :values="lrcWeight" />
            </div>

            <div class="flex">
              <IconButton
                icon="mdi:align-horizontal-distribute"
                title="Align"
              />
              <Slider v-model="lyricsAlign" :values="lyricsAligns" show-label />
            </div>

            <Divider label="Song Image" />
            <div class="flex">
              <TextInput
                v-model="image"
                placeholder="Image URL"
                v-if="typeof image === 'string'"
                span
              />
              <TextInput
                v-else
                disabled
                :placeholder="(image as File).name"
                span
                right-icon="material-symbols:close"
                @click="image = ''"
              />
              <Button
                @click="uploadImage"
                icon="material-symbols:file-upload-outline"
              >
                Upload
              </Button>
            </div>
            <Select
              required
              :items="imgSizes"
              :value="imgSize"
              :change="(v) => (imgSize = v)"
            />
            <Select
              required
              :items="imageStyles"
              :value="imgStyle"
              :change="(v) => (imgStyle = v)"
            />
            <Slider
              v-if="imgStyle[0] === 0"
              v-model="imgRadius"
              :min="0"
              :max="imgSizes[imgSize[0]].id / 2"
              :step="1"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .lyric-card-editor {
    position: fixed;
    inset: 0 0 0 0;
    width: clamp(0px, 100%, 1200px);
    margin-inline: auto;
    height: 100%;

    .flex {
      display: flex;
      gap: var(--md);
      align-items: center;
      height: max-content;
      &.align-center {
        align-items: center;
      }
      .select {
        flex-grow: 1;
      }
    }
  }

  .lyric-card-editor-header {
    margin-bottom: var(--md);
    h1 {
      font-size: var(--font-xxl);
      text-align: center;
      font-weight: 500;
    }
  }

  .section-wrapper {
    display: grid;
    position: absolute;
    inset: 0 0 0 0;
    grid-template-columns: repeat(2, minmax(400px, 1fr));
    grid-template-rows: auto 1fr;
    grid-template-areas:
      'card editor'
      'down editor';
    grid-auto-flow: row;
    grid-gap: var(--sm);

    .main {
      grid-area: card;
    }

    .editor {
      grid-area: editor;
    }

    .down {
      grid-area: down;
    }

    .scroll-wrapper {
      overflow: auto;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: var(--sm);
      padding: var(--md);
      width: 100%;

      &.main {
        gap: 0;

        .wavy-divider {
          margin-bottom: 0;
        }
      }

      .divider-label {
        background-color: var(--color-50);
      }

      .special {
        display: grid;
        height: var(--size-xxl);
        align-items: center;
        position: relative;
        overflow: hidden;
        gap: var(--xs);
        padding-right: var(--md);
        grid-template-areas:
          'name switch'
          'desc switch';
        grid-template-columns: 1fr auto;
        transition: transform 0.25s var(--timing-standard);
        &.hidden {
          transform: scaleY(0);
        }
        .name {
          grid-area: name;
          align-self: end;
          margin-left: var(--md);
          font-size: var(--font-lg);
        }
        .switch {
          grid-area: switch;
          pointer-events: none;
        }
        .other {
          grid-area: switch;
        }

        .desc {
          grid-area: desc;
          align-self: start;
          color: var(--mono-600);
        }
      }

      .preview-card {
        width: 100%;
        grid-template-columns: 1fr;
        grid-auto-flow: row;
        grid-gap: var(--md);
      }

      .lyric-card {
        width: 100%;
        grid-gap: var(--md);
        background: var(--color-100);
        border-radius: var(--radius);
        overflow: hidden;
        padding: var(--padding);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0);
        border: 1px solid var(--color-200);

        .lyric-text {
          padding-block: var(--xl) var(--sm);
          font-size: var(--lrcSize);
          font-weight: var(--lrcWeight);
          text-align: var(--lrcAlign);
          text-wrap: var(--lrcBalance);
          &:empty {
            display: none;
          }
        }

        .lyric-card-header {
          display: grid;
          width: 100%;
          grid-template-columns: auto 1fr;
          grid-auto-flow: row;
          grid-gap: var(--lg);
        }

        .lyric-details {
          display: flex;
          flex-direction: column;
          height: max-content;
          width: 100%;
          mask-image: linear-gradient(
            to right,
            #000 0%,
            #000 90%,
            transparent 100%
          );
          gap: var(--xs);
          margin-block: auto;
          text-wrap: nowrap;
        }

        .lyric-title {
          font-size: var(--font-xxl);
          font-weight: 500;
          width: 0;
        }

        .lyric-artist {
          font-size: var(--font-lg);
          font-weight: 400;
          color: var(--mono-700);
          width: 0;
        }
      }
    }
  }

  @media screen and (max-width: 800px) {
    .section-wrapper {
      display: block;
    }

    .app-wrapper {
      overflow: auto;
      position: relative;
    }

    .lyric-card-editor {
      padding-block: 0;
    }

    .main {
      position: sticky;
      z-index: 10;
      top: 0;
      padding-top: var(--md);
      background: linear-gradient(
        to bottom,
        var(--color-50) 0%,
        var(--color-50) 90%,
        transparent 100%
      );
    }

    .section-wrapper {
      overflow: auto;
    }

    .section {
      height: auto;
      overflow: initial;
    }

    .scroll-wrapper {
      height: auto;
      overflow: initial !important;
      mask-image: none !important;
    }
  }
</style>
