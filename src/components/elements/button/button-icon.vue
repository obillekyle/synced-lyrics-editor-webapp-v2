<script setup lang="ts">
  import { Icon } from '@iconify/vue';
  import { ref, type Component } from 'vue';

  defineProps<{
    class: string | string[] | Record<string, boolean> | undefined;
    icon: string | Component;
  }>();
</script>

<template>
  <div class="button-icon" :class="class">
    <Icon v-if="typeof icon == 'string'" :icon="icon" :width="24" />
    <component v-else="icon" :is="icon" />
  </div>
</template>
