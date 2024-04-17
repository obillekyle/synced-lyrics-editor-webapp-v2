<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import presets from './modals/_presets';
  import iconButton from './elements/icon-button.vue';

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

    .actions {
      grid-area: actions;
      align-content: center;
      display: flex;
    }
  }
</style>
