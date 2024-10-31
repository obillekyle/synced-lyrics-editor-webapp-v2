<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js'
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
      '--color': color.primary.shade(40),
      '--primary': color.primary.hex,
      '--secondary': color.secondary.hex,
      '--tertiary': color.tertiary.hex
    }"
  >

    <div class="main-color"/>
    <div class="sec-color"/>
    <div class="ter-color"/>
    <div class="checkmark" v-if="selected">
      <Icon icon="material-symbols:check" width="32" />
    </div>  
  </div>
</template>

<style lang="scss" scoped>
  .palette {
    width: 64px;
    height: 64px;
    display: grid;
    position: relative;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    border-radius: 999px;
    overflow: hidden;
    background: none;
    cursor: pointer;
    transition: box-shadow 0.2s;
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
      box-shadow: 0 0 0 2px inset var(--color),
        0 0 0 4px inset var(--surface);
    }

    .checkmark {
      inset: 0;
      display: grid;
      position: absolute;
      place-items: center;
      color: var(--on-surface);
      filter: drop-shadow(0 0 1px var(--surface));
    }
  }
</style>