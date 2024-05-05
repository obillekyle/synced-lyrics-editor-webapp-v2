<script setup lang="ts">
  import { type Component, onMounted, onUnmounted, ref, watch } from 'vue';

  const I18N = window.app.i18n;

  const props = withDefaults(
    defineProps<{
      entry: string;
      fallback?: string;
      args?: any[];
      element?: Component | string;
    }>(),
    {
      element: 'span',
    }
  );

  watch(props, () => {
    updateText();
  });

  const text = ref('');

  function updateText() {
    const value = I18N.get(props.entry, props.args);
    if (value === props.entry) {
      text.value = props.fallback || props.entry;
    } else {
      text.value = value;
    }
  }

  onMounted(() => {
    updateText();
    I18N.attach('update', updateText);
  });

  onUnmounted(() => {
    I18N.detach('update', updateText);
  });
</script>

<template>
  <component :is="element" class="i18n-string">{{ text }}</component>
</template>
