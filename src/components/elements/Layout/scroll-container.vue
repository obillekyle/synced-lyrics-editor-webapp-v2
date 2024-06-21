<script setup lang="ts">
  import { evaluate } from '@/api/util';
  import { onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      scrollable?: boolean;
      scrollChange?: (value: { x: number; y: number }) => void;
    }>(),
    {
      scrollable: true,
    }
  );

  const element = ref<HTMLElement | null>(null);
  const model = defineModel<{ x: number; y: number }>({
    default: { x: 0, y: 0 },
  });

  function onScroll() {
    if (element.value) {
      const x = element.value.scrollLeft;
      const y = element.value.scrollTop;
      model.value = { x, y };
      evaluate(props.scrollChange, model.value);
    }
  }

  watch(model, () => {
    if (element.value) {
      element.value.scrollTo(model.value.x, model.value.y);
    }
  });

  onMounted(() => {
    if (element.value) {
      element.value.addEventListener('scroll', onScroll);
    }
  });

  onBeforeUnmount(() => {
    if (element.value) {
      element.value.removeEventListener('scroll', onScroll);
    }
  });
</script>

<template>
  <div
    class="scroll-container"
    :class="{ scrollable: scrollable ?? true }"
    ref="element"
  >
    <div class="scroll-wrapper">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
  .scroll-container {
    overflow: auto;
    position: relative;
    display: block;
    height: 100%;
    width: 100%;

    &:has(.master-switch:first-child, .master-switch:nth-child(2)) {
      .master-switch {
        box-shadow: 0 calc(var(--size-xs) * -1) 0 var(--xl)
          var(--background-body);
      }
    }

    .scroll-wrapper {
      padding: var(--padding-md);
      width: 100%;
    }

    &:not(.scrollable) {
      overflow: hidden;
    }

    @media screen and (max-width: 800px) {
      scrollbar-width: none;
    }
  }
</style>
