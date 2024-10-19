<script setup lang="ts">
import { useConfig } from '@/hooks/use-config'
import { useLang } from '@/hooks/use-lang'
import {
	Button,
	MODAL,
	openFilePicker,
	useModal,
	useSnackbar,
	useToast,
} from '@vue-material/core'
import { computed, defineAsyncComponent, h, provide } from 'vue'
import loadLyrics from './app/loadLyrics.vue'
import Settings from './app/settings.vue'

const modals = useModal()
const snackbar = useSnackbar()
const toast = useToast()

const lang = useLang('en')
const config = useConfig()

const player = window.app.player
const lyrics = window.app.lyric

function download() {
	modals.open({
		icon: 'material-symbols:download',
		title: lang.get('DOWNLOAD'),
		content: defineAsyncComponent(() => import('./app/download.vue')),
		actions: [
			{
				label: lang.get('CANCEL') ?? 'Cancel',
				onClick: ({ close }) => close(),
			},
			{
				label: lang.get('DOWNLOAD') ?? 'Download',
				disabled: true,
				onClick: () => {},
			},
		],
	})
}

async function changelog() {
	modals.open('changelog', {
		icon: 'material-symbols:book-2-outline',
		title: lang.get('CHANGELOG'),
		content: defineAsyncComponent(() => import('./app/changelogs.vue')),
		actions: MODAL.PRESET_ACTION_CLOSE(),
		subAction: h(Button, {
			label: lang.get('DO_NOT_SHOW_AGAIN') ?? 'Do not show again',
			onclick: () => {
				config.showChangeLog = false
				modals.close('changelog')
			},
		}),
	})
}

function useAudioLRC() {
	const lyric = (player.metadata?.common.lyrics?.join('\n') || '').trim()

	if (!lyric) return

	modals.open('use-audio-lrc', {
		icon: 'material-symbols:queue-music',
		title: 'Lyrics found',
		content: loadLyrics,
		actions: [
			{
				label: lang.get('NO') ?? 'No',
				onClick: ({ close }) => {
					close()
				},
			},
			{
				label: lang.get('YES') ?? 'Yes',
				onClick: ({ close }) => {
					lyrics.parse(lyric)
					close()
				},
			},
		],
	})
}

function useQueryLRC(lrc: string) {
	modals.open('use-query-lrc', {
		icon: 'material-symbols:queue-music',
		title: 'Lyrics found',
		content: h(loadLyrics, { lrc }),
		actions: [
			{
				label: lang.get('NO') ?? 'No',
				onClick: ({ close }) => {
					close()
				},
			},
			{
				label: lang.get('YES') ?? 'Yes',
				onClick: ({ close }) => {
					lyrics.parse(lrc)
					close()
				},
			},
		],
	})
}

function openLRCPicker() {
	openFilePicker(
		async (file) => {
			if (file && (file.type === 'text/plain' || file.name.endsWith('.lrc'))) {
				const lrc = await file.text()
				lyrics.parse(lrc)
			}
		},
		{
			accept: '.lrc',
		},
	)
}

function uploadNewLrc() {
	const warn = config.preferences.showLrcWarn

	if (!warn || lyrics.length === 0) {
		openLRCPicker()
		return
	}

	modals.open('upload_new_lrc_old_not_empty', {
		icon: 'material-symbols:lyrics-outline',
		title: 'Upload LRC file?',
		content: 'Old lyrics will be overwritten',
		actions: [
			{
				label: lang.get('CANCEL') ?? 'Cancel',
				onClick: ({ close }) => close(),
			},
			{
				label: lang.get('OK') ?? 'OK',
				onClick: ({ close }) => {
					openLRCPicker()
					close()
				},
			},
		],
		subAction: h(Button, {
			label: lang.get('DO_NOT_SHOW_AGAIN'),
			onClick: () => {
				openLRCPicker()
				config.preferences.showLrcWarn = false
				modals.close('upload_new_lrc_old_not_empty')
			},
		}),
	})
}

function showKeyBinds() {
	modals.open('key_binds', {
		icon: 'material-symbols:keyboard-outline',
		title: 'Key Binds',
		content: defineAsyncComponent(() => import('../keybinds/guide.vue')),
		actions: MODAL.PRESET_ACTION_CLOSE(lang.get('OK') ?? 'OK'),
	})
}

function openSettings() {
	modals.open('settings', {
		title: 'Settings',
		content: Settings,
		actions: MODAL.PRESET_ACTION_CLOSE('Save'),
		fullScreen: true,
		focusLock: true,
	})
}

const overlays = {
	download,
	changelog,
	useAudioLRC,
	useQueryLRC,
	uploadNewLrc,
	showKeyBinds,
	openSettings,
}

defineExpose({ ...overlays })
provide('app-overlays', overlays)
</script>

<template>
  <slot/>
</template>