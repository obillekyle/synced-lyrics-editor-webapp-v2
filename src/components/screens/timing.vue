<script setup lang="ts">
import type { LRCLine, LRCTags } from '@/api/parser'

import { useSession } from '@/hooks/use-session'
import {
	$,
	IconButton,
	clamp,
	customRef,
	hasFormFocused,
	targetsSelf,
} from '@vue-material/core'
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { getKeybinds, keyHandlers, processKey } from '../keybinds/keys'

import animatedScroll from 'animated-scroll-to'
import SortScreen from './sort-screen.vue'

const Lyrics = window.app.lyric
const Player = window.app.player
const Keybinds = getKeybinds()

const editor = reactive({
	focus: -1,
	editing: false,
})

const [focused, setFocusedRef] = customRef<HTMLElement>()
const lines = ref<LRCLine[]>([])
const tags = ref<LRCTags>({})

const toggleEdit: (value?: boolean) => void = (value) => {
	editor.editing = value ?? !editor.editing
}

const session = useSession()
const timingPane = ref<HTMLElement>()

const setFocus = (value: number) => {
	if (editor.focus === value) return

	const focused = timingPane.value?.children[value]
	editor.editing = false

	if (!focused) {
		editor.focus = value >= lines.value.length ? -1 : value
		return
	}

	editor.focus = value
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const main = $('.md-theme-provider')!

	const rect = main.getBoundingClientRect()
	const halfElement = focused.clientHeight / 2
	const offset = rect.height / 2 - halfElement

	animatedScroll(focused, {
		speed: 400,
		verticalOffset: offset * -1,
		elementToScroll: main,
		cancelOnUserAction: true,
	})
}

const setTimeFromMusicCurrent = (e?: MouseEvent) => {
	const index = editor.focus

	if (index === -1) return
	if (!lines.value[index]) return
	if (!Player.ready) return

	const newIndex = index + 1 === lines.value.length ? index : index + 1
	const currentTime = Player.currentTime * 1000

	e?.stopPropagation?.()
	setFocus(newIndex)

	if (lines.value[newIndex].time !== currentTime) {
		Lyrics.updateLine(index, { time: currentTime })
	}
}

const adjustTime = (value: number) => {
	const index = editor.focus
	const lrcLine = lines.value[index]

	if (index === -1) return
	if (!lrcLine) return

	const time = lrcLine.time + value

	if (!Player.instance.paused) {
		Player.currentTime = clamp(time / 1000, 0, Player.instance.duration)
	}

	Lyrics.updateLine(index, {
		time: time < 0 ? 0 : time,
	})
}

function saveValue(index: number) {
	const element = $<HTMLInputElement>('data')
	const value = element?.value ?? ''
	toggleEdit()

	Lyrics.updateLine(index, {
		data: value.replace(/\n/g, ''),
		type: 'single',
	})
}

function handleKeyDown(e: KeyboardEvent) {
	const index = editor.focus
	const lyrics = lines.value

	if (e.ctrlKey || e.metaKey || hasFormFocused()) return
	document.activeElement instanceof HTMLElement && document.activeElement.blur()

	processKey(Keybinds.timing.adjustTimeBackward, e, () => {
		adjustTime(-100)
	})
	processKey(Keybinds.timing.adjustTimeForward, e, () => {
		adjustTime(100)
	})

	processKey(Keybinds.timing.arrowDownFocus, e, () => {
		setFocus(index + 1 >= lyrics.length ? index : index + 1)
	})
	processKey(Keybinds.timing.arrowUpFocus, e, () => {
		setFocus(index === 0 ? 0 : (index < 0 ? lyrics.length : index) - 1)
	})
}

function addNewLineFromFocus(reverse = false) {
	const index = editor.focus
	const newItem = Lyrics.EMPTYLINE
	Lyrics.addLine(newItem, reverse ? index - 1 : index)
}

function handleKeyUp(e: KeyboardEvent) {
	const index = editor.focus

	if (e.ctrlKey) return
	if (editor.editing) {
		switch (e.key) {
			case 'Enter':
				$('#app')?.focus()
				saveValue(index)
				break
		}
		return
	}

	if (index === -1) {
		processKey(Keybinds.timing.addNewLine, e, keyHandlers.timing.addNewLine)
		processKey(Keybinds.timing.deleteLine, e, keyHandlers.timing.deleteLine)
		return
	}

	processKey(Keybinds.timing.setLineTiming, e, () => {
		setTimeFromMusicCurrent()
		!Player.instance.paused && setFocus(index + 1)
	})

	processKey(Keybinds.timing.toggleEditMode, e, () => toggleEdit())
	processKey(Keybinds.timing.deleteLine, e, () => Lyrics.removeLine(index))
	processKey(Keybinds.timing.unfocusLine, e, () => setFocus(-1))
	processKey(Keybinds.timing.addNewLine, e, () => addNewLineFromFocus())
	processKey(Keybinds.timing.addNewLineReverse, e, () =>
		addNewLineFromFocus(true),
	)
}

watch(
	focused,
	(element) => {
		if (!element) return

		const textbox = $<HTMLInputElement>('.data', element)

		if (textbox?.value) {
			textbox.focus()
			textbox.setSelectionRange(textbox.value.length, textbox.value.length)
		}
	},
	{ flush: 'post' },
)

function handleLyricsParse() {
	lines.value = Lyrics.lines
	tags.value = Lyrics.tags
}

onMounted(() => {
	handleLyricsParse()

	Lyrics.addEventListener('parsed', handleLyricsParse)
	Lyrics.addEventListener('line-added', handleLyricsParse)
	Lyrics.addEventListener('line-removed', handleLyricsParse)
	Lyrics.addEventListener('line-updated', handleLyricsParse)

	window.addEventListener('keydown', handleKeyDown)
	window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
	Lyrics.removeEventListener('parsed', handleLyricsParse)
	Lyrics.removeEventListener('line-added', handleLyricsParse)
	Lyrics.removeEventListener('line-removed', handleLyricsParse)
	Lyrics.removeEventListener('line-updated', handleLyricsParse)

	window.removeEventListener('keydown', handleKeyDown)
	window.removeEventListener('keyup', handleKeyUp)
})
</script>

<template>
  <div class="timing-screen-drag" v-if="session.timing.sorting">
    <SortScreen />
  </div>

  <div
    @click=" !lines.length && Lyrics.addLine(Lyrics.EMPTYLINE)"
    class="timing-screen"
    ref="timingPane"
    v-else
  >
    
    <div
      :key="id"
      :class="{
        'lrc-line': true,
        active: editor.focus === index,
        edit: editor.editing,
      }"
      :ref="(el, refs) => editor.focus === index && setFocusedRef(el, refs)"
      @click="targetsSelf($event, () => setFocus(index))"
      v-for="({ id, time, data }, index) in lines"
    >
      <div class="time" @click="() => (Player.currentTime = time / 1000)">
        {{ Lyrics.timeToString(time) }}
      </div>
      <div v-if="editor.focus === index" class="add-line-buttons">
        <IconButton
          icon="mdi:table-row-plus-before"
          title="Add new line before"
          @click="() => addNewLineFromFocus(true)"
        />
        <IconButton
          icon="mdi:table-row-plus-after"
          title="Add new line after"
          @click="() => addNewLineFromFocus()"
        />
      </div>

      <textarea
        class="data"
        v-if="editor.focus === index && editor.editing"
        :defaultValue=" typeof data == 'string' ? data : data.join('')"
      />

      <div class="data" v-else @dblclick="() => toggleEdit()">
        <template v-if="typeof data == 'string'">
          {{ data }}
        </template>
        <div :key="index" v-else v-for="({ line }, index) in data">
          {{ line }}
        </div>
      </div>

      <div class="timing-buttons" v-if="editor.focus == index">
        <IconButton
          @click="Player.currentTime = clamp(0, time / 1000, Player.instance.duration)"
          :disabled="!Player.ready"
          title="Player current time"
          icon="material-symbols:play-arrow-outline"
        />
        <IconButton
          @click="setTimeFromMusicCurrent"
          :disabled="!Player.ready"
          title="Player current time"
          icon="material-symbols:hourglass-empty"
        />
        <IconButton
          @click="adjustTime(-100)"
          title="-100ms"
          icon="material-symbols:fast-rewind"
        />
        <IconButton
          @click="adjustTime(100)"
          title="+100ms"
          icon="material-symbols:fast-forward"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .timing-screen-drag {
    width: 100%;
    height: 100%;
    padding-inline: var(--md);
    margin-inline: auto;
    position: relative;
    max-width: 768px;
    .list:empty::after {
      content: 'There are no lines';
      text-align: center;
      display: block;
      padding-block: var(--md);
      font-size: var(--font-xl);
      color: var(--mono-70);
    }

    .guide {
      top: 0;
      z-index: 10;
      position: sticky;
      background: var(--background-body);
      text-align: center;
      padding: var(--xl);
    }
  }

  .timing-screen {
    padding-block: calc((85dvh - 112px) / 2);
    max-width: 768px;
    width: 100%;
    padding-inline: var(--md);
    margin-inline: auto;
    position: relative;

    &:empty::after {
      content: "Click or Press 'Insert' to add a new line";
      text-align: center;
      cursor: pointer;
      display: block;
      font-size: var(--font-xl);
      color: var(--primary-50);
    }

    .lrc-line {
      user-select: none;
      display: grid;
      position: relative;
      grid-template-areas:
        'time data'
        'time data';
      grid-template-columns: 56px 1fr auto;
      grid-template-rows: 24px auto;
      height: 112px;
      overflow: hidden;

      align-content: center;

      column-gap: var(--sm);
      padding-inline: var(--sm);

      background: var(--background-body);
      box-shadow: 0 2px 12px var(--background-body);
      animation: fade-in 0.2s forwards;

      @keyframes fade-in {
        from {
          transform: translateX(-100px);
          opacity: 0;
        }

        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      > * {
        pointer-events: none;
      }

      &::before {
        position: absolute;
        content: '';
        inset: 0;
        z-index: -1;
        background-color: transparent;
        transition: background-color 0.2s;
      }

      .add-line-buttons {
        width: 56px;
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-area: add-line;
        justify-content: center;
        cursor: pointer;
      }

      .time {
        font-size: var(--font-sm);
        align-self: center;
        color: var(--primary-80);
      }

      .timing-buttons {
        grid-area: timing;
        display: grid;
        place-items: center;
        grid-template-areas:
          'ppp set'
          'rrr fff';

        :nth-child(1) {
          grid-area: ppp;
          align-self: self-start;
        }
        :nth-child(2) {
          grid-area: set;
          align-self: self-start;
        }
        :nth-child(3) {
          grid-area: rrr;
          align-self: self-end;
        }
        :nth-child(4) {
          grid-area: fff;
          align-self: self-start;
        }
      }

      &:is(:first-child):is(:last-child) {
        border-radius: var(--sm);
        border: 1px solid var(--primary-80-10) !important;
      }

      &:not(.active) + .lrc-line {
        border-top: 1px solid var(--primary-80-10);
      }

      textarea.data {
        word-break: break-word;
        white-space: none;
        resize: none;
        font: inherit;
        font-size: var(--font-xl);
      }

      .data {
        font-size: var(--font-xl);

        width: clamp(200px, 100%, 100%);
        white-space: pre-wrap;
        text-wrap: balance;
        border: none;

        grid-area: data;
        &:empty::after {
          content: '<Empty>';
          color: var(--primary-80-40);
        }
      }

      &:is(:first-child:last-child) {
        border: 1px solid var(--color-10);
      }

      &.active {
        border-radius: var(--sm);
        grid-template-areas:
          'add-line time timing'
          'add-line data timing';
        position: sticky;
        z-index: 1;
        top: var(--sm);

        > * {
          pointer-events: initial;
        }

        &::before {
          background-color: var(--primary-90-10);
          transition: none;
        }

        .data {
          height: 72px;
          overflow: auto;
          outline: none;
          align-self: self-start;
          border-radius: calc(var(--sm) / 2);
          &:focus-visible {
            box-shadow: 0 0 0 2px var(--primary-60-20);
          }
        }
      }

      &.inactive {
        .data {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
  }

  @media screen and (max-width: 768px) {
    .timing-screen {
      padding-inline: var(--sm);
    }
  }
</style>
