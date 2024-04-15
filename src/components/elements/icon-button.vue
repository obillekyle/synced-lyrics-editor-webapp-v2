<script setup lang="ts">
  import { Icon } from '@iconify/vue';
  import {
    type ButtonHTMLAttributes,
    type HTMLAttributes,
    type ReservedProps,
  } from 'vue';
  import { rippleEffect } from '@/api/util';
  import { as } from '../keybinds/keys';

  interface IconButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
    icon: string;
    div?: HTMLAttributes & ReservedProps;
    size?: number;
  }

  withDefaults(defineProps<IconButtonProps>(), {
    size: 24,
  });

  defineOptions({
    inheritAttrs: false,
  });
</script>

<template>
  <button
    class="icon-button"
    v-bind="$attrs"
    :type="as<any>($attrs.type || 'button')"
  >
    <div class="wrapper" v-bind="div" :onclick="rippleEffect">
      <Icon :icon="icon" :width="size" />
    </div>
  </button>
</template>

