<script setup lang="ts">
import { useScreen } from '@/hooks/use-screen'
import editScreen from './edit.vue'
import homeScreen from './home.vue'
import previewScreen from './lyric.vue'
import timingScreen from './timing.vue'

const screen = useScreen()
</script>

<template>
  <div class="app-main-content">
    <home-screen v-if="screen == 'home'" />
    <edit-screen v-if="screen == 'edit'" />
    <timing-screen v-if="screen == 'timing'" />
    <preview-screen v-if="screen == 'lyric'" />
  </div>
</template>

<style lang="scss">
  .app-main-content {
    display: grid;
    align-items: center;
    height: 100%;
    > * {
      transform: translateY(48px);
      animation: slide-up 0.3s var(--timing-standard) forwards;
    }

    @keyframes slide-up {
      100% {
        transform: translateY(0);
      }
    }

    &:has(.edit-screen, .debug-screen) {
      padding-block: 0;
      padding: var(--md);
    }
  }
</style>
