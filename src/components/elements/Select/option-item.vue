<script setup lang="ts">
  defineProps<{
    name: string;
    id: string | number;
  }>();
</script>

<template>
  <div :data-id="id" class="option-item">{{ name }}</div>
</template>

<style lang="scss">
  .option-item {
    padding-inline: 1rem;
    cursor: pointer;
    user-select: none;
  }
</style>
