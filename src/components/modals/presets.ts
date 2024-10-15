import { useConfig } from '@/hooks/use-config'
import { useLang } from '@/hooks/use-lang'
import {
	$,
	Button,
	MODAL,
	ModalManager,
	openFilePicker,
} from '@vue-material/core'
import { defineAsyncComponent, h } from 'vue'
import changelogScreen from './app/changelogScreen.vue'
import downloadScreen from './app/download.vue'
import loadLyrics from './app/loadLyrics.vue'
import Settings from './app/settings.vue'

function download() {
	const modals = ModalManager
	const lang = useLang('en')
	const player = window.app.player
	const lyrics = window.app.lyric

	modals.open({
		icon: 'material-symbols:download',
		title: lang.get('DOWNLOAD'),
		content: downloadScreen,
		actions: [
			{
				label: lang.get('CANCEL') ?? 'Cancel',
				onClick: ({ close }) => close(),
			},
			{
				label: lang.get('DOWNLOAD') ?? 'Download',
				onClick: ({ close }) => {
					const data = player.details
					data.artist = data.artist ? `${data.artist} " - "` : ''

					const defName = `${data.artist}${data.title}.lrc`
					const name = $<HTMLInputElement>('#fileName')?.value

					const lrc = lyrics.stringify()
					const blob = new Blob([lrc], { type: 'text/plain' })

					const linkElem = document.createElement('a')
					linkElem.href = URL.createObjectURL(blob)
					linkElem.download = name || defName
					linkElem.click()

					setTimeout(() => URL.revokeObjectURL(linkElem.href), 6000)

					close()
				},
			},
		],
	})
}

function changelog() {
	const modals = ModalManager
	const lang = useLang('en')
	const config = useConfig()

	fetch('./changelog.md').then(async (res) => {
		modals.open('changelog', {
			icon: 'material-symbols:book-2-outline',
			title: lang.get('CHANGELOG'),
			content: h(changelogScreen, { data: await res.text() }),
			actions: MODAL.PRESET_ACTION_CLOSE(),
			subAction: h(Button, {
				label: lang.get('DO_NOT_SHOW_AGAIN') ?? 'Do not show again',
				onclick: () => {
					config.showChangeLog = false
					modals.close('changelog')
				},
			}),
		})
	})
}

function useAudioLRC() {
	const player = window.app.player
	const lyrics = window.app.lyric
	const modals = ModalManager
	const lang = useLang('en')

	const lyric = player.metadata?.common.lyrics?.join('\n') || ''

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
	const lyrics = window.app.lyric
	const modals = ModalManager
	const lang = useLang('en')

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
				label: 'Yes',
				onClick: ({ close }) => {
					lyrics.parse(lrc)
					close()
				},
			},
		],
	})
}

function openLRCPicker() {
	const lyric = window.app.lyric

	openFilePicker(
		async (file) => {
			if (!file) return
			if (file.type === 'text/plain' || file.name.endsWith('.lrc')) {
				const lrc = await file.text()
				lyric.parse(lrc)
			}
		},
		{
			accept: '.lrc',
		},
	)
}

function uploadNewLrc() {
	const modals = ModalManager
	const config = useConfig()
	const lang = useLang('en')
	const lyrics = window.app.lyric

	const warn = config.preferences.showLrcWarn

	if (!warn || lyrics.lines.length === 0) {
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
	const modals = ModalManager
	const lang = useLang('en')

	modals.open('key_binds', {
		icon: 'material-symbols:keyboard-outline',
		title: 'Key Binds',
		content: defineAsyncComponent(() => import('../keybinds/guide.vue')),
		actions: MODAL.PRESET_ACTION_CLOSE(lang.get('OK') ?? 'OK'),
	})
}

function openSettings() {
	const modal = ModalManager
	modal.open('settings', {
		title: 'Settings',
		content: Settings,
		actions: MODAL.PRESET_ACTION_CLOSE('Save'),
		fullScreen: true,
		focusLock: true,
	})
}

export default {
	changelog,
	download,
	useAudioLRC,
	useQueryLRC,
	openLRCPicker,
	openSettings,
	uploadNewLrc,
	showKeyBinds,
}
