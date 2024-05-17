<script setup lang="ts">
  import { onMounted, ref, watch, type Component } from 'vue';

  const text = ref('');
  const props = defineProps<{
    text: Promise<string>;
    fallback?: string;
    element?: Component | string;
  }>();

  onMounted(async () => {
    const value = await props.text;
    text.value = value;
  });

  watch(props, async () => {
    const value = await props.text;
    text.value = value;
  });
</script>

<template>
  <component :is="props.element ?? 'span'" v-if="text">{{ text }}</component>
</template>
