<script setup lang="ts">
  import { $, evaluate, type MaybeFunction } from '@/api/util';
  import { Icon } from '@iconify/vue';
  import { ref } from 'vue';
  import Switch from '../elements/switch.vue';
  import type { ModalActionsArgs } from '@/api/modals';
  import IconButton from '../elements/icon-button.vue';
  import _presets from './_presets';

  const Options = window.app.options;

  defineProps<{
    actions: ModalActionsArgs;
  }>();

  const shown = ref(false);
  const active = ref('general');
  type Stringish = MaybeFunction<string>;
  type Booleanish = MaybeFunction<boolean>;

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

  const entries: SettingEntries = {
    general: {
      name: 'General',
      items: [
        {
          type: 'switch',
          name: 'Dark Mode',
          icon: 'material-symbols:dark-mode-outline',
          desc: 'Enable dark mode',
          disabled: () => !('theme' in document.documentElement.style),
          value: () => Options.get('darkMode', true),
          onChange: (v) => Options.set('darkMode', v),
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
      name: 'Language',
      items: [
        {
          type: 'divider',
          name: 'Current language',
        },
        {
          type: 'button',
          name: 'English (US)',
          icon: 'material-symbols:check',
        },
        {
          type: 'divider',
          name: 'Available languages',
        },
        {
          type: 'button',
          name: 'English (US)',
          icon: 'material-symbols:check',
        },
      ],
    },
    misc: {
      name: 'Miscellaneous',
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
</script>

<template>
  <div class="settings-wrapper" :shown="shown">
    <header>
      <icon-button
        v-if="shown"
        icon="material-symbols:arrow-back"
        class="back"
        @click="() => (shown = false)"
        title="Back"
      />
      <div class="title">Settings</div>
      <icon-button
        icon="material-symbols:close"
        @click="() => actions.close()"
        title="Close"
      />
    </header>

    <div class="settings-panel">
      <div
        :key="name"
        v-for="(item, name) in entries"
        :class="['entry', name == active && 'active']"
        @click="
          () => {
            shown = true;
            active = name + '';
          }
        "
      >
        <div class="name">{{ evaluate(item.name) }}</div>
        <div class="desc">{{ evaluate(item.desc) }}</div>
      </div>
    </div>

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
</template>

<style lang="scss">
  .settings-wrapper {
    display: grid;
    width: minmax(0px, 768px);
    grid-template-columns: 250px 1fr;
    grid-template-rows: var(--app-header-height) 1fr;
    grid-template-areas:
      'header header'
      'panel screen';
    overflow: hidden;
    inset: 0 0 0 0;
    z-index: 100;

    header {
      padding-inline: var(--md);
      grid-area: header;
      display: flex;
      align-items: center;

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

    .entry {
      display: grid;
      padding: var(--lg) var(--md);
      &:hover {
        background-color: var(--color-600-10);
      }
      &.button {
        cursor: pointer;
      }
    }

    .settings-screen {
      grid-area: screen;
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
      }

      .switch-wrapper {
        margin-left: var(--sm);
        grid-area: switch;
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
