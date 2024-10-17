<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

import {
	Button,
	CircularProgress,
	Divider,
	IconButton,
	Scroller,
	Select,
	Slider,
	SquareImage,
	Switch,
	TextInput,
	ThemeProvider,
	WavyDivider,
	as,
	fastAvgColor,
	openFilePickerAsync,
	rippleEffect,
} from '@vue-material/core'

import type { ObjectValue } from '@vue-material/core/utils/other/to-object-value.js'
import h2c from 'html2canvas-pro'
import FontSelect from './font-select.vue'

const audioInfo = reactive({
	title: 'Hold my hand',
	artist: 'Random Artist',
	currentTime: 0,
	duration: 0,
})

const lyrics = reactive({
	line: undefined as number | undefined,
	text: '',
	effect: false,
	align: 0,
	balance: false,
})

const font = reactive({
	family: 'Roboto Flex',
	size: 30,
	weight: 500,
})

const downloadOptions = reactive({
	type: 'png',
	size: 1,
})

const image = reactive({
	radius: 12,
	width: 48,
	frame: 'default',
	data: '/assets/gemini-generated-image.jpg',
})

const box = reactive({
	radius: 12,
	padding: 16,
	color: '',
})

const loading = ref(false)

const downloadTypes: ObjectValue[] = [
	{ label: 'PNG', value: 'png' },
	{ label: 'JPG', value: 'jpg' },
	{ label: 'WEBP', value: 'webp' },
]

const lyricsAligns = [
	{ label: 'left', value: 0 },
	{ label: 'center', value: 1 },
	{ label: 'right', value: 2 },
]

const downloadSizes: ObjectValue[] = [
	{ label: 'Original', value: 1 },
	{ label: 'x2', value: 2 },
	{ label: 'x4', value: 4 },
]

const imgSizes = [
	{ value: 48, label: '48px' },
	{ value: 64, label: '64px' },
	{ value: 80, label: '80px' },
	{ value: 96, label: '96px' },
	{ value: 128, label: '128px' },
]

const toggleEffect = () => {
	lyrics.effect = !lyrics.effect
}

const content = ref<HTMLElement | null>(null)

const Player = window.app.player
const Lyrics = window.app.lyric

function download(url: string) {
	const link = document.createElement('a')
	link.download = `${audioInfo.artist} - ${audioInfo.title} [Lyrics Card].${downloadOptions.type}`
	link.href = url
	link.click()
	loading.value = false
}

function getLRCLineValue(id: number) {
	const line = Lyrics.lines[id]
	if (!line) return
	return typeof line.data === 'string'
		? line.data
		: line.data.map(({ line }) => line).join('')
}

function downloadImage() {
	loading.value = true
	const img = content.value
	if (!img) return

	setTimeout(async () => {
		const scale = downloadOptions.size
		const canvas = await h2c(img, {
			scale: Number(scale),
			backgroundColor: 'transparent',
		})
		switch (downloadOptions.type) {
			case 'png':
				download(canvas.toDataURL())
				break
			case 'jpg':
				download(canvas.toDataURL('image/jpeg'))
				break
			case 'webp':
				download(canvas.toDataURL('image/webp'))
				break
			default:
				download(canvas.toDataURL())
				break
		}
	})
}

const lrcLines = computed(() =>
	Lyrics.getRaw().lines.map((line) => {
		return {
			value: line.id,
			label:
				typeof line.data === 'string'
					? line.data || '<Empty>'
					: line.data.map(({ line }) => line).join(''),
		}
	}),
)

function getLrcLineString(index: number) {
	const line = Lyrics.lines[index]
	if (!line) return ''
	return typeof line.data === 'string'
		? line.data
		: line.data.map(({ line }) => line).join('')
}

const getPreviousLine = () => {
	if (lyrics.line === undefined) return

	const index = lyrics.line - 1
	if (index < 0) return
	return getLRCLineValue(index)
}

const getNextLine = () => {
	if (lyrics.line === undefined) return

	const index = lyrics.line + 1
	if (index >= lrcLines.value.length) return
	return getLRCLineValue(index)
}

const lyricText = computed(() => {
	const id = lyrics.line
	if (id !== undefined) {
		const lineData = Lyrics.lines[id].data

		switch (typeof lineData) {
			case 'string':
				return lineData
			case 'object':
				return lineData.map(({ line }) => line).join('')
			default:
				return lyrics.text
		}
	}
	return lyrics.text
})

const imageStyles: ObjectValue[] = [
	{ value: 'none', label: 'Rounded' },
	{ value: 'circle', label: 'Wavy Circle' },
	{ value: 'clover', label: 'Clover' },
]

const fonts = ['JetBrains Mono', 'Roboto Flex', 'Arial', 'Times New Roman']

const lrcWeight = [200, 300, 400, 500, 600, 700, 800]

async function uploadImage() {
	const file = await openFilePickerAsync({ accept: 'image/*' })

	if (!file) return
	URL.revokeObjectURL(image.data)
	image.data = URL.createObjectURL(file)
}

function useEditorMeta() {
	const details = Player.details
	audioInfo.title = details.title
	audioInfo.artist = details.artist || ''
	image.data = Player.picture?.data || ''
}

function toApp() {
	history.pushState(null, '', '/')
}

async function getColor() {
	const imgString: string =
		typeof image.data === 'string'
			? image.data
			: URL.createObjectURL(image.data)

	const avgColor = await fastAvgColor(imgString)

	if (imgString.startsWith('blob:') && Player.picture?.data !== imgString) {
		URL.revokeObjectURL(imgString)
	}

	box.color = avgColor
}

watch(image, getColor)

onMounted(() => {
	getColor()
})
</script>

<template>
  <div class="app-wrapper">
    <div class="lyric-card-editor">
      <div class="section-wrapper">
        <div class="section main">
          <div class="flex align-center lyric-card-editor-header">
            <Button
              left-icon="material-symbols:queue-music"
              @click="toApp"
              :disabled="loading"
              label="SLEv2"
              variant="tonal"
              radius="sm"
            />
            <h1>Lyric Card Editor</h1>
          </div>

          <div class="preview-card" ref="content">
            <ThemeProvider
              class="lyric-card"
              :style="{
                $radius: box.radius,
                $padding: box.padding,
                $lrcSize: font.size,
                $lrcWeight: font.weight,
                $lrcAlign: lyricsAligns[lyrics.align].label,
                $lrcBalance: lyrics.balance ? 'balance' : 'initial',
                fontFamily: font,
              }"
            >
              <div class="lyric-card-header">
                <SquareImage
                  :src="image.data"
                  :size="image.width"
                  :r="image.radius"
                  :frame="as(image.frame)"
                />
                <div class="lyric-details">
                  <h1 class="lyric-title">{{ audioInfo.title }}</h1>
                  <h2 class="lyric-artist">{{ audioInfo.artist }}</h2>
                </div>
              </div>

              <div class="lyric-card-body">
                <p 
                  class="prev-lrc" 
                  v-if="lyrics.line !== undefined && lyrics.effect"
                >
                  {{ getPreviousLine() }}
                </p>
                <p class="lyric-text">
                  {{ lyricText }}
                </p>
                <p 
                  class="next-lrc" 
                  v-if="lyrics.line !== undefined && lyrics.effect"
                >
                  {{ getNextLine() }}
                </p>
              </div>
            </ThemeProvider>
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
                <input type="color" v-model="box.color" />
              </div>
            </div>

            <div class="flex">
              <IconButton
                icon="material-symbols:crop-landscape-outline"
                title="Card Padding"
              />
              <Slider v-model="box.padding" :min="0" :max="64" />
            </div>

            <div class="flex">
              <IconButton
                icon="material-symbols:border-style-rounded"
                title="Border Radius"
              />
              <Slider v-model="box.radius" :min="0" :max="100" />
            </div>

            <Select
              required
              :items="fonts"
              :option-comp="FontSelect"
              :value="[fonts.indexOf(font.family)]"
              @change="([v]) => (font.family = String(v ?? 'Roboto Flex'))"
            >
              <template v-slot="{ label, value }">
                <div :style="`font-family: ${label}`">
                  {{ label }}
                </div>
              </template>
            </Select>
            <Divider label="Download Options" />
            <Select
              required
              :items="downloadSizes"
              :value="[downloadOptions.size]"
              @change="([v]) => (downloadOptions.size = Number(v))"
            />
            <div class="actions flex">
              <Select
                required
                :items="downloadTypes"
                :value="[downloadOptions.type]"
                @change="([v]) => (downloadOptions.type = String(v))"
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
            <TextInput v-model="audioInfo.title" placeholder="Title" span />
            <TextInput v-model="audioInfo.artist" placeholder="Artist" span />
            <ButtonGroup>
              <Button
                label="Use Editor Meta"
                @click="useEditorMeta"
                variant="outlined"
              />
              <Button
                label="Upload Audio File"
                disabled
                variant="outlined"
                title="Not available at the moment"
              />
            </ButtonGroup>

            <Divider label="Lyrics" />

            <TextInput
              v-if="lyrics.line !== undefined"
              :placeholder="getLRCLineValue(lyrics.line) || '<Empty>'"
              @click="lyrics.line = undefined"
              right-icon="material-symbols:close"
              disabled
              span
            />
            <TextInput
              v-else
              v-model="lyrics.text"
              placeholder="Paste your lyrics here..."
              span
            />
            <div class="flex">
              <Select
                :items="lrcLines"
                :value="lyrics.line ? [lyrics.line] : []"
                @change="([v]) => (lyrics.line = Number(v))"
                placeholder="Select from the lyrics editor"
              />
            </div>

            <div
              class="special"
              @pointerdown="rippleEffect"
              @click="toggleEffect"
              v-if="lyrics.line !== undefined"
            >
              <div class="name">Lyrics Effect</div>
              <Scroller class="desc">
                Use previous and next lines from the editor
              </Scroller>
              <div class="switch">
                <Switch v-model="lyrics.effect" />
              </div>
            </div>

            <div
              class="special"
              @pointerdown="rippleEffect"
              @click="lyrics.balance = !lyrics.balance"
            >
              <div class="name">Balance Lyrics</div>
              <Scroller class="desc">Wrap the text evenly</Scroller>
              <div class="switch">
                <Switch v-model="lyrics.balance" />
              </div>
            </div>

            <div class="flex">
              <IconButton
                icon="material-symbols:text-fields"
                title="Font Size"
              />
              <Slider v-model="font.size" :min="12" :max="64" />
            </div>

            <div class="flex">
              <IconButton
                icon="mdi:format-text-variant-outline"
                title="Font Weight"
              />
              <Slider v-model="font.weight" :values="lrcWeight" />
            </div>

            <div class="flex">
              <IconButton
                icon="mdi:align-horizontal-distribute"
                title="Align"
              />
              <Slider v-model="lyrics.align" :values="lyricsAligns" show-label />
            </div>

            <Divider label="Song Image" />
            <div class="flex">
              <TextInput
                v-model="image.data"
                placeholder="Image URL"
                span
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
              :value="[image.width]"
              @change="([v]) => (image.width = Number(v))"
            />
            <Select
              required
              :items="imageStyles"
              :value="[image.frame]"
              @change="([v]) => (image.frame = String(v))"
            />
            <Slider
              v-if="image.frame === 'none'"
              v-model="image.radius"
              :min="0"
              :max="image.width / 2"
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
        background-color: var(--primary-5);
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
          color: var(--mono-60);
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
        background: var(--primary-10);
        border-radius: var(--radius);
        overflow: hidden;
        padding: var(--padding);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0);
        border: 1px solid var(--primary-20);

        .lyric-text {
          line-height: 1.25;
          padding-block: var(--xl) var(--sm);
          font-size: var(--lrcSize);
          font-weight: var(--lrcWeight);
          text-align: var(--lrcAlign);
          text-wrap: var(--lrcBalance);
          &:empty {
            display: none;
          }
        }

        .lyric-card-body:has(.prev-lrc, .next-lrc) {
          padding-block: var(--xxl) var(--md);
        }

        &:has(.next-lrc) .lyric-text {
          padding-bottom: var(--xl) !important;
        }

        &:has(.prev-lrc, .next-lrc) .lyric-text:empty {
          display: block;
          &::before {
            content: '...';
            opacity: 0;
          }
        }

        .prev-lrc,
        .next-lrc {
          line-height: 1.25;
          font-size: calc(var(--lrcSize) * 0.75);
          text-align: var(--lrcAlign);
          text-wrap: var(--lrcBalance);
          font-weight: calc(var(--lrcWeight) - 100);
          opacity: 0.5;

          &:empty::before {
            content: '...';
            opacity: 0;
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
          color: var(--mono-70);
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
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
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
        var(--primary-5) 0%,
        var(--primary-5) 90%,
        transparent 100%
      );
    }

    .section-wrapper {
      overflow: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }

    .section {
      height: auto;
      overflow: initial;
    }

    .scroll-wrapper {
      height: auto;
      overflow: initial !important;
      mask-image: none !important;
      scrollbar-width: 0;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
</style>
