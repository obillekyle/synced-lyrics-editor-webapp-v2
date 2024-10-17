<script setup lang="ts">
import type { MaybeFunction, ModalProps } from '@vue-material/core'
import {
	ComponentManager,
	type UtilityFunction,
} from '@vue-material/core/utils/component-manager'

import { useConfig } from '@/hooks/use-config'
import { useLang } from '@/hooks/use-lang'
import { Icon } from '@iconify/vue'
import {
	$,
	Divider,
	IconButton,
	ScrollContainer,
	Switch,
	TextInput,
	evaluate,
	rippleEffect,
} from '@vue-material/core'
import { computed, h, inject, reactive, ref, watch } from 'vue'
import { useOverlays } from '../use-overlays'

import I18nString from '../../i18n-string.vue'

const lang = useLang('en')
const config = useConfig()
const overlays = useOverlays()

const options = reactive({
	sidebar: false,
	search: '',
	active: 'general',
})

const utils = inject(
	'modal-utils',
	ref<UtilityFunction<ModalProps>>(ComponentManager.DEFAULT_UTILITY),
)

type Stringish = MaybeFunction<string>
type Booleanish = MaybeFunction<boolean>

const langs: Record<string, string> = {
	en: 'English',
	zh: '简体中文',
	ja: '日本語',
	ko: '한국어',
	ph: 'Filipino',
	hi: 'हिंदी',
	id: 'Indonesian',
	ur: 'اردو',
}

type SettingEntry =
	| {
			type: 'switch'
			name: Stringish
			icon?: Stringish
			desc?: Stringish
			disabled?: Booleanish
			value: () => boolean | undefined
			onChange?: (value: boolean) => void
	  }
	| {
			type: 'info'
			name: Stringish
			icon?: Stringish
			desc?: Stringish
	  }
	| {
			type: 'divider'
			name?: Stringish
			sticky?: Booleanish
	  }
	| {
			type: 'button'
			name: Stringish
			icon?: Stringish
			desc?: Stringish
			disabled?: Booleanish
			onClick?: () => void
	  }

type SettingEntries = {
	[key: string]: {
		name: Stringish
		desc?: Stringish
		icon?: Stringish
		disabled?: Booleanish
		items: SettingEntry[]
	}
}
const entries = computed<SettingEntries>(() => {
	return {
		general: {
			name: 'SETTINGS_GENERAL',
			items: [
				{
					type: 'switch',
					name:
						config.preferences.theme === 'dark' ? 'Dark Mode' : 'Light Mode',
					icon:
						config.preferences.theme === 'dark'
							? 'material-symbols:dark-mode-outline'
							: 'material-symbols:light-mode-outline',
					desc: `Switch to ${config.preferences.theme === 'dark' ? 'light' : 'dark'} mode`,
					value: config.preferences.theme === 'dark',
					onChange: (v) => {
						config.preferences.theme = v ? 'dark' : 'light'
					},
				},
				{
					type: 'divider',
					name: 'Navigation',
				},
				{
					type: 'switch',
					name: 'Show Home Button',
					icon: 'material-symbols:home-outline',
					desc: 'Show the home button at the navigation',
					value: config.navigation.showHome,
					onChange: (v) => {
						config.navigation.showHome = v
					},
				},
				{
					type: 'switch',
					name: 'Center Navigation Buttons',
					icon: 'material-symbols:vertical-align-center',
					desc: 'Center the navigation buttons',
					value: config.navigation.centered,
					onChange: (v) => {
						config.navigation.centered = v
					},
				},
				{
					type: 'divider',
					name: 'Keyboard',
				},
				{
					type: 'switch',
					name: 'Show Keybind Guide',
					icon: 'material-symbols:keyboard-outline',
					desc: 'Show the dynamic keybind guide on the bottom left of the screen',
					value: config.preferences.showKeyBinds,
					onChange: (v) => {
						config.preferences.showKeyBinds = v
					},
				},
				{
					type: 'button',
					name: 'View Key Bindings',
					icon: 'material-symbols:open-in-new',
					desc: 'View all keybindings',
					onClick: overlays.showKeyBinds,
				},
			],
		},
		lang: {
			name: 'SETTINGS_LANG',
			items: [
				{
					type: 'info',
					name: 'We only provide translations of these languages',
					icon: 'material-symbols:info-outline',
					desc: `If you think we are missing or have an incorrect 
            translation, please create an issue on GitHub`,
				},
				{
					type: 'divider',
					name: 'Current language',
				},
				{
					type: 'button',
					name: () => langs[lang.lang] || 'English',
					icon: 'material-symbols:check',
				},
				{
					type: 'divider',
					name: 'Available languages',
				},
				...(Object.keys(langs).map((key) => ({
					type: 'button',
					name: langs[key],
					icon:
						key === lang.lang
							? 'material-symbols:check'
							: `circle-flags:${key}`,
					onClick: () => lang.set(key),
				})) as SettingEntry[]),
			],
		},
		misc: {
			name: 'SETTINGS_MISC',
			items: [
				{
					type: 'switch',
					name: 'Show Changelog',
					icon: 'material-symbols:book-2-outline',
					desc: config.showChangeLog
						? 'Changelog is shown every time the app loads'
						: 'Changelog is shown only once the app updates',
					value: config.showChangeLog,
					onChange: (v) => {
						config.showChangeLog = v
					},
				},
				{
					type: 'divider',
					name: 'Development',
				},
				{
					type: 'switch',
					name: 'Hide development tag',
					icon: 'material-symbols:text-rotation-angleup',
					desc: config.showBuildType
						? 'Tags like alpha or beta are hidden'
						: 'Tags like alpha or beta are shown',

					value: config.showBuildType,
					onChange: (v) => {
						config.showBuildType = v
					},
				},
				{
					type: 'switch',
					name: 'Debug Mode',
					icon: 'material-symbols:bug-report-outline',
					desc: config.debug
						? 'Debug mode is enabled'
						: 'Debug mode is disabled',
					value: config.debug,
					onChange: (v) => config.debug,
				},
				{
					type: 'divider',
					name: 'Experimental',
				},
				{
					type: 'switch',
					name: 'Enable Code Editor',
					icon: 'material-symbols:code',
					value: config.preferences.useMonaco,
					desc: config.preferences.useMonaco ? 'Enabled' : 'Disabled',
					onChange: (v) => {
						config.preferences.useMonaco = v
					},
				},
				{
					type: 'divider',
					name: 'App info',
				},
				{
					type: 'info',
					name: 'Version',
					desc: () => `${window.app.version_string} (${window.app.version})`,
				},
				{
					type: 'info',
					name: 'Author',
					desc: 'Kyle (@obillekyle)',
				},
				{
					type: 'button',
					name: 'View source',
					icon: 'material-symbols:open-in-new',
					desc: 'synced-lyrics-editor-webapp-v2',
					onClick: () =>
						window.open(
							'https://github.com/obillekyle/synced-lyrics-editor-webapp-v2',
							'_blank',
						),
				},
			],
		},
	} as SettingEntries
})

const BackIcon = h(IconButton, {
	icon: 'material-symbols:arrow-back',
	onClick: () => {
		options.sidebar = false
	},
})

watch(options, (newOptions) => {
	utils.value.modify({
		subAction: newOptions.sidebar ? BackIcon : undefined,
	})
})

const result = computed(() => {
	return options.search
		? Object.values(entries.value)
				.flatMap((entry) => entry.items)
				.filter((item) => {
					if (item.type === 'divider') return
					const name = evaluate(item.name)
					return name?.toLowerCase().includes(options.search.toLowerCase())
				})
		: entries.value[options.active].items
})
</script>

<template>
  <div class="settings-wrapper" :shown="options.sidebar" >
    <ScrollContainer class="settings-panel">
      <div class="entry search">
        <TextInput
          type="text"
          placeholder="Search..."
          v-model="options.search"
          height="md"
          span
        />
      </div>
      <div
        class="entry"
        :key="name"
        @pointerdown="rippleEffect"
        tabindex="0"
        :class="{ active: name == options.active }"
        v-for="(item, name) in entries"
        @click="Object.assign(options, { 
          sidebar: true,
          active: name,
          search: ''
        })"
      >
        <icon :icon="evaluate(item.icon)" :width="24" v-if="item.icon" />
        <I18nString
          v-if="item.name"
          element="div"
          class="name"
          :entry="evaluate(item.name)"
        />
        <I18nString
          v-if="item.desc"
          element="div"
          class="desc"
          :entry="evaluate(item.desc)"
        />
      </div>
    </ScrollContainer>
    <ScrollContainer class="settings-screen" :style="{ '--hl': options.search }">
      <template v-for="(item, index) in result">
        <div
          tabindex="0"
          class="entry switch"
          :key="'switch-' + index"
          @pointerdown="rippleEffect"
          v-if="item.type == 'switch'"
          @click="({ currentTarget }) => $('input', currentTarget)?.click()"
        >
          <icon :icon="evaluate(item.icon)" :width="24" v-if="item.icon" />
          <div class="name">{{ evaluate(item.name) }}</div>
          <div class="desc">{{ evaluate(item.desc) }}</div>

          <Switch
            :defaultChecked="evaluate(item.value)"
            :disabled="evaluate(item.disabled)"
            @change="item.onChange"
          />
        </div>

        <div
          tabindex="0"
          class="entry info"
          @pointerdown="rippleEffect"
          v-else-if="item.type == 'info'"
          :key="'info-' + index"
        >
          <icon :icon="evaluate(item.icon)" :width="24" v-if="item.icon" />
          <div class="name">{{ evaluate(item.name) }}</div>
          <div class="desc">{{ evaluate(item.desc) }}</div>
        </div>

        <div
          tabindex="0"
          class="entry button"
          :key="'button-' + index"
          @pointerdown="rippleEffect"
          v-else-if="item.type == 'button'"
          @click="() => item.disabled || evaluate(item.onClick)"
        >
          <icon :icon="evaluate(item.icon)" :width="24" v-if="item.icon" />
          <div class="name">{{ evaluate(item.name) }}</div>
          <div class="desc">{{ evaluate(item.desc) }}</div>
        </div>

        <Divider 
          class="entry-divider"
          v-else-if="item.type == 'divider'"
          :key="'divider-' + index"
          :label="evaluate(item.name)"
        />
      </template>
    </ScrollContainer>
  </div>
</template>

<style lang="scss">
  #md-modal-settings {
    .md-modal-wrapper {
      width: 960px;
      max-width: calc(100% - var(--md));
      height: clamp(0px, 768px, 100%);
    }

    .md-modal-content {
      padding: 0;
      height: 100%;
      max-height: 100dvh;
    }
  }

  .settings-wrapper {
    position: absolute;
    inset: 0 0 0 0;
    overflow: hidden;
    display: grid;
    max-height: 100%;
    grid-template-columns: 250px 1fr;
    grid-template-areas:
      'panel screen';

    .settings-panel {
      grid-area: panel;
      height: 100%;
      overflow: auto;
      top: var(--app-header-height);

      .active {
        background-color: var(--surface-container-highest);
      }
    }

    .md-scroll-wrapper {
      padding: 0;
    }

    .entry {
      display: grid;
      overflow: hidden;
      position: relative;
      align-content: center;
      padding: var(--sm) var(--xl);
      &.button {
        cursor: pointer;
      }
    }

    .settings-screen {
      height: 100%;
      overflow: auto;
      .entry {
        align-items: center;
        grid-template-areas:
          'icon name switch'
          'icon desc switch';
        grid-template-columns: auto 1fr auto;
      }

      .iconify {
        grid-area: icon;
        margin-right: var(--xl);
      }

      .name {
        grid-area: name;
        margin-bottom: calc(var(--sm) / 2);
      }

      .desc {
        grid-area: desc;
        color: var(--primary-90);
        font-size: var(--font-sm);
        opacity: 0.8;
        white-space: wrap;
      }

      .md-switch {
        margin-left: var(--sm);
        grid-area: switch;
        align-self: center;
        pointer-events: none;
      }
    }

    .entry-divider {
      padding-inline: var(--sm);
    }
  }

  @media screen and (max-width: 600px) {
    #md-modal-settings {
      .md-modal-wrapper {
        height: 100%;
      }
    }

    .settings-wrapper {
      position: 'relative';
      grid-template-columns: 1fr auto;
      .entry {
        background: none !important;
      }
      .search {
        display: none;
      }
      .settings-screen {
        position: absolute;
        background: var(--surface-container-high);
        width: 100dvw;
        left: 100dvw;
        bottom: 0;
        opacity: 0;
        transition:
          opacity 0.35s var(--timing-standard),
          left 0.35s var(--timing-standard);
      }

      &[shown='true'] {
        header {
          .back {
            display: block;
          }
          &:has(.back) {
            padding-inline-start: 0px;
          }
        }
        .settings-screen {
          opacity: 1;
          left: 0;
        }
      }
    }
  }
</style>
