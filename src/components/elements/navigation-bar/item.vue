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
  const index = ref<number>(0);
  const element = ref<HTMLElement | null>(null);
  const count = inject<Ref<number>>('count')!;
  const active = inject<Ref<number>>('activeItem')!;
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
    @click="() => (active = index)"
    class="nav-item special"
    :class="{ active: index == active }"
  >
    <div class="icon">
      <Icon :icon="icon" />
    </div>
    <div class="name">{{ name }}</div>
  </button>
</template>
