<script setup lang="ts">
  import { onMounted, ref } from 'vue';

  import Button from '../elements/button/button.vue';
  import InputText from '../elements/input/text.vue';
  import List from '../elements/list/list.vue';
  import type { ListItemType, SwipeOptions } from '../elements/list/types';
  import _presets from '../modals/_presets';
  import DebugListComp from './debug-list-comp.vue';

  const Lang = window.app.i18n;

  const langInput = ref<HTMLInputElement | null>(null);

  const items = ref<ListItemType[]>([
    {
      id: 8,
      props: {
        icon: 'material-symbols:audio-file-outline-sharp',
        title: 'hello',
      },
    },
    {
      id: 9,
      props: {
        icon: 'material-symbols:download-2-outline',
        title: 'hello',
      },
    },
  ]);

  const options: SwipeOptions = {
    left: {
      color: 'green',
      icon: 'material-symbols:archive-outline',
      handler: () => {
        console.log('left');
      },
    },
    right: {
      color: 'orange',
      icon: 'material-symbols:mark-as-unread-outline-rounded',
      handler: () => {
        console.log('right');
      },
    },
  };
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

    <div class="special-wrapper">
      <List
        sortable
        swipe="custom"
        v-model="items"
        :list-comp="DebugListComp"
        :swipe-options="options"
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
  .special-wrapper {
    overflow: overlay;
    max-height: 300px;
    width: 100%;
  }
</style>
