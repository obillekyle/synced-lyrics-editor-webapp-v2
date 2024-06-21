<script setup lang="ts">
  defineProps<{
    center?: boolean;
  }>();
</script>

<template>
  <div class="nav-container" v-if="center">
    <slot />
  </div>
  <slot v-else />
</template>
