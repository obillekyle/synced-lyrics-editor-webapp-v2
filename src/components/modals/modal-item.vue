<script setup lang="ts">
  import type { Modal, ModalActionsArgs } from '@/api/modals';
  import { addPX } from '@/api/util';
  import { Icon } from '@iconify/vue/dist/iconify.js';
  import { computed, onMounted, provide, ref, shallowRef } from 'vue';
  import Button from '../elements/button/button.vue';

  const ModalService = window.app.modals;

  const props = defineProps<{
    id: string | number;
    closing: boolean;
  }>();

  const modal = shallowRef<Modal>(ModalService.get(props.id)!);
  const fns = computed<ModalActionsArgs>(() => ({
    id: props.id,
    self: modal.value!,
    close: () => ModalService.close(props.id),
    modify: (modal) => ModalService.modify(props.id, modal),
  }));

  provide('fns', fns.value);
  provide('modal', ModalService.get(props.id));

  function closeFromBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      ModalService.close(props.id);
    }
  }

  const primaryActions = computed(() => {
    return modal.value.actions.filter(
      (action) => action.role == 'primary' || action.role === undefined
    );
  });
  const secondaryActions = computed(() => {
    return modal.value.actions.filter((action) => action.role == 'secondary');
  });

  function updateHandler(id: string | number) {
    if (id != props.id) return;
    modal.value = { ...ModalService.get(props.id)! };
  }

  onMounted(() => {
    updateHandler(props.id);
    ModalService.addEventListener('modified', updateHandler);
  });

  defineOptions({
    name: 'ModalItem',
    inheritAttrs: false,
  });
</script>

<template>
  <div
    :data-id="id"
    class="modal-backdrop"
    :class="{ closing }"
    @click="closeFromBackdrop"
    :no-wrapper-spacing="modal.options.noWrapperSpacing"
    :mobile-fullscreen="modal.options.mobileFullscreen"
    :style="{
      '--modal-width': modal.options.width && addPX(modal.options.width),
      '--modal-height': modal.options.height && addPX(modal.options.height),
    }"
  >
    <div :data-id="id" class="modal-wrapper">
      <Icon class="icon" v-if="modal.icon" :icon="modal.icon" :width="36" />
      <div class="title" v-if="modal.title">{{ modal.title }}</div>
      <div class="content">
        <div class="content-wrapper">
          <template v-if="typeof modal.content == 'string'">
            {{ modal.content }}
          </template>
          <component v-else :is="modal.content" />
        </div>
      </div>
      <div class="actions" v-if="modal.actions.length">
        <div class="primary">
          <Button
            :key="key"
            :role="action.role"
            :title="action.text"
            :label="action.text"
            :disabled="action.disabled"
            @click="() => action.onClick.call(ModalService, fns)"
            :variant="action.role == 'primary' ? 'filled' : 'subtle'"
            v-for="(action, key) in primaryActions"
          />
        </div>
        <div class="secondary">
          <Button
            :key="key"
            variant="outline"
            :role="action.role"
            :title="action.text"
            :label="action.text"
            :disabled="action.disabled"
            @click="() => action.onClick.call(ModalService, fns)"
            v-for="(action, key) in secondaryActions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .modal-backdrop {
    display: grid;
    place-items: center;
    position: absolute;
    overflow: hidden;
    inset: 0 0 0 0;
    background: #0004;

    &.closing .modal-wrapper {
      scale: 1;
      opacity: 1;
      animation: modal-close 0.2s forwards;
    }

    &[no-wrapper-spacing='true'] {
      .content {
        padding: 0px;
      }
    }
  }

  .modal-wrapper {
    position: absolute;
    margin-block: auto;
    margin-inline: auto;
    overflow: hidden;

    scale: 0.9;
    opacity: 0.3;
    border-radius: var(--lg);
    background-color: var(--app-modal-color);
    display: grid;

    height: var(--modal-height);
    min-width: clamp(0px, var(--modal-width, 400px), calc(100dvw - var(--xl)));
    max-width: clamp(0px, var(--modal-width, 768px), calc(100dvw - var(--xl)));
    max-height: calc(100dvh - var(--xl));

    grid-template-areas:
      'icon'
      'title'
      'content'
      'actions';
    grid-template-rows: auto auto 1fr auto;
    animation: modal-open 0.3s forwards;

    > .icon {
      grid-area: icon;
      justify-self: center;
    }

    > * + * {
      margin-top: var(--sm);
    }

    > .title {
      font-size: var(--header-size);
      font-weight: var(--header-weight);
      text-align: center;
      grid-area: title;
    }

    > .content {
      font-size: var(--body-size);
      grid-area: content;
      overflow: overlay;
      text-align: center;
      padding: var(--xl);
      > .content-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--sm);
        & > * {
          text-align: initial;
        }
      }
    }

    &:has(> .icon, > .title) {
      padding-top: var(--xl);
    }

    > .actions {
      display: grid;
      grid-area: actions;
      padding: var(--md);
      padding-bottom: var(--xl);
      grid-template-areas: 'secondary primary';
      grid-template-columns: auto 1fr;
      .primary {
        margin-left: auto;
        display: flex;
        flex-wrap: nowrap;
        grid-area: primary;
      }
      .secondary {
        grid-area: secondary;
        display: flex;
        flex-wrap: nowrap;
      }
    }
  }

  @keyframes modal-open {
    0% {
      scale: 0.9;
      opacity: 0.3;
    }
    100% {
      scale: 1;
      opacity: 1;
    }
  }

  @keyframes modal-close {
    0% {
      scale: 1;
      opacity: 1;
    }
    100% {
      scale: 0.9;
      opacity: 0;
    }
  }
</style>
