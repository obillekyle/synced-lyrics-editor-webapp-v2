<script setup lang="ts">
  import { onMounted, ref } from 'vue';

  import Button from '../elements/button/button.vue';
  import InputText from '../elements/input/text-input.vue';
  import List from '../elements/list/list.vue';
  import type { ListItemType, SwipeOptions } from '../elements/list/types';
  import _presets from '../modals/_presets';
  import DebugListComp from './debug-list-comp.vue';
  import MasterSwitch from '../elements/master-switch.vue';
  import I18nString from '../elements/i18n-string.vue';
  import MdProgress from '../elements/progress/circular-progress.vue';
  import Switch from '../elements/switch.vue';
  import Progress from '../elements/progress/linear-progress.vue';
  import Slider from '../elements/slider.vue';
  import Chip from '../elements/chip/chip.vue';

  const Lang = window.app.i18n;
  const Option = window.app.options;
  const Player = window.app.player;

  const langInput = ref<HTMLInputElement | null>(null);
  const progressVal = ref(20);

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
  };

  function setFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }

    document.documentElement.requestFullscreen({
      navigationUI: 'show',
    });
  }
</script>

<template>
  <div class="debug-screen">
    <MasterSwitch
      :defaultChecked="Option.get('debug', false)"
      :change="(value) => Option.set('debug', value)"
    >
      Use debug options
    </MasterSwitch>

    <MdProgress />
    <MdProgress :value="progressVal" />

    <Progress />
    <Progress :value="progressVal" />

    <MdProgress :value="progressVal">
      <MdProgress :diameter="24" :stroke="3" />
    </MdProgress>

    <Slider v-model="progressVal" />
    <Slider :values="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" />
    <Slider :values="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" show-label />
    <Slider
      show-value
      :default-value="Player.volume * 100"
      :change="(v) => Player.setVolume(v)"
    />
    <Slider show-value :step="5" />

    <div>
      <Chip
        variant="filled"
        label="Chip"
        left-icon="material-symbols:chips-outline"
      />
      <Chip
        variant="outline"
        label="Chip"
        left-icon="material-symbols:chips-outline"
      />
      <Chip
        variant="subtle"
        label="Chip"
        left-icon="material-symbols:chips-outline"
      />
      <Chip
        variant="transparent"
        label="Chip"
        left-icon="material-symbols:chips-outline"
      />
    </div>

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

    <Button
      left-icon="material-symbols:fullscreen"
      label="Fullscreen"
      @click="() => setFullscreen()"
    />
    <div class="lang-controller">
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

    <Switch />

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
  .lang-controller {
    display: flex;
    align-items: center;
    gap: var(--sm);
  }
  .special-wrapper {
    overflow: overlay;
    max-height: 300px;
    width: 100%;
  }
</style>
