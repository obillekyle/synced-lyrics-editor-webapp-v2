<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import { Icon } from '@iconify/vue';
  import Divider from './divider.vue';
  import presets from './_modals';

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
</script>

<template>
  <header
    :data-screen="current"
    class="app-header"
  >
    <div class="app-logo">
      <div
        class="app-title"
        :onclick="presets.changelog"
      >
        Synced Lyrics Editor
      </div>
    </div>
    <div class="screens">
      <button
        :active="current == 'edit'"
        :onclick="() => screen.set('edit')"
        title="Editor"
      >
        Editor
      </button>
      <button
        :active="current == 'timing'"
        :onclick="() => screen.set('timing')"
        title="Timing"
      >
        Timing
      </button>
      <button
        :active="current == 'lyric'"
        :onclick="() => screen.set('lyric')"
        title="Lyrics"
      >
        Lyrics
      </button>
    </div>
    <div class="actions">
      <button
        class="icon-button"
        title="Open LRC file"
        :onclick="presets.uploadNewLrc"
      >
        <div class="wrapper">
          <icon
            :width="24"
            icon="material-symbols:upload-file-outline-sharp"
          />
        </div>
      </button>
      <divider
        direction="y"
        margin="sm"
        size="10px"
      />
      <button
        class="icon-button"
        title="Download"
        :onclick="presets.download"
      >
        <div class="wrapper">
          <icon
            :width="24"
            icon="material-symbols:download"
          />
        </div>
      </button>
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
    grid-template-areas: 'logo screens actions';
    grid-template-columns: auto 1fr auto;

    user-select: none;

    &[data-screen='lyric'] {
      --app-header-color: transparent;
      border-bottom-color: transparent;
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
