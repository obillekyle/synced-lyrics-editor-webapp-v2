<script setup lang="ts">
import type { ModalProps } from '@vue-material/core'
import type { UtilityFunction } from '@vue-material/core/utils/component-manager'

import { Chip, Flex, TextInput, useToast } from '@vue-material/core'
import { ComponentManager } from '@vue-material/core/utils/component-manager'
import { inject, reactive, ref, watch } from 'vue'
import { useLang } from '@/hooks/use-lang'
import I18nString from '@/components/i18n-string.vue'

const Player = window.app.player
const lyrics = window.app.lyric
const options = reactive({
	mode: 0,
	presets: [true, true, true],
})

const fileName = ref(getPreset(options.presets))

const toast = useToast()
const lang = useLang('en')

const utils = inject(
	'modal-utils',
	ref<UtilityFunction<ModalProps>>(ComponentManager.DEFAULT_UTILITY),
)

function download() {
	const lrc = lyrics.stringify()
	const blob = new Blob([lrc], { type: 'text/plain' })

	const linkElem = document.createElement('a')
	linkElem.href = URL.createObjectURL(blob)
	linkElem.download = fileName.value
	linkElem.click()

	toast.open({
		message: lang.get('DOWNLOADING') ?? 'Downloading...',
	})

	setTimeout(() => URL.revokeObjectURL(linkElem.href), 6000)
	utils.value.close()
}

function getPreset(preset: boolean[]) {
	const details = Player.details

	let text = ''
	const [artist, title, ext] = preset
	text += artist ? details.artist || '' : ''
	text += artist && title ? ' - ' : ''
	text += title ? details.title || '' : ''
	text += ext ? '.lrc' : ''

	return text
}

function togglePreset(index: number, value?: boolean) {
	if (options.mode === 1) {
		const details = Player.details

		switch (index) {
			case 0:
				fileName.value += details.artist || ''
				break
			case 1:
				fileName.value += details.title || ''
				break
			case 2:
				fileName.value += '.lrc'
				break
		}
		return
	}

	options.presets[index] = value !== undefined ? value : !options.presets[index]
}

watch(
	options,
	({ mode, presets }) => {
		if (mode === 0) {
			fileName.value = getPreset(presets)
			return
		}
	},
	{ immediate: true },
)

watch(fileName, () => {
	if (fileName.value) {
		utils.value.modify((modal) => {
			modal.actions ??= []
			modal.actions[1].disabled = false
			modal.actions[1].onClick = download

			return modal
		})

		return
	}

	utils.value.modify((modal) => {
		modal.actions ??= []
		modal.actions[1].disabled = true
		modal.actions[1].label = 'HEHEHEHEHE'

		return modal
	})
})
</script>

<template>
	<Flex direction="column" gap="#xxs">
		<Chip.Group>
			<I18nString
				:as="Chip"
				entry="PRESETS"
				@click="options.mode = 0"
				:variant="options.mode === 0 ? 'filled' : 'outlined'"
			/>
			<I18nString
				:as="Chip"
				entry="BUILDER"
				@click="options.mode = 1"
				:variant="options.mode === 1 ? 'filled' : 'outlined'"
			/>
		</Chip.Group>

		<Chip.Group>
			<I18nString
				:as="Chip"
				:variant="options.presets[0] ? 'filled' : 'outlined'"
				@click="togglePreset(0)"
				entry="PLAYER_ARTIST"
			/>

			<I18nString
				:as="Chip"
				:variant="options.presets[1] ? 'filled' : 'outlined'"
				@click="togglePreset(1)"
				entry="PLAYER_AUDIO_TITLE"
			/>

			<Chip
				:variant="options.presets[2] ? 'filled' : 'outlined'"
				@click="togglePreset(2)"
				>
				.lrc
			</Chip>
		</Chip.Group>

		<TextInput
			span
			id="fileName"
			type="text"
			v-model="fileName"
			placeholder="File Name"
			:disabled="!options.mode"
		/>
	</Flex>
</template>
