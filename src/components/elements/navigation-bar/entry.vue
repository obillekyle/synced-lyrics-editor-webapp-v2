<script setup lang="ts">
  import {
    ref,
    watch,
    inject,
    onMounted,
    type Ref,
    type ButtonHTMLAttributes,
    onUnmounted,
  } from 'vue';
  import { Icon } from '@iconify/vue';

  interface NavigationItemProps
    extends /** @vue-ignore */ ButtonHTMLAttributes {
    name: string;
    icon: string;
  }

  defineProps<NavigationItemProps>();

  defineOptions({
    name: 'NavigationEntry',
    inheritAttrs: false,
  });
</script>

<template>
  <button ref="element" v-bind="$attrs" class="nav-item">
    <div class="icon">
      <Icon :icon="icon" />
    </div>
    <div class="name">{{ name }}</div>
  </button>
</template>
