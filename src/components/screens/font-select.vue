<script setup lang="ts">
defineProps<{
	label: string | number
	value: string | number
}>()
</script>

<template>
  <div class="font-select" :style="{ fontFamily: value + '' }">
    {{ value }}
  </div>
</template>

<style lang="scss">
  .font-select {
    padding-inline: var(--lg);
  }
</style>
