<script setup lang="ts">
  import { markRaw, onMounted, ref } from 'vue';
  import Layout from './elements/Layout/layout.vue';
  import NavigationBar from '@/components/elements/Navigation/navigation-bar.vue';
  import NavigationContainer from '@/components/elements/Navigation/navigation-container.vue';
  import NavigationItem from '@/components/elements/Navigation/navigation-item.vue';
  import Header from './elements/Header/header.vue';
  import HeaderTitle from './elements/Header/header-title.vue';
  import Fab from './elements/Layout/fab.vue';
  import type { SelectItem } from './elements/Select/select.vue';
  import Select from './elements/Select/select.vue';
  import MasterSwitch from './elements/Switches/master-switch.vue';
  import ColorBlock from './elements/color-block.vue';
  import ButtonGroup from './elements/Button/button-group.vue';
  import Button from './elements/Button/button.vue';
  import Chip from './elements/Chip/chip.vue';
  import ChipGroup from './elements/Chip/chip-group.vue';
  import SquareImage from './elements/square-image.vue';
  import MasterSlider from './elements/Slider/master-slider.vue';
  import Slider from './elements/Slider/slider.vue';
  import LinearProgress from './elements/Progress/linear-progress.vue';
  import CircularProgress from './elements/Progress/circular-progress.vue';
  import TextInput from './elements/Input/text-input.vue';
  import WavyDivider from './elements/Divider/wavy-divider.vue';
  import Scroller from './elements/Text/scroller.vue';
  import Switch from './elements/Switches/switch.vue';
  import { Icon } from '@iconify/vue/dist/iconify.js';

  onMounted(() => {});
  const active = ref(0);
  const progressVal = ref(20);

  const selectedVal = ref<number[]>([]);
  const selectItems = markRaw<SelectItem[]>([
    {
      id: 8,
      name: 'hello',
    },
    {
      id: 9,
      name: 'test',
    },
    {
      id: 10,
      name: 'wow',
    },
    {
      id: 11,
      name: 'wow2',
    },
  ]);
</script>

<template>
  <Layout
    :options="{
      theme: 'dark',
      color: {
        primary: '#1a73e8',
      },
    }"
  >
    <template #navbar>
      <NavigationBar
        labels="active"
        :active="active"
        :change="(a) => (active = a)"
      >
        <NavigationContainer center>
          <NavigationItem icon="material-symbols:home-outline">
            Test
          </NavigationItem>
          <NavigationItem icon="material-symbols:home-outline" :value="2">
            Test2
          </NavigationItem>
        </NavigationContainer>
      </NavigationBar>
    </template>

    <template #header>
      <Header />
    </template>

    <template #fab>
      <Fab icon="material-symbols:home-outline">Hello</Fab>
    </template>

    <template #default>
      <HeaderTitle title="Test" />

      <div class="debug-screen">
        <MasterSwitch defaultChecked>Master Switch</MasterSwitch>

        <Select
          :value="selectedVal"
          :items="selectItems"
          placeholder="Select something"
          :change="(v) => (selectedVal = v)"
        />

        <div class="colors">
          <ColorBlock color="primary-0" />
          <ColorBlock color="primary-1" />
          <ColorBlock color="primary-5" />
          <ColorBlock color="primary-10" />
          <ColorBlock color="primary-20" />
          <ColorBlock color="primary-30" />
          <ColorBlock color="primary-40" />
          <ColorBlock color="primary-50" />
          <ColorBlock color="primary-60" />
          <ColorBlock color="primary-70" />
          <ColorBlock color="primary-80" />
          <ColorBlock color="primary-90" />
          <ColorBlock color="primary-95" />
          <ColorBlock color="primary-99" />
          <ColorBlock color="primary-100" />
        </div>
        <div class="colors">
          <ColorBlock color="secondary-0" />
          <ColorBlock color="secondary-1" />
          <ColorBlock color="secondary-5" />
          <ColorBlock color="secondary-10" />
          <ColorBlock color="secondary-20" />
          <ColorBlock color="secondary-30" />
          <ColorBlock color="secondary-40" />
          <ColorBlock color="secondary-50" />
          <ColorBlock color="secondary-60" />
          <ColorBlock color="secondary-70" />
          <ColorBlock color="secondary-80" />
          <ColorBlock color="secondary-90" />
          <ColorBlock color="secondary-95" />
          <ColorBlock color="secondary-99" />
          <ColorBlock color="secondary-100" />
        </div>

        <ButtonGroup>
          <Button
            left-icon="material-symbols:settings-outline"
            right-icon="material-symbols:open-in-new"
            variant="outline"
            label="Settings"
          />
          <Button
            left-icon="material-symbols:queue-music"
            right-icon="material-symbols:open-in-new"
            variant="outline"
            label="Lyric"
          />
          <Button
            left-icon="material-symbols:upload-file-outline"
            right-icon="material-symbols:open-in-new"
            variant="outline"
            label="Upload Lrc"
          />
          <Button
            left-icon="material-symbols:book-2-outline"
            right-icon="material-symbols:open-in-new"
            variant="outline"
            label="Changelog"
          />

          <Button
            left-icon="material-symbols:fullscreen"
            label="Fullscreen"
            variant="outline"
          />
        </ButtonGroup>

        <ChipGroup>
          <Chip
            variant="outline"
            label="Chip"
            left-icon="material-symbols:chips-outline"
          />
          <Chip
            variant="outline"
            label="Chip"
            left-icon="material-symbols:chips-outline"
          />
          <Chip
            variant="outline"
            label="Chip"
            left-icon="material-symbols:chips-outline"
          />
          <Chip
            variant="outline"
            label="Chip"
            left-icon="material-symbols:chips-outline"
          />
        </ChipGroup>

        <div class="flex-container">
          <SquareImage src="/assets/gemini-generated-image.jpg" />
          <SquareImage
            src="/assets/gemini-generated-image.jpg"
            frame="circle"
          />
          <SquareImage
            src="/assets/gemini-generated-image.jpg"
            frame="scalloped-square"
          />

          <!-- random image from pexels -->
          <SquareImage
            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            frame="scalloped-square"
          />
        </div>

        <div class="grid-container">
          <CircularProgress />
          <CircularProgress :value="progressVal" />

          <CircularProgress :value="progressVal">
            <CircularProgress :diameter="24" :stroke="3" />
          </CircularProgress>

          <CircularProgress>
            <CircularProgress :diameter="32" :stroke="3">
              <CircularProgress :diameter="20" :stroke="2">
                <CircularProgress :diameter="8" :stroke="1" />
              </CircularProgress>
            </CircularProgress>
          </CircularProgress>
        </div>

        <LinearProgress />
        <LinearProgress :value="progressVal" />

        <Slider v-model="progressVal" />
        <Slider :values="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" />
        <Slider :values="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" show-label />
        <Slider show-value :step="5" />

        <MasterSlider v-model="progressVal">
          <template #icon>
            <Icon icon="material-symbols:variables-outline" :width="24" />
          </template>
          <span>Value</span>
        </MasterSlider>

        <WavyDivider />

        <Scroller>
          Hello there random user, thank you for using this web application, I
          hope it helped you in some way. What's this? Ah- this is a very long
          text that is used to test this Scroller component. It's so long, you
          can't see all of it because of the fact that the your browser window
          is very small and it can't display it all. It is sad that mobile users
          won't be able to see all of this meaningless text unless they waited
          for a long time. Well, if you can see this as a whole, you must have a
          long-ass monitor or had a multi-monitor setup. Hey you, yeah you,
          whose using 1920x1080 monitor, you can't un-zoom, that's cheating!.
          Anyways, thank you very much for using this app 감사합니다!.
        </Scroller>

        <WavyDivider />

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

        <div>
          <Button
            left-icon="material-symbols:settings-outline"
            right-icon="material-symbols:open-in-new"
            label="Settings"
          />
          <Button
            left-icon="material-symbols:queue-music"
            right-icon="material-symbols:open-in-new"
            variant="outline"
            label="Lyric"
          />
          <Button
            left-icon="material-symbols:upload-file-outline"
            right-icon="material-symbols:open-in-new"
            variant="subtle"
            label="Upload Lrc"
          />
          <Button
            left-icon="material-symbols:book-2-outline"
            right-icon="material-symbols:open-in-new"
            variant="transparent"
            label="Changelog"
          />

          <Button left-icon="material-symbols:fullscreen" label="Fullscreen" />
        </div>
        <div class="lang-controller">
          <TextInput
            placeholder="Language"
            left-icon="material-symbols:language"
            id="debug-lang"
            ref="langInput"
          />
          <Button label="Set Language" />
        </div>

        <Switch />
      </div>
    </template>
  </Layout>
</template>

<style lang="scss"></style>
