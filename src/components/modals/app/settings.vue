<script setup lang="ts">
  import { computed, inject, onMounted, onUnmounted, ref } from 'vue';

  import type { ModalActionsArgs } from '@/api/modals';
  import { $, evaluate, type MaybeFunction } from '@/api/util';
  import { Icon } from '@iconify/vue';

  import I18nString from '../../elements/i18n-string.vue';
  import IconButton from '../../elements/button/icon-button.vue';
  import Switch from '../../elements/switch.vue';
  import _presets from '../_presets';

  const Options = window.app.options;
  const Lang = window.app.i18n;

  const fns = inject<ModalActionsArgs>('fns')!;

  const shown = ref(false);
  const active = ref('general');
  const updateKey = ref(false);
  const update = () => (updateKey.value = !updateKey.value);
  type Stringish = MaybeFunction<string>;
  type Booleanish = MaybeFunction<boolean>;

  const langs: Record<string, string> = {
    en: 'English',
    zh: '简体中文',
    ja: '日本語',
    ko: '한국어',
    ph: 'Filipino',
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
            icon: 'material-symbols:info-outline',
            desc: () => {
              return Options.get('showChangeLog')
                ? 'Changelog is shown every time the app loads'
                : 'Changelog is shown only once the app updates';
            },
            value: () => Options.get('showChangeLog'),
            onChange: (v) => Options.set('showChangeLog', v),
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
      <div
        class="entry"
        :key="name"
        :class="{ active: name == active }"
        v-for="(item, name) in entries"
        @click="
          () => {
            shown = true;
            active = name + '';
          }
        "
      >
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
    <div class="constraint">
      <div class="settings-screen">
        <template v-for="(item, index) in entries[active].items">
          <div
            tabindex="0"
            class="entry switch"
            v-if="item.type == 'switch'"
            :key="'switch-' + index"
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
          >
            <div class="name">{{ evaluate(item.name) }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .settings-wrapper {
    display: grid;
    width: minmax(0px, 768px);
    height: minmax(0px, 100vh);
    grid-template-columns: 250px 1fr;
    grid-template-rows: var(--app-header-height) 1fr;
    grid-template-areas:
      'header header'
      'panel screen';
    header {
      padding-inline: var(--lg);
      grid-area: header;
      position: sticky;
      top: 0;
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
      .active {
        background-color: var(--color-600-10);
      }
    }

    .constraint {
      grid-area: screen;
    }

    .entry {
      display: grid;
      padding: var(--xl) var(--lg);
      &:hover {
        background-color: var(--color-600-10);
      }
      &.button {
        cursor: pointer;
      }
    }

    .settings-screen {
      max-width: 100%;
      overflow-y: auto;
      .entry {
        align-items: center;
        grid-template-areas:
          'icon name switch'
          'icon desc switch';
        grid-template-columns: auto 1fr auto;
      }

      .iconify {
        grid-area: icon;
        margin-right: var(--md);
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
      .settings-screen {
        position: absolute;
        top: var(--app-header-height);
        background: var(--background-secondary);
        width: 100dvw;
        left: 100dvw;
        bottom: 0;
        opacity: 0;
        transition:
          opacity 0.15s,
          left 0.15s;
      }

      .entry.active:not(:hover) {
        background: none;
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
