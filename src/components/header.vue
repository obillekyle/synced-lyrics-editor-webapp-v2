<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import presets from './modals/_presets';
  import iconButton from './elements/icon-button.vue';
  import Switcher from './elements/switcher.vue';

  const screen = window.app.screen;
  const current = ref(screen.current);

  function handleChange(value: typeof current.value) {
    current.value = value;
  }

  onMounted(() => {
    screen.addEventListener('screenchange', handleChange);
  });

  onUnmounted(() => {
    screen.removeEventListener('screenchange', handleChange);
  });

  const items = [
    {
      name: 'Edit',
      icon: 'material-symbols:edit-outline',
    },
    {
      name: 'Timing',
      icon: 'material-symbols:hourglass-outline',
    },
    {
      name: 'Preview',
      icon: 'material-symbols:note-outline',
    },
  ];

  const screens: (typeof current.value)[] = ['edit', 'timing', 'lyric'];

  function getCurrentIndex() {
    return screens.indexOf(current.value);
  }

  function setValue(index: number) {
    screen.set(screens[index]);
  }
</script>

<template>
  <header :data-screen="current" class="app-header">
    <icon-button
      icon="material-symbols:settings-outline"
      class="settings"
      title="Settings"
      :onclick="presets.openSettings"
    />
    <div class="app-logo">
      <div class="app-title" :onclick="presets.changelog">
        Synced Lyrics Editor
      </div>
    </div>

    <div class="screens">
      <Switcher
        :items="items"
        :defaultValue="getCurrentIndex()"
        :change="setValue"
      />
    </div>
    <div class="actions">
      <icon-button
        :onclick="presets.uploadNewLrc"
        class="icon-button"
        title="Open LRC file"
        icon="material-symbols:upload-file-outline-sharp"
      />
      <icon-button
        :onclick="presets.download"
        class="icon-button"
        title="Download"
        icon="material-symbols:download"
      />
    </div>
  </header>
</template>

<style lang="scss">
  .app-header {
    height: var(--app-header-height);
    padding-inline: var(--sm);

    border-bottom: 1px solid #7777;
    background-color: var(--app-header-color);

    display: grid;
    grid-template-areas: 'settings logo screens actions';
    grid-template-columns: auto auto 1fr auto;

    user-select: none;

    &[data-screen='lyric'] {
      --app-header-color: transparent;
      border-bottom-color: transparent;
    }

    .settings {
      margin-left: -56px;
      position: relative;
      rotate: 0deg;
      transition: all 0.2s ease-in-out;
    }

    &:has(.app-logo:hover, .settings:hover) {
      .settings {
        margin-left: 0;
        rotate: 360deg;
      }
    }

    .app-logo {
      display: flex;
      grid-area: logo;
      border-left: 4px solid var(--color-500, red);
      transition: border-color 3s;
      padding-inline-start: 4px;

      align-items: center;
      align-self: center;
      gap: var(--sm);
    }

    .app-title {
      width: 40px;
      padding-top: 2px;
      line-height: 12px;
      font-size: var(--font-sm);
      font-weight: 600;
      white-space: pre-line;
      text-transform: uppercase;
    }

    .screens {
      grid-area: screens;
      display: flex;
      gap: var(--sm);
      margin-inline: auto;

      button {
        --border-size: 3px;
        background: none;
        border: none;
        font-family: inherit;
        font-size: var(--font-lg);
        text-transform: uppercase;
        font-weight: 500;
        padding-inline: var(--sm);
        border-top: var(--border-size) solid transparent;
        border-bottom: var(--border-size) solid transparent;

        color: #ccc;

        &[active='true'] {
          color: inherit;
          border-bottom-color: white;
        }
      }
    }

    .actions {
      grid-area: actions;
      align-content: center;
      display: flex;
    }
  }
</style>
