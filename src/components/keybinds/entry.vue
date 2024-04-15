<script setup lang="ts">
  import { type KeyBind, keyEquivalent } from './keys';

  defineProps<{
    keys: KeyBind;
    name?: string;
  }>();
</script>

<template>
  <div class="item">
    <div class="label">{{ name || keys.label }}</div>
    <template v-if="keys.special">
      <div class="key" v-if="keys.special[0]">CTRL</div>
      <div class="key" v-if="keys.special[1]">ALT</div>
      <div class="key" v-if="keys.special[2]">SHIFT</div>
      <div class="key" v-if="keys.special[3]">META</div>
    </template>
    <div class="key">
      {{ keyEquivalent[keys.key] || keys.key }}
    </div>
  </div>
</template>
