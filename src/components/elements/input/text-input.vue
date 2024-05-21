<script setup lang="ts">
  import './input.scss';

  import {
    type Component,
    type InputHTMLAttributes,
    onMounted,
    ref,
    type Ref,
    onBeforeMount,
  } from 'vue';

  import Counter from './counter.vue';
  import InputIcon from './input-icon.vue';

  interface InputText extends /** @vue-ignore */ InputHTMLAttributes {
    leftIcon?: string | Component;
    rightIcon?: string | Component;
    defaultValue?: string;
    modelValue?: Ref<string>;
    span?: boolean;
  }

  const input = ref<HTMLInputElement | null>(null);
  const props = defineProps<InputText>();
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
  >
    <InputIcon v-if="leftIcon" class="left-icon" :icon="leftIcon" />
    <div class="input">
      <input type="text" v-bind="$attrs" v-model="model" ref="input" />
      <Counter :length="model.length" :max="$attrs.maxlength" />
    </div>
    <InputIcon v-if="rightIcon" class="right-icon" :icon="rightIcon" />
  </div>
</template>
