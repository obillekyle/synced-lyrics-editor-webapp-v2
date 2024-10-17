import { toProxy } from '@vue-material/core'
import { useShared } from './use-shared'

type Config = {
	version: number
	preferences: {
		showLrcWarn: boolean
		showKeyBinds: boolean
		theme: 'light' | 'dark'
		useMonaco: boolean
		colorScheme: {
			primary?: string
			secondary?: string
			tertiary?: string
		}
		lang: string
	}
	navigation: {
		showHome: boolean
		centered: boolean
		showLabels: boolean
	}
	debug: boolean
	lastVersion?: string
	showChangeLog: boolean
	showBuildType: boolean
}

const defaultConfig: Config = {
	version: 1,
	preferences: {
		useMonaco: false,
		showLrcWarn: true,
		showKeyBinds: true,
		theme: 'light',
		colorScheme: {},
		lang: 'en',
	},
	navigation: {
		showHome: true,
		centered: true,
		showLabels: true,
	},
	debug: false,
	lastVersion: undefined,
	showChangeLog: false,
	showBuildType: false,
}

export const useConfig = () => toProxy(useShared('app-config', defaultConfig))
