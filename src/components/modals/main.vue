<script setup lang="ts">
  import type { Modal, ModalActionsArgs } from '@/api/modals';
  import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
  import { Icon } from '@iconify/vue';
  import { addPX } from '@/api/util';
  import ModalItem from './modal-item.vue';

  const ModalService = window.app.modals;

  const closing = ref<number | string>('');
  const modal = shallowRef(ModalService.modals);

  function updateHandler() {
    modal.value = { ...ModalService.modals };
  }

  function closeHandler(id: string | number) {
    closing.value = id;

    setTimeout(() => {
      delete modal.value[id];
      closing.value = '';
    }, 300);
  }

  function modifyHandler(id: string | number, data: Modal) {
    modal.value[id] = data;
  }

  defineOptions({
    name: 'AppModals',
    inheritAttrs: false,
  });

  onMounted(() => {
    ModalService.addEventListener('opened', updateHandler);
    ModalService.addEventListener('closed', closeHandler);
    ModalService.addEventListener('modified', modifyHandler);
  });

  onUnmounted(() => {
    ModalService.removeEventListener('opened', updateHandler);
    ModalService.removeEventListener('closed', closeHandler);
    ModalService.removeEventListener('modified', modifyHandler);
  });
</script>

<template>
  <div class="app-modals">
    <ModalItem
      v-for="(item, key) in modal"
      :id="key"
      :key="key"
      :closing="closing == key"
    />
  </div>
</template>

<style lang="scss">
  .app-modals {
    position: fixed;
    inset: 0 0 0 0;
    z-index: 100;

    &:empty {
      display: none;
    }
  }

  @media screen and (max-width: 600px) {
    .app-modals .modal-backdrop {
      &[mobile-fullscreen='true'] .modal-wrapper {
        border-radius: 0;
        width: 100dvw;
        height: 100dvh;
        max-width: 100dvw;
        max-height: 100dvh;
      }
    }
  }
</style>
