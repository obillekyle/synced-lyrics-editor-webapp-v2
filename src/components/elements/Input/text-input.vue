<script setup lang="ts">
  import './input.scss';

  import {
    type Component,
    type InputHTMLAttributes,
    ref,
    type Ref,
    onBeforeMount,
  } from 'vue';

  import Counter from './counter.vue';
  import InputIcon from './input-icon.vue';
  import { getCSSValue, type AppSizes } from '@/api/util';

  interface InputText
    extends /** @vue-ignore */ Omit<InputHTMLAttributes, 'height'> {
    leftIcon?: string | Component;
    rightIcon?: string | Component;
    defaultValue?: string;
    radius?: 'rounded' | AppSizes | String | number;
    height?: AppSizes | String | number;
    counter?: boolean;
    span?: boolean;
  }

  const input = ref<HTMLInputElement | null>(null);
  const props = withDefaults(defineProps<InputText>(), {
    height: 'xl',
    radius: 'sm',
    span: false,
    counter: false,
  });
  const model = defineModel<string>({
    default: '',
  });

  onBeforeMount(() => {
    model.value ??= props.defaultValue ?? '';
  });

  defineExpose({
    value: model,
    input: input,
  });
</script>

<template>
  <div
    class="input-wrapper"
    :class="{ 'span-input': props.span }"
    @click="() => input?.focus()"
    :style="{
      '--radius': `${getCSSValue(props.radius)}`,
      '--height': `${getCSSValue(props.height, 'px', 'size')}`,
    }"
  >
    <InputIcon v-if="leftIcon" class="left-icon" :icon="leftIcon" />
    <div class="input">
      <input type="text" v-bind="$attrs" v-model="model" ref="input" />
      <Counter v-if="counter" :length="model.length" :max="$attrs.maxlength" />
    </div>
    <InputIcon v-if="rightIcon" class="right-icon" :icon="rightIcon" />
  </div>
</template>
