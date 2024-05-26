<script setup lang="ts">
  import type { ModalActionsArgs } from '@/api/modals';
  import TextInput from '@/components/elements/input/text-input.vue';
  import { inject, onMounted, ref, watch } from 'vue';

  const fns = inject<ModalActionsArgs>('fns')!;
  const fileName = ref<string>('');

  const props = defineProps<{
    name: string;
    type: 'file' | 'folder';
    rename: (name: string) => Promise<boolean>;
  }>();

  async function renameHandler() {
    if (fileName.value === '') return;
    if (fileName.value === props.name) return;
    if (await props.rename(fileName.value)) {
      fns.close();
    }
  }

  onMounted(() => {
    fileName.value = props.name;
    fns.modify((modal) => {
      const actions = modal.actions;

      actions[1].onClick = () => {
        renameHandler();
      };

      return { actions };
    });
  });

  watch(fileName, () => {
    fns.modify((modal) => {
      const actions = modal.actions;
      actions[1].disabled =
        fileName.value === '' || fileName.value === props.name;

      return { actions };
    });
  });
</script>

<template>
  <div class="rename">
    <TextInput
      span
      type="text"
      v-model="fileName"
      :left-icon="`material-symbols:${type}-outline`"
    />
  </div>
</template>
