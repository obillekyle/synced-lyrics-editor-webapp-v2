<script setup lang="ts">
  import { computed, inject, onMounted, onUnmounted, ref } from 'vue';

  import type { ModalActionsArgs } from '@/api/modals';
  import { $, evaluate, rippleEffect, type MaybeFunction } from '@/api/util';
  import { Icon } from '@iconify/vue';

  import I18nString from '../../elements/Text/i18n-string.vue';
  import IconButton from '../../elements/Button/icon-button.vue';
  import Switch from '../../elements/Switches/switch.vue';
  import _presets from '../_presets';
  import TextInput from '@/components/elements/Input/text-input.vue';

  const Options = window.app.options;
  const Lang = window.app.i18n;

  const fns = inject<ModalActionsArgs>('fns')!;

  const shown = ref(false);
  const active = ref('general');
  const updateKey = ref(false);
  const search = ref('');
  const update = () => (updateKey.value = !updateKey.value);
  type Stringish = MaybeFunction<string>;
  type Booleanish = MaybeFunction<boolean>;

  const langs: Record<string, string> = {
    en: 'English',
    zh: '简体中文',
    ja: '日本語',
    ko: '한국어',
    ph: 'Filipino',
    hi: 'हिंदी',
    id: 'Indonesian',
    ur: 'اردو',
  };

  type SettingEntry =
    | {
        type: 'switch';
        name: Stringish;
        icon?: Stringish;
        desc?: Stringish;
        disabled?: Booleanish;
        value: () => boolean | undefined;
        onChange?: (value: boolean) => any;
      }
    | {
        type: 'info';
        name: Stringish;
        icon?: Stringish;
        desc?: Stringish;
      }
    | {
        type: 'divider';
        name?: Stringish;
        sticky?: Booleanish;
      }
    | {
        type: 'button';
        name: Stringish;
        icon?: Stringish;
        desc?: Stringish;
        disabled?: Booleanish;
        onClick?: () => any;
      };

  type SettingEntries = {
    [key: string]: {
      name: Stringish;
      desc?: Stringish;
      icon?: Stringish;
      disabled?: Booleanish;
      items: SettingEntry[];
    };
  };

  const entries = computed<SettingEntries>(() => {
    updateKey.value;

    return {
      general: {
        name: 'SETTINGS_GENERAL',
        items: [
          {
            type: 'switch',
            name: () =>
              Options.get('theme', 'dark') == 'dark'
                ? 'Dark Mode'
                : 'Light Mode',
            icon: () =>
              Options.get('theme', 'dark') == 'dark'
                ? 'material-symbols:dark-mode-outline'
                : 'material-symbols:light-mode-outline',
            desc: () =>
              `Switch to ${Options.get('theme', 'dark') == 'dark' ? 'light' : 'dark'} mode`,
            value: () => Options.get('theme', 'dark') == 'dark',
            onChange: (v) => Options.set('theme', v ? 'dark' : 'light'),
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
            value: () => Options.get('showHome', true),
            onChange: (v) => Options.set('showHome', v),
          },
          {
            type: 'switch',
            name: 'Center Navigation Buttons',
            icon: 'material-symbols:vertical-align-center',
            desc: 'Center the navigation buttons',
            value: () => Options.get('centered-nav-buttons', true),
            onChange: (v) => Options.set('centered-nav-buttons', v),
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
            value: () => Options.get('showKeyBinds'),
            onChange: (v) => Options.set('showKeyBinds', v),
          },
          {
            type: 'button',
            name: 'View Key Bindings',
            icon: 'material-symbols:open-in-new',
            desc: 'View all keybindings',
            onClick: () => _presets.showKeyBinds(),
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
            name: () => langs[Lang.lang] || 'English',
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
              key === Lang.lang
                ? 'material-symbols:check'
                : 'circle-flags:' + key,
            onClick: () => Lang.set(key),
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
            desc: () => {
              return Options.get('showChangeLog')
                ? 'Changelog is shown every time the app loads'
                : 'Changelog is shown only once the app updates';
            },
            value: () => Options.get('showChangeLog'),
            onChange: (v) => Options.set('showChangeLog', v),
          },
          {
            type: 'divider',
            name: 'Development',
          },
          {
            type: 'switch',
            name: 'Hide development tag',
            icon: 'material-symbols:text-rotation-angleup',
            desc: () => {
              return Options.get('dev-tag', false)
                ? 'Tags like alpha or beta are hidden'
                : 'Tags like alpha or beta are shown';
            },
            value: () => Options.get('dev-tag', false),
            onChange: (v) => Options.set('dev-tag', v),
          },
          {
            type: 'switch',
            name: 'Debug Mode',
            icon: 'material-symbols:bug-report-outline',
            desc: () => {
              return Options.get('debug', false)
                ? 'Debug mode is enabled'
                : 'Debug mode is disabled';
            },
            value: () => Options.get('debug', false),
            onChange: (v) => Options.set('debug', v),
          },
          {
            type: 'divider',
            name: 'Experimental',
          },
          {
            type: 'switch',
            name: 'Enable Code Editor',
            icon: 'material-symbols:code',
            desc: () => {
              return Options.get('experimentalCodeEditor', false)
                ? 'Enabled'
                : 'Disabled';
            },
            value: () => Options.get('experimentalCodeEditor', false),
            onChange: (v) => Options.set('experimentalCodeEditor', v),
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
                '_blank'
              ),
          },
        ],
      },
    };
  });

  const result = computed(() => {
    return search.value
      ? Object.values(entries.value)
          .map((entry) => entry.items)
          .flat()
          .filter((item) => {
            if (item.type === 'divider') return;
            const name = evaluate(item.name);
            return (
              name && name.toLowerCase().includes(search.value.toLowerCase())
            );
          })
      : entries.value[active.value].items;
  });

  onMounted(() => Lang.listen('update', update));
  onUnmounted(() => Lang.detach('update', update));
</script>

<template>
  <div class="settings-wrapper" :shown="shown" @click="update">
    <header>
      <IconButton
        v-if="shown"
        icon="material-symbols:arrow-back"
        class="back"
        @click="() => (shown = false)"
        title="Back"
      />
      <I18nString element="div" class="title" entry="SETTINGS" />
      <icon-button
        icon="material-symbols:close"
        @click="() => fns.close()"
        title="Close"
      />
    </header>

    <div class="settings-panel">
      <div class="scroll-wrapper">
        <div class="entry search">
          <TextInput
            type="text"
            placeholder="Search..."
            v-model="search"
            height="md"
            span
          />
        </div>
        <div
          class="entry"
          :key="name"
          @pointerdown="rippleEffect"
          :class="{ active: name == active }"
          v-for="(item, name) in entries"
          @click="
            () => {
              shown = true;
              search = '';
              active = name + '';
            }
          "
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
      </div>
    </div>
    <div class="constraint">
      <div class="settings-screen" :style="{ '--hl': search }">
        <div class="scroll-wrapper">
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
                :change="item.onChange"
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
              @click="() => item.disabled || evaluate(item.onClick)()"
            >
              <icon :icon="evaluate(item.icon)" :width="24" v-if="item.icon" />
              <div class="name">{{ evaluate(item.name) }}</div>
              <div class="desc">{{ evaluate(item.desc) }}</div>
            </div>

            <div
              class="entry-divider"
              v-else-if="item.type == 'divider'"
              :key="'divider-' + index"
              :class="{ sticky: evaluate(item.sticky) ?? true }"
            >
              <div class="name">{{ evaluate(item.name) }}</div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .settings-wrapper {
    position: relative;
    inset: 0 0 0 0;
    height: 100%;
    overflow: hidden;
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: var(--app-header-height) calc(
        100% - var(--app-header-height)
      );
    height: 100%;
    grid-template-areas:
      'header header'
      'panel screen';

    header {
      padding-left: var(--xl);
      padding-right: var(--md);
      grid-area: header;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: var(--app-header-height);
      background: var(--background-secondary);
      display: flex;
      align-items: center;
      z-index: 10;

      .back {
        display: none;
      }

      .title {
        font-weight: 600;
        font-size: var(--font-lg);
        margin-right: auto;
      }
    }

    .settings-panel {
      grid-area: panel;
      height: 100%;
      overflow: auto;
      top: var(--app-header-height);

      .active {
        background-color: var(--color-600-10);
      }
    }

    .scroll-wrapper {
      overflow: auto;
      height: 100%;
      position: relative;
    }

    .constraint {
      grid-area: screen;
    }

    .entry {
      display: grid;
      overflow: hidden;
      position: relative;
      padding: var(--xl);
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
        color: var(--color-900);
        font-size: var(--font-sm);
        opacity: 0.8;
        white-space: wrap;
      }

      .switch-wrapper {
        margin-left: var(--sm);
        grid-area: switch;
        pointer-events: none;
      }
    }

    .entry-divider {
      align-items: center;
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-areas: 'name line';
      gap: var(--sm);
      text-transform: uppercase;
      font-size: var(--font-sm);
      font-weight: 600;
      padding: var(--sm);
      &.sticky {
        position: sticky;
        top: 0;
        z-index: 2;
        background: var(--background-secondary);
      }
      &::after {
        content: '';
        display: block;
        height: 1px;
        grid-area: line;
        background-color: var(--color-600-20);
      }
    }
  }

  @media screen and (max-width: 600px) {
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
        top: var(--app-header-height);
        background: var(--background-secondary);
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
