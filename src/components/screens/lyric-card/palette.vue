<script setup lang="ts">
import { parseColors } from '@vue-material/core'

const props = defineProps<{
	color: string
	selected?: boolean
}>()

const color = parseColors(props.color)
</script>

<template>
  <div
    :selected="selected || undefined"
    class='palette'
    :style="{
      '--primary': color.primary.hex,
      '--secondary': color.secondary.hex,
      '--tertiary': color.tertiary.hex
    }"
  >

    <div class="main-color"/>
    <div class="sec-color"/>
    <div class="ter-color"/>
  </div>
</template>

<style lang="scss" scoped>
  .palette {
    width: 64px;
    height: 64px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    border-radius: 999px;
    overflow: hidden;
    background: none;
    cursor: pointer;
    grid-template-areas: 
      'main main'
      'sec ter';
    .main-color {
      background-color: var(--primary);
      grid-area: main;
      z-index: -1;
    }
    .sec-color {
      background-color: var(--secondary);
      grid-area: sec;
      z-index: -1;
    }
    .ter-color {
      background-color: var(--tertiary);
      grid-area: ter;
      z-index: -1;
    }

    &[selected] {
      cursor: default;
      box-shadow: 0 0 0 2px inset var(--primary),
        0 0 0 4px inset var(--surface);
    }
  }
</style>