<script setup lang="ts">
import type { ListItemType } from '@vue-material/core/List/types.js'

defineProps<ListItemType>()
</script>

<template>
  <div class="sort-item">
    <div class="label">{{ label }}</div>
  </div>
</template>
  