<script setup lang="ts">
  import { getCSSColor, type AppColorString } from '@/api/util';
  import { title } from 'process';
  import { onMounted, ref, watch } from 'vue';

  const element = ref<HTMLElement>();

  const props = defineProps<{
    color: AppColorString<'color'>;
  }>();

  function setColor() {
    if (!element.value || !props.color) return;
    element.value!.style.setProperty('--color', getCSSColor(props.color));
  }

  watch(() => props.color, setColor);
  onMounted(() => setColor());
</script>

<template>
  <div class="color-block" ref="element" :title="props.color.toString()" />
</template>

<style lang="scss">
  .color-block {
    display: inline-block;
    min-width: var(--size-xs);
    min-height: var(--size-xs);
    background-color: var(--color);
  }
</style>
