<script setup lang="ts">
  import { ref } from 'vue';

  import I18nString from '../elements/i18n-string.vue';

  const Player = window.app.player;
  const presets = ref([true, true, true]);
  const fileName = ref(getPreset(presets.value));
  const activeMode = ref<0 | 1>(0);

  function getPreset(preset: boolean[]) {
    const details = Player.getDetails();

    let text = '';
    let [artist, title, ext] = preset;
    text += artist ? details.artist || '' : '';
    text += artist && title ? ' - ' : '';
    text += title ? details.title || '' : '';
    text += title && ext ? '.lrc' : '';

    return text;
  }

  function changeMode(mode: 0 | 1) {
    activeMode.value = mode;

    if (mode == 0) {
      fileName.value = getPreset(presets.value);
    }
  }

  function togglePreset(index: number, value?: boolean) {
    if (activeMode.value == 1) {
      const details = Player.getDetails();

      switch (index) {
        case 0:
          fileName.value += details.artist || '';
          break;
        case 1:
          fileName.value += details.title || '';
          break;
        case 2:
          fileName.value += '.lrc';
          break;
      }
      return;
    }

    value !== undefined
      ? (presets.value[index] = value)
      : (presets.value[index] = !presets.value[index]);

    fileName.value = getPreset(presets.value);
  }
</script>

<template>
  <div class="button-group mode" :data-mode="activeMode">
    <I18nString
      entry="PRESETS"
      class="chip-button"
      :onclick="() => changeMode(0)"
    />
    <I18nString
      entry="BUILDER"
      class="chip-button"
      :onclick="() => changeMode(1)"
    />
  </div>

  <div class="button-group preset">
    <I18nString
      element="button"
      :class="['chip-button', presets[0] && 'active']"
      :onclick="() => togglePreset(0)"
      entry="PLAYER_ARTIST"
    />

    <I18nString
      element="button"
      entry="PLAYER_AUDIO_TITLE"
      :class="['chip-button', presets[1] && 'active']"
      :onclick="() => togglePreset(0)"
    />
    <button
      :class="['chip-button', presets[2] && 'active']"
      :onclick="() => togglePreset(2)"
    >
      .lrc
    </button>
  </div>

  <input
    id="fileName"
    type="text"
    :value="fileName"
    @change="
      (event) => {
        const input = event.target as HTMLInputElement;
        fileName = input!.value;
      }
    "
    :disabled="!activeMode"
  />
</template>
