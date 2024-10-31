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

import type { FrameVariants } from '@vue-material/core/Frame/variants.js'
import { useModal } from '@vue-material/core/Modal'
import { openFilePicker } from '@vue-material/core/utils/dom'
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

const inputColor = ref<HTMLInputElement>()
const modal = useModal()

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
	frame: 'none' as 'none' | FrameVariants,
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

async function uploadImage() {
	const file = await openFilePickerAsync({ accept: 'image/*' })

	if (!file) return
	URL.revokeObjectURL(image.data)
	image.data = URL.createObjectURL(file)
}

function changeImageFile() {
	openFilePicker((file) => {
		if (!file || file.size === 0) {
			return modal.open('file-picker', {
				icon: 'material-symbols:image-not-supported-outline',
				title: 'No file selected',
				content: 'Please select an image file.',
			})
		}

		URL.revokeObjectURL(image.data)
		image.data = URL.createObjectURL(file)
	})
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

watch(image, getColor, { immediate: true })

const tab = ref(0)
const root = ref<HTMLElement>()

useTooltip(root, 't')

const tabs = [
	{
		label: 'Lyrics',
		value: 0,
	},
	{
		label: 'Image',
		value: 1,
	},
	{
		label: 'Box',
		value: 2,
	},
	{
		label: 'Fonts',
		value: 3,
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

        <!-- Lyrics -->
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
              @click="lyrics.line = undefined"
              variant="outlined"
              right-icon="material-symbols:close"
              left-icon="material-symbols:queue-music"
              placeholder="Lyrics | Click to remove"
              value="getLRCLineValue(lyrics.line) || '<Empty>'"
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
            v-if="lyrics.line"
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

            <Switch v-model="lyrics.effect"/>
          </div>
        </div>


        <!-- Image -->
        <div class="card-editor-sidebar-category">
          <Divider label="Image Data"/>
          
          <div class="card-editor-sidebar-group">
            <TextInput
              span
              disabled
              variant="outlined"
              left-icon="material-symbols:image-outline"
              placeholder="Image"
              right-icon="material-symbols:upload"
              :value="image.data"
              @click="changeImageFile"
            />
            <Button.Group span>
              <Button
                variant="outlined"
                label="Use Editor Image"
                @click="useEditorMeta"
              />
              <Button
                variant="outlined"
                label="Remove Image"
                @click="image.data = ''"
              />
            </Button.Group>
          </div>

          <Divider label="Image Settings"/>
          
          <div class="card-editor-sidebar-entry">
            <Button.Icon t="Size" icon="material-symbols:photo-size-select-large-sharp"/>
            <Slider :values="imgSizes" v-model="image.width" size="#xxl"/>
          </div>

          <div class="card-editor-sidebar-entry">
            <Button.Icon t="Radius" icon="mdi:rounded-corner"/>
            <Slider v-model="image.radius" size="#xxl"/>
          </div>

          <div class="card-editor-sidebar-group">
            <Select
              required
              placeholder="Select a frame"
              :value="[image.frame]"
              :items="['none', 'circle', 'clover', 'flower', 'hexagon']"
              @change="([v]: any) => (image.frame = v)"
              v-slot="{ value }: any"
            >
              <Box.Flex px="#xs" gap="#sm" align="center">
                <SquareImage
                  :frame="value"
                  :src="image.data || '/assets/gemini-generated-image.jpg'"
                  :alt="audioInfo.title"
                  :size="48"
                />
                
                <span>{{ value[0].toUpperCase() + value.slice(1) }}</span>
              </Box.Flex>
            </Select>
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

          <div 
            @pointerdown="rippleEffect"
            @click="inputColor?.click()"
            class="card-editor-sidebar-entry clickable"
          >
            <div class="card-editor-sidebar-entry-info">
              <div class="card-editor-sidebar-entry-label">Color</div>
              <Scroller class="card-editor-sidebar-entry-description">
                Color Theme
              </Scroller>
            </div>
            <input
              type="color"
              ref="inputColor"
              v-model="box.color"
            />
          </div>
            
          <Box.Flex gap="#xxs" my="#sm" wrap="wrap" class="card-editor-sidebar-group">
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
              size="#xxl"
              v-model="font.weight" 
              :values="[100, 200, 300, 400, 500, 600, 700, 800, 900]"
            />
          </div>

          <Divider label="Alignment" />
          <div class="card-editor-sidebar-group">
            <Button.Group span>
              <Button
                label="Left"
                left-icon="mdi:format-align-left"
                :variant="lyrics.align === 'left' ? 'filled' : 'outlined'"
                @click="lyrics.align = 'left'"
              />
              <Button
                label="Center"
                left-icon="mdi:format-align-center"
                :variant="lyrics.align === 'center' ? 'filled' : 'outlined'"
                @click="lyrics.align = 'center'"
              />
              <Button
                label="Right"
                left-icon="mdi:format-align-right"
                :variant="lyrics.align === 'right' ? 'filled' : 'outlined'"
                @click="lyrics.align = 'right'"
              />
            </Button.Group>
          
            <Select 
              required
              :items="fonts" 
              v-slot="{ label, value }"
              :value="[font.family]"
              @change="(([v]:any) => font.family = v)" 
            >
              <FontSelect :label :value />
            </Select>
          </div>
        </div>
      </div>
    </ScrollContainer>

    <ThemeProvider class="card-editor-preview"
      inherit
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
      <div class="lyric-card">
        <Box.Flex class="lyric-card-header" gap="#md" align="center">
          <SquareImage
            :r="image.radius"
            :frame="image.frame"
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
          <div class="lyric-card-line primary" v-if="lyricText">{{ lyricText }}</div>
          <div class="lyric-card-line" v-if="lyrics.line !== undefined && lyrics.effect">
            {{ getNextLine() }}
          </div>
        </div>
      </div>
    </ThemeProvider>
  </div>
</template>

<style lang="scss">
  .card-editor {
    inset: 0;
    display: grid;
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
        width: min(400px, 100%);
      }
      
      &-category {
        min-width: 100%;
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
           grid-template-columns: 1fr auto;
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
      background:
        var(--surface-bright) 
        radial-gradient(var(--outline-variant) 1px, transparent 0);
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
        padding-block: var(--md);

        &:empty {
          display: none;
        }
      }

      &-line {
        color: var(--primary);
      }
    }
  }
</style>