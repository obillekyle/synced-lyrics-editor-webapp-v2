<script setup lang="ts">
  import { onMounted, ref } from 'vue';

  import Button from '../elements/button/button.vue';
  import InputText from '../elements/input/text.vue';
  import _presets from '../modals/_presets';

  const Lang = window.app.i18n;

  const langInput = ref<HTMLInputElement | null>(null);
</script>

<template>
  <div class="debug-screen">
    <Button
      left-icon="material-symbols:settings-outline"
      right-icon="material-symbols:open-in-new"
      @click="_presets.openSettings"
      label="Settings"
    />
    <Button
      left-icon="material-symbols:queue-music"
      right-icon="material-symbols:open-in-new"
      variant="outline"
      @click="_presets.download"
      label="Lyric"
    />
    <Button
      left-icon="material-symbols:upload-file-outline"
      right-icon="material-symbols:open-in-new"
      variant="subtle"
      @click="_presets.uploadNewLrc"
      label="Upload Lrc"
    />
    <Button
      left-icon="material-symbols:book-2-outline"
      right-icon="material-symbols:open-in-new"
      variant="transparent"
      @click="_presets.changelog"
      label="Changelog"
    />
    <div>
      <InputText
        placeholder="Language"
        left-icon="material-symbols:language"
        :default-value="Lang.lang"
        id="debug-lang"
        ref="langInput"
      />
      <Button
        label="Set Language"
        @click="() => Lang.set(langInput!.value || 'en')"
      />
    </div>
  </div>
</template>

<style lang="scss">
  .debug-screen {
    display: flex;
    flex-direction: column;
    gap: var(--sm);
  }
</style>
