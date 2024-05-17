<script setup lang="ts">
  import { type ButtonHTMLAttributes } from 'vue';

  import { Icon } from '@iconify/vue';

  interface NavigationItemProps
    extends /** @vue-ignore */ ButtonHTMLAttributes {
    name?: string;
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
    <div class="name">
      <slot>{{ name }}</slot>
    </div>
  </button>
</template>
