<script setup lang="ts">
  import { reactive } from "vue";

  withDefaults(
    defineProps<{
      direction: "x" | "y";
      size?: number | string;
      margin?: "sm" | "md" | "lg" | "xl" | String;
    }>(),
    {
      direction: "x",
      margin: "md",
      size: "100%"
    }
  );
</script>

<template>
  <div
    :class="{
      divider: true,
      [direction]: true
    }"
    :style="{
      '--size': typeof size == 'number' ? size + 'px' : size,
      '--margin': `var(--${margin})`
    }"
  />
</template>

<style>
  .divider {
    align-self: center;
    justify-self: center;
    display: block;
    background-color: #7777;
  }

  .divider.x {
    height: 1px;
    width: var(--size);
    margin-block: var(--margin);
  }

  .divider.y {
    width: 1px;
    height: var(--size);
    margin-inline: var(--margin);
  }
</style>
