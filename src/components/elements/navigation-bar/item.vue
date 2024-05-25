<script setup lang="ts">
  import {
    type ButtonHTMLAttributes,
    inject,
    onMounted,
    onUnmounted,
    ref,
    type Ref,
    watch,
  } from 'vue';

  import { Icon } from '@iconify/vue';
  import { evaluate } from '@/api/util';
  import type { NavigationBarProps } from './type';

  interface NavigationItemProps
    extends /** @vue-ignore */ ButtonHTMLAttributes {
    name?: string;
    icon: string;
    value?: number;
  }

  const props = defineProps<NavigationItemProps>();
  const index = ref<number>(0);
  const element = ref<HTMLElement | null>(null);
  const count = inject<Ref<number>>('count')!;
  const parentProps = inject<NavigationBarProps>('parent-props')!;
  const parent = inject<Ref<HTMLDivElement | null>>('parent')!;

  defineOptions({
    name: 'NavigationItem',
    inheritAttrs: false,
  });

  function updateIndex() {
    if (parent.value) {
      index.value = Array.from(parent.value.children)
        .filter((e) => e.matches('button.nav-item'))
        .indexOf(element.value!);
    }
  }

  function setValue() {
    if (parentProps.active !== (props.value ?? index.value)) {
      evaluate(parentProps.change, props.value ?? index.value);
    }
  }

  watch(count, updateIndex);

  onMounted(() => {
    count.value += 1;
    updateIndex();
  });

  onUnmounted(() => {
    count.value -= 1;
  });
</script>

<template>
  <button
    ref="element"
    v-bind="$attrs"
    @click="setValue"
    class="nav-item special"
    :class="{ active: (value ?? index) == parentProps.active }"
  >
    <div class="icon">
      <Icon :icon="icon" />
    </div>
    <div class="name">
      <slot>{{ name }}</slot>
    </div>
  </button>
</template>
