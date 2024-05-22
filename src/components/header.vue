<script setup lang="ts">
  import { inject, onMounted, onUnmounted, ref, type Ref } from 'vue';

  import I18nString from './elements/i18n-string.vue';
  import IconButton from './elements/button/icon-button.vue';
  import presets from './modals/_presets';
  import Switch from './elements/switch.vue';
  import Divider from './divider.vue';

  const screenNames = {
    edit: 'APP_EDIT',
    timing: 'APP_TIMING',
    lyric: 'APP_LYRIC',
    debug: 'DEBUG',
    files: 'FILES',
  };

  const screen = window.app.screen;
  const current = ref(screen.current);

  const sortMode = inject<Ref<boolean>>('app-timing-sort')!;
  const showTranslate = inject<Ref<boolean>>('showTranslate')!;

  function handleChange(value: typeof current.value) {
    current.value = value;
  }

  onMounted(() => {
    screen.listen('update', handleChange);
  });

  onUnmounted(() => {
    screen.detach('update', handleChange);
  });
</script>

<template>
  <header :data-screen="current" class="app-header">
    <I18nString :entry="screenNames[current]" element="h3" />
    <div class="actions">
      <template v-if="current === 'lyric'">
        <I18nString entry="TRANSLATE" fallback="Translate" />
        <Switch v-model="showTranslate" title="Translate" />
        <Divider direction="y" size="24" margin="none" />
      </template>

      <template v-if="current === 'timing'">
        <IconButton
          :icon="sortMode ? 'mdi:sort-ascending' : 'mdi:clock-edit-outline'"
          :onclick="() => (sortMode = !sortMode)"
        />
        <Divider direction="y" size="24" margin="none" />
      </template>

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
  body:has(.app-header[data-screen='lyric']) {
    --app-header-color: transparent;
  }
  .app-header {
    height: var(--app-header-height);
    padding-inline: var(--sm);
    background-color: var(--app-header-color);

    display: flex;
    align-items: center;
    position: relative;

    user-select: none;

    &[data-screen='lyric'] {
      border-bottom-color: transparent;
    }

    h3 {
      font-weight: 600;
      font-size: var(--font-lg);
      margin-left: var(--sm);
    }

    .actions {
      right: 0;
      position: absolute;
      align-items: center;
      display: flex;
      background-color: inherit;

      .switch-wrapper {
        margin-inline: 12px;
      }
    }
  }
</style>
