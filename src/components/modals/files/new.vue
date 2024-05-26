<script setup lang="ts">
  import type { ModalActionsArgs } from '@/api/modals';
  import FileManager from '@/api/files';
  import TextInput from '@/components/elements/input/text-input.vue';
  import { inject, onMounted, ref, watch } from 'vue';

  const fns = inject<ModalActionsArgs>('fns')!;
  const fileName = ref<string>('');
  const files = window.app.files;

  const props = defineProps<{
    path: string;
    type: 'file' | 'folder';
  }>();

  async function createHandler() {
    if (FileManager.validName(fileName.value)) {
      const result =
        props.type == 'folder'
          ? await files.createFolder(props.path, fileName.value)
          : await files.createFile(props.path, fileName.value, new Blob([]));

      if (result) {
        fns.close();
      }
    }
  }

  watch(fileName, () => {
    fns.modify((modal) => {
      const actions = modal.actions;
      actions[1].disabled = !FileManager.validName(fileName.value);
      return { actions };
    });
  });

  onMounted(() => {
    fns.modify((modal) => {
      const actions = modal.actions;
      actions[1].onClick = createHandler;
      actions[1].disabled = true;
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
