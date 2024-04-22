<script setup lang="ts">
  defineProps<{
    length: number;
    max?: any;
  }>();
</script>

<template>
  <div class="counter">
    <span>{{ length }}</span>
    <span v-if="max">/{{ max }}</span>
  </div>
</template>
