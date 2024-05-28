<script setup lang="ts">
  import { inject, onMounted, ref, type Ref } from 'vue';

  const textAreaRef = ref<HTMLTextAreaElement | null>(null);
  const TextArea = inject<Ref<HTMLTextAreaElement | null>>('TextArea')!;

  defineOptions({
    inheritAttrs: false,
  });

  onMounted(() => {
    TextArea.value = textAreaRef.value;
  });
</script>

<template>
  <textarea
    v-bind="$attrs"
    autocorrect="off"
    autocomplete="off"
    spellcheck="false"
    autocapitalize="off"
    ref="textAreaRef"
  />
</template>
