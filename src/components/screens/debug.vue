<script setup lang="ts">
  import { markRaw, ref } from 'vue';

  import Button from '../elements/button/button.vue';
  import InputText from '../elements/input/text-input.vue';
  import List from '../elements/list/list.vue';
  import type { ListItemType, SwipeOptions } from '../elements/list/types';
  import _presets from '../modals/_presets';
  import DebugListComp from './debug-list-comp.vue';
  import MasterSwitch from '../elements/switches/master-switch.vue';
  import MdProgress from '../elements/progress/circular-progress.vue';
  import Switch from '../elements/switches/switch.vue';
  import Progress from '../elements/progress/linear-progress.vue';
  import Slider from '../elements/slider/slider.vue';
  import Chip from '../elements/chip/chip.vue';
  import Scroller from '../elements/scroller.vue';
  import MasterSlider from '../elements/slider/master-slider.vue';
  import { Icon } from '@iconify/vue/dist/iconify.js';

  const Lang = window.app.i18n;
  const Option = window.app.options;
  const Player = window.app.player;

  const langInput = ref<HTMLInputElement | null>(null);
  const progressVal = ref(20);

  const items = markRaw<ListItemType[]>([
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

    <div class="grid-container">
      <MdProgress />
      <MdProgress :value="progressVal" />

      <MdProgress :value="progressVal">
        <MdProgress :diameter="24" :stroke="3" />
      </MdProgress>

      <MdProgress>
        <MdProgress :diameter="32" :stroke="3">
          <MdProgress :diameter="20" :stroke="2">
            <MdProgress :diameter="8" :stroke="1" />
          </MdProgress>
        </MdProgress>
      </MdProgress>
    </div>

    <Progress />
    <Progress :value="progressVal" />

    <Slider v-model="progressVal" />
    <Slider :values="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" />
    <Slider :values="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" show-label />
    <Slider
      show-value
      :default-value="Player.volume * 100"
      :change="(v) => Player.setVolume(v)"
    />
    <Slider show-value :step="5" />

    <MasterSlider :change="(v) => Player.setVolume(v)">
      <Icon icon="material-symbols:volume-up-outline" :width="24" />
      <span>Volume</span>
    </MasterSlider>

    <Scroller>
      Hello there random user, thank you for using this web application, I hope
      it helped you in some way. What's this? Ah- this is a very long text that
      is used to test this Scroller component. It's so long, you can't see all
      of it because of the fact that the your browser window is very small and
      it can't display it all. It is sad that mobile users won't be able to see
      all of this meaningless text unless they waited for a long time. Well, if
      you can see this as a whole, you must have a long-ass monitor or had a
      multi-monitor setup. Hey you, yeah you, whose using 1920x1080 monitor, you
      can't un-zoom, that's cheating!. Anyways, thank you very much for using
      this app 감사합니다!.
    </Scroller>

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
        :items="items"
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
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(48px, auto));
    gap: var(--sm);
  }

  .special-wrapper {
    overflow: overlay;
    max-height: 300px;
    width: 100%;
  }
</style>
