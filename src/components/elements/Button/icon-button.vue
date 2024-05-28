<script setup lang="ts">
  import { Icon } from '@iconify/vue';
  import {
    type ButtonHTMLAttributes,
    type HTMLAttributes,
    type ReservedProps,
  } from 'vue';
  import { getCSSValue, rippleEffect, type AppSizes } from '@/api/util';
  import { as } from '../../keybinds/keys';

  interface IconButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
    icon: string;
    wrapper?: HTMLAttributes & ReservedProps;
    size?: AppSizes | number | String;
  }

  withDefaults(defineProps<IconButtonProps>(), {
    size: 'xs',
  });

  defineOptions({
    name: 'IconButton',
    inheritAttrs: false,
  });
</script>

<template>
  <button
    class="icon-button"
    v-bind="$attrs"
    :type="as<any>($attrs.type || 'button')"
  >
    <div class="icon-wrapper" v-bind="wrapper" @pointerdown="rippleEffect">
      <Icon
        :icon="icon"
        :style="{
          fontSize: getCSSValue(size, 'px', 'size'),
        }"
      />
    </div>
  </button>
</template>
