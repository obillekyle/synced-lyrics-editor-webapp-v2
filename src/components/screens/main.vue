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

