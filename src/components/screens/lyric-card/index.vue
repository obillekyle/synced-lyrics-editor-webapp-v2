<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

import {
	Box,
	Button,
	CircularProgress,
	Divider,
	IconButton,
	ImagePalette,
	ScrollContainer,
	Scroller,
	Select,
	Slider,
	SquareImage,
	Switch,
	TabSwitcher,
	TextInput,
	ThemeProvider,
	WavyDivider,
	as,
	fastAvgColor,
	openFilePickerAsync,
	rippleEffect,
	useTheme,
	useTooltip,
} from '@vue-material/core'

import type { LRCLine } from '@/api/parser2'
import {} from '@vue-material/core/utils/other'
import type { ObjectValue } from '@vue-material/core/utils/other/to-object-value.js'
import h2c from 'html2canvas-pro'
import FontSelect from '../font-select.vue'
import Palette from './palette.vue'

const audioInfo = reactive({
	title: 'Hold my hand',
	artist: 'Random Artist',
	currentTime: 0,
	duration: 0,
})

const lyrics = reactive({
	line: undefined as string | undefined,
	text: '',
	effect: false,
	align: 'left',
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
	theme: undefined as 'light' | 'dark' | undefined,
})

const themeObject = useTheme()

const theme = computed(() => {
	return box.theme || themeObject.theme
})

const topColors = ref<string[]>([])
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

function getLRCLineValue(id: string) {
	const line = Lyrics.lines[id]
	if (!line) return
	return line.data
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

const lrcLines = computed(() => {
	const raw = Lyrics.getRaw().lines
	const lines: ObjectValue[] = []

	for (const [key, line] of Object.entries(raw)) {
		lines.push({ label: line.data, value: key })
	}

	return lines
})

function getLrcLineString(index: number) {
	const line = Lyrics.lines[index]
	return line?.data || ''
}

const getPreviousLine = () => {
	if (lyrics.line === undefined) return

	const index = Lyrics.getIndexFromId(lyrics.line) - 1
	const prevId = Lyrics.getIdFromIndex(index)

	if (prevId === undefined) return

	return getLRCLineValue(prevId)
}

const getNextLine = () => {
	if (lyrics.line === undefined) return

	const index = Lyrics.getIndexFromId(lyrics.line) + 1
	const nextId = Lyrics.getIdFromIndex(index)

	if (nextId === undefined) return

	return getLRCLineValue(nextId)
}

const lyricText = computed(() => {
	const id = lyrics.line
	return id !== undefined
		? (Lyrics.lines[id]?.data ?? lyrics.text)
		: lyrics.text
})

const imageStyles: ObjectValue[] = [
	{ value: 'none', label: 'Rounded' },
	{ value: 'circle', label: 'Wavy Circle' },
	{ value: 'clover', label: 'Clover' },
]

const fonts = ['Roboto Flex', 'JetBrains Mono', 'Arial', 'Times New Roman']

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
	const palette = await ImagePalette.from(image.data)
	topColors.value = palette.top(10)
	box.color = palette.dominant
}

watch(image, getColor)

onMounted(() => {
	getColor()
})

const tab = ref(0)
const root = ref<HTMLElement>()

useTooltip(root, 't')

const tabs = [
	{
		label: 'Lyrics',
		value: 0,
	},
	{
		label: 'Box',
		value: 1,
	},
	{
		label: 'Fonts',
		value: 2,
	},
]
</script>

<template>
  <div class="card-editor" ref="root">
    <ScrollContainer class="card-editor-sidebar">
      <template #header>
        <TabSwitcher :items="tabs" v-model="tab" />
      </template>

      <div class="card-editor-sidebar-categories" :style="{
        '--offset': -tab * 100 + '%',
      }">
        <div class="card-editor-sidebar-category">
          <Divider label="Audio Info" />

          <div class="card-editor-sidebar-group">
            <TextInput
              span
              variant="outlined"
              left-icon="material-symbols:sound-sensing"
              v-model="audioInfo.title"
              placeholder="Title"
              mx="#sm"
            />
            <TextInput
              span
              variant="outlined"
              left-icon="material-symbols:account-box-outline"
              v-model="audioInfo.artist"
              placeholder="Artist"
              mx="#sm"
            />
          </div>

          <Divider label="Lyrics" />

          <div class="card-editor-sidebar-group">
            <Select
              :items="lrcLines"
              placeholder="Choose from editor"
              @change="([v]: any) => (lyrics.line = v)"
            />

            <TextInput
              v-if="lyrics.line"
              :placeholder="getLRCLineValue(lyrics.line) || '<Empty>'"
              @click="lyrics.line = undefined"
              variant="outlined"
              right-icon="material-symbols:close"
              left-icon="material-symbols:queue-music"
              disabled
              span
            />

            <TextInput
              v-else
              variant="outlined"
              v-model="lyrics.text"
              left-icon="material-symbols:queue-music"
              placeholder="Lyrics"
              span
            />
          </div>
          <div 
            class="card-editor-sidebar-entry clickable" 
            @pointerdown="rippleEffect" 
            @click="lyrics.effect = !lyrics.effect"
          >
            <div class="card-editor-sidebar-entry-info">
              <div class="card-editor-sidebar-entry-label">Lyrics Effect</div>
              <Scroller class="card-editor-sidebar-entry-description">
                Use previous and next lines from the editor
              </Scroller>
            </div>

            <Switch v-model="lyrics.effect" />
          </div>
        </div>

        <div class="card-editor-sidebar-category">
          <Divider label="Offsets" />

          <div class="card-editor-sidebar-entry">
            <Button.Icon t="Radius" icon="mdi:rounded-corner"/>
            <Slider v-model="box.radius"  size="#xxl"/>
          </div>

          <div class="card-editor-sidebar-entry">
            <Button.Icon t="Padding" icon="material-symbols:padding-outline"/>
            <Slider v-model="box.padding" size="#xxl"/>
          </div>

          <Divider label="Theme" />
          <Box.Flex gap="#xxs" wrap="wrap" class="card-editor-sidebar-group">
            <Palette 
              :key="color" :color
              v-for="color of topColors" 
              :selected="box.color === color" 
              @click="box.color = color"
            />
          </Box.Flex>
        </div>

        <div class="card-editor-sidebar-category">
          <Divider label="Sizes" />

          <div class="card-editor-sidebar-entry">
            <Button.Icon t="Size" icon="material-symbols:text-fields"/>
            <Slider v-model="box.radius"  size="#xxl"/>
          </div>

          <div class="card-editor-sidebar-entry">
            <Button.Icon t="Weight" icon="material-symbols:weight-outline"/>
            <Slider 
              v-model="font.weight" 
              :values="[100, 200, 300, 400, 500, 600, 700, 800, 900]"
              size="#xxl"
            />
          </div>

          <Divider label="Alignment" />
          <div class="card-editor-sidebar-group">
            <Button.Group span>
              <Button
                left-icon="mdi:format-align-left"
                label="Left"
                :variant="lyrics.align === 'left' ? 'filled' : 'outlined'"
                @click="lyrics.align = 'left'"
              />
              <Button
                left-icon="mdi:format-align-center"
                label="Center"
                :variant="lyrics.align === 'center' ? 'filled' : 'outlined'"
                @click="lyrics.align = 'center'"
              />
              <Button
                left-icon="mdi:format-align-right"
                label="Right"
                :variant="lyrics.align === 'right' ? 'filled' : 'outlined'"
                @click="lyrics.align = 'right'"
              />
            </Button.Group>
          
            <Select 
              required
              :items="fonts" 
              v-slot="{ value }"
              @change="(([v]:any) => font.family = v)" 
            >
              <FontSelect :label="value" :value />
            </Select>
          </div>

        </div>
      </div>
    </ScrollContainer>

    <div class="card-editor-preview">
      <ThemeProvider 
        inherit
        class="lyric-card" 
        :options="{ colors: box.color || '#ffffff' }" 
        :styled="{
          $radius: box.radius,
          $padding: box.padding,
          $fontWeight: 'raw:' + font.weight,
          $fontSize: font.size,
          $fontFamily: font.family,
          $align: lyrics.align,
          $balance: lyrics.balance ? 'balance' : undefined,
        }"
      >
        <Box.Flex class="lyric-card-header" gap="#md" align="center">
          <SquareImage
            :src="image.data || '/assets/gemini-generated-image.jpg'"
            :alt="audioInfo.title"
            :size="image.width"
          />
          <div class="lyric-card-info">
            <div class="lyric-card-title">{{ audioInfo.title }}</div>
            <div class="lyric-card-artist">{{ audioInfo.artist }}</div>
          </div>
        </Box.Flex> 

        <div class="lyric-card-lines">
          <div class="lyric-card-line" v-if="lyrics.line !== undefined && lyrics.effect">
            {{ getPreviousLine() }}
          </div>
          <div class="lyric-card-line primary">{{ lyricText }}</div>
          <div class="lyric-card-line" v-if="lyrics.line !== undefined && lyrics.effect">
            {{ getNextLine() }}
          </div>
        </div>
      </ThemeProvider>
    </div>
  </div>
</template>

<style lang="scss">
  .card-editor {
    display: grid;
    inset: 0 0 0 0;
    position: absolute;
    grid-template-columns: 400px 1fr;

    &-sidebar {
      --surface: var(--surface-container-low);
      overflow-x: hidden;
      
      height: 100%;
      background: var(--surface);
      border-right: 1px solid var(--outline-variant);

      .md-scroll-wrapper {
        padding: 0;
      }
      
      &-categories {
        display: flex;
        contain: layout;
        width: 100%;
        
      }
      
      &-category {
        min-width: 400px;
        position: relative;
        height: 100%;
        transition: left 0.3s var(--timing-standard);
        left: var(--offset);

        .md-divider-label {
          padding-left: var(--sm);

          &::after {
            background: none;
          }
        }
      }

      &-entry {
        display: grid;
        align-items: center;
        gap: var(--sm);
        padding-inline: var(--sm);
        height: var(--component-xl);
        grid-template-columns: auto 1fr;

        &.clickable {
          position: relative;
          overflow: hidden;
        }

        &-description {
          color: var(--outline);
        }

        .md-switch {
          pointer-events: none
        }
      }

      &-group {
        padding-inline: var(--sm);

        .md-select {
          margin-block: var(--xs)
        }
      }
    }

    &-preview {
      background-image: radial-gradient(
        var(--surface-container-highest) 1px,
        transparent 0
      );
      background-size: var(--lg) var(--lg);
      background-position: 0 0;
      background-repeat: repeat;
      display: grid;
      place-items: center;
    }

    .lyric-card {
      width: min(400px, 100%);
      background: var(--surface);
      border-radius: var(--radius);
      padding: var(--padding);
      font-family: var(--font-family);
      box-shadow: var(--shadow-2);

      &-title {
        font-size: var(--font-xxl);
        font-weight: 500;
      }

      &-artist {
        font-size: var(--font-xl);
      }

      &-lines {
        font-size: var(--font-size);
        font-weight: var(--font-weight);
        text-align: var(--align);
        text-wrap: var(--balance); 
      }
    }
  }
</style>