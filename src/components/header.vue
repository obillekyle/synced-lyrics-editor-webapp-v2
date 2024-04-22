<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import presets from './modals/_presets';
  import IconButton from './elements/icon-button.vue';
  import InputText from './elements/input/text.vue';
  import InputNumber from './elements/input/number.vue';

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
    <InputText
      left-icon="material-symbols:artist-outline"
      defaultValue="Lyric"
      maxlength="16"
    />
    <InputNumber placeholder="Lyrics Offset" :defaultValue="0" max="16" />
    <div class="actions">
      <IconButton
        :onclick="presets.uploadNewLrc"
        class="icon-button"
        title="Open LRC file"
        icon="material-symbols:upload-file-outline-sharp"
      />
      <IconButton
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
    background-color: var(--app-header-color);

    display: flex;
    align-items: center;
    position: relative;

    user-select: none;

    &[data-screen='lyric'] {
      --app-header-color: transparent;
      border-bottom-color: transparent;
    }

    &:has(.app-logo:hover, .settings:hover) {
      .settings {
        margin-left: 0;
        rotate: 360deg;
      }
    }

    .actions {
      right: 0;
      position: absolute;
      align-content: center;
      display: flex;
      background-color: inherit;
    }
  }
</style>
