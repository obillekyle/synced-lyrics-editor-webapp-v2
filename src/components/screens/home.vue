p
<script setup lang="ts">
  import { onMounted } from 'vue';
  import Divider from '../elements/divider.vue';
  import { Icon } from '@iconify/vue/dist/iconify.js';

  type Section = {
    icon?: string;
    shortcut?: string;
    label: any;
  };

  const home: Section[] = [
    {
      icon: 'material-symbols:upload',
      shortcut: 'Ctrl + M',
      label: 'to open a music file',
    },
    {
      icon: 'material-symbols:upload-file-outline',
      shortcut: 'Ctrl + L',
      label: 'to open an existing lyric file',
    },
    {
      icon: 'material-symbols:download-sharp',
      shortcut: 'Ctrl + S',
      label: 'to save the synced lrc file to your device',
    },
    {
      icon: 'material-symbols:edit-outline',
      shortcut: 'Ctrl + E',
      label: 'to paste or edit your lyrics',
    },
    {
      icon: 'material-symbols:hourglass-empty',
      shortcut: 'Ctrl + R',
      label: 'to adjust the timing of your lyrics',
    },
    {
      icon: 'material-symbols:queue-music',
      shortcut: 'Ctrl + P',
      label: 'to preview the synced lyrics',
    },
    {
      icon: 'material-symbols:keyboard-outline',
      shortcut: 'Ctrl + /',
      label: 'to show the keybinds',
    },
  ];
</script>

<template>
  <div class="home">
    <div class="logo-wrapper">
      <img src="/favicon.svg" alt="Lyric" width="96" />
      <div class="title">Synced Lyrics Editor</div>
    </div>

    <div class="description">
      Create your own synced lyrics for the music you love right from your
      browser. A sound file is required
    </div>

    <Divider direction="x" margin="xl" />

    <div class="section" v-for="(item, index) in home" :key="index">
      <Icon v-if="item.icon" :icon="item.icon" :width="24" />
      <kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
      <p>{{ item.label }}</p>
    </div>

    <Divider direction="x" margin="xl" />
  </div>
</template>

<style lang="scss" scoped>
  .home {
    min-height: 100%;
    width: clamp(0px, 400px, 100%);
    margin-inline: auto;
    padding: var(--md);

    .logo-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;

      .title {
        font-weight: 600;
        font-size: var(--size-xs);
        margin-inline-start: var(--sm);
        margin-top: var(--sm);
        width: 9ch;
        text-transform: uppercase;
        line-height: 0.8;
        text-wrap: balance;
        border-left: 5px solid var(--color-600);
        padding-left: var(--md);
      }
    }

    .description {
      font-size: var(--font-lg);
      text-align: center;
      text-wrap: balance;
      margin-top: var(--md);
      color: var(--mono-900);
    }

    .section {
      display: grid;
      grid-template-columns: auto auto 1fr;
      align-items: center;
      width: 100%;
      max-width: 400px;
      gap: var(--sm);
      p {
        margin-block: 6px;
      }
      kbd {
        text-wrap: nowrap;
        background: var(--mono-100);
        border: 1px solid var(--mono-200);
        padding: 6px;
        font-family: JetBrains Mono;
        font-size: 14px;
        border-radius: 4px;
      }
    }
  }
</style>
