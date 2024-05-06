<script setup lang="ts">
  import {
    inject,
    mergeProps,
    onBeforeUnmount,
    onMounted,
    ref,
    type Ref,
  } from 'vue';

  import { isLeftHandSideExpression } from 'typescript';

  import { $, addPX, evaluate } from '@/api/util';
  import { Icon } from '@iconify/vue/dist/iconify.js';

  import type { ListItemType, ListProps } from './types';

  const props = defineProps<{
    index: number;
    props: any;
  }>();

  const parentProps = inject<ListProps>('parentProps')!;
  const swipeEvent = ref<PointerEvent | null>(null);
  const arrangeEvent = ref<PointerEvent | null>(null);
  const items = inject<Ref<ListItemType[]>>('items')!;
  const content = ref<HTMLElement | null>(null);
  const wrapper = ref<HTMLElement | null>(null);
  const value = ref(0);
  const lastTop = ref(0);

  function pointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (!content.value) return;
    if (target.matches('.draggable')) return;
    if (parentProps.swipe === 'off') return;
    content.value.style.transition = 'none';
    swipeEvent.value = e;
  }

  function pointerMove(e: PointerEvent) {
    if (!swipeEvent.value) return;
    if (swipeEvent.value.pointerId == e.pointerId) {
      document.body.style.cursor = 'grabbing';
      const element = content.value!;
      let offset = 0;

      if (e.pointerType === 'touch' && (e as any).touches) {
        const touches = (e as any).touches as PointerEvent[];
        offset = touches[0].clientX - swipeEvent.value!.clientX;
      } else {
        offset = e.clientX - swipeEvent.value!.clientX;
      }

      element.style.left = addPX(Math.abs(offset) > 32 ? offset : 0);
      value.value = offset;
    }
  }

  function dismiss() {
    const element = content.value!;
    element.style.removeProperty('transition');
    element.style.left = value.value > 0 ? '100%' : '-100%';
    evaluate(parentProps.onDismiss, props.index);

    setTimeout(() => {
      items.value.splice(props.index, 1);
    }, 200);
  }

  function pointerUp(e: PointerEvent) {
    if (!swipeEvent.value) return;
    if (e.pointerId == swipeEvent.value?.pointerId) {
      swipeEvent.value = null;
      document.body.style.removeProperty('cursor');
      const distance = parentProps.swipeDistance ?? 200;
      const element = content.value!;

      if (Math.abs(value.value) >= distance) {
        if (parentProps.swipe === 'dismiss') {
          dismiss();
          return;
        }
        if (parentProps.swipe === 'custom') {
          if (value.value > 0) {
            evaluate(parentProps.swipeOptions?.left.handler, props.index);
          } else {
            evaluate(parentProps.swipeOptions?.right.handler, props.index);
          }
        }
      }
      element.style.removeProperty('transition');
      element.style.left = '0px';
    }
  }

  function dragUp(e: PointerEvent) {
    if (e.pointerId != arrangeEvent.value?.pointerId) return;
    const element = wrapper.value!;
    arrangeEvent.value = null;
    element.style.removeProperty('transition');
    element.style.top = addPX(props.index * 56);
    document.body.style.removeProperty('cursor');
    lastTop.value = props.index * 56;
    console.log('up');
  }

  function dragMove(e: PointerEvent) {
    if (!arrangeEvent.value) return;
    if (arrangeEvent.value.pointerId == e.pointerId) {
      const element = wrapper.value!;
      document.body.style.cursor = 'grabbing';

      const offset = e.clientY - arrangeEvent.value!.clientY;

      const y = lastTop.value + offset;
      const index = Math.floor(y / 56);

      if (index !== props.index) {
        items.value.splice(index, 0, items.value.splice(props.index, 1)[0]);
      }

      element.style.top = addPX(y);
    }
  }

  function dragDown(e: PointerEvent) {
    if (!wrapper.value) return;
    if (!parentProps.sortable) return;
    wrapper.value.style.transition = 'none';

    arrangeEvent.value = e;
  }

  onMounted(() => {
    document.addEventListener('pointermove', pointerMove);
    document.addEventListener('pointerup', pointerUp);
    document.addEventListener('pointercancel', pointerUp);

    document.addEventListener('pointermove', dragMove);
    document.addEventListener('pointerup', dragUp);
    document.addEventListener('pointerleave', dragUp);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('pointermove', pointerMove);
    document.removeEventListener('pointerup', pointerUp);
    document.removeEventListener('pointercancel', pointerUp);

    document.removeEventListener('pointermove', dragMove);
    document.removeEventListener('pointerup', dragUp);
    document.removeEventListener('pointerleave', dragUp);
  });
</script>

<template>
  <div
    ref="wrapper"
    class="list-item"
    @pointerdown="pointerDown"
    :style="{ top: addPX(index * 56) }"
  >
    <div class="list-content" ref="content" :data-index="props.index">
      <component :is="parentProps.listComp" v-bind="props.props" />
      <div
        class="draggable"
        @pointerdown="dragDown"
        v-if="parentProps.sortable"
      >
        <Icon icon="material-symbols:drag-handle" :width="24" />
      </div>
    </div>
    <div class="swipe-indicator" v-if="parentProps.swipe === 'custom'">
      <div
        :key="k"
        :class="k"
        v-for="(i, k) in parentProps.swipeOptions"
        :style="{ background: i.color }"
        v-show="k == 'left' ? value > 0 : value < 0"
      >
        <Icon v-if="typeof i.icon == 'string'" :icon="i.icon" :width="24" />
        <component v-else :is="i.icon" />
      </div>
    </div>
  </div>
</template>
