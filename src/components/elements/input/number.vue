<script setup lang="ts">
  import './input.scss';
  import { Icon } from '@iconify/vue/dist/iconify.js';
  import {
    type Component,
    type InputHTMLAttributes,
    type Ref,
    onMounted,
    ref,
    watch,
    useAttrs,
  } from 'vue';
  import InputIcon from './input-icon.vue';
  import Counter from './counter.vue';
  import NumberArrows from './number-arrows.vue';

  interface InputText extends /** @vue-ignore */ InputHTMLAttributes {
    leftIcon?: string | Component;
    defaultValue?: number;
    modelValue?: Ref<number>;
  }

  const input = ref<HTMLInputElement | null>(null);
  const props = defineProps<InputText>();
  const model = defineModel<number>({
    default: 0,
  });

  const attrs = useAttrs();

  watch(model, (val) => {
    const min = Number(attrs.min);
    const max = Number(attrs.max);

    if (isFinite(max)) {
      if (val > max) {
        model.value = max;
      }
    }

    console.log(val);

    if (isFinite(min)) {
      if (min > val) {
        model.value = min;
      }
    }
  });

  onMounted(() => {
    model.value = props.modelValue?.value
      ? props.modelValue?.value
      : props.defaultValue ?? 0;
  });
</script>

<template>
  <div class="input-wrapper" @click="() => input?.focus()">
    <InputIcon v-if="leftIcon" class="left-icon" :icon="leftIcon" />
    <div class="input">
      <input type="number" v-bind="$attrs" v-model="model" ref="input" />
      <NumberArrows v-model="model" />
    </div>
  </div>
</template>
