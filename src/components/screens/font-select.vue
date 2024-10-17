<script setup lang="ts">
defineProps<{
	id: string | number
	name: string
}>()
</script>

<template>
  <div class="font-select" :style="{ fontFamily: name }">
    {{ name }}
  </div>
</template>

<style lang="scss">
  .font-select {
    padding-inline: var(--lg);
  }
</style>
