<script setup lang="ts">
  import { Icon } from '@iconify/vue';
  import { ref, type Component } from 'vue';

  defineProps<{
    icon: string | Component;
  }>();
</script>

<template>
  <div class="button-icon">
    <Icon v-if="typeof icon == 'string'" :icon="icon" :width="24" />
    <component v-else="icon" :is="icon" />
  </div>
</template>
