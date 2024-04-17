<script setup lang="ts">
  import type { ModalActionsArgs, ModalArgs } from '@/api/modals';
  import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
  import { Icon } from '@iconify/vue';
  import { addPX } from '@/api/util';
  import './_modals.scss';

  const ModalService = window.app.modals;

  const closing = ref<number | string>('');
  const modal = shallowRef(ModalService.modals);
  const update = () => {
    modal.value = { ...ModalService.modals };
  };

  function updateModals(...args: ModalArgs) {
    const [event, key, value] = args;
    if (event != 'closed') update();
    setTimeout(() => {
      closing.value = '';
      update();
    }, 300);
  }

  function getModalFNs(id: string | number): ModalActionsArgs {
    return {
      id,
      close: () => {
        closing.value = id;
        ModalService.close(id);
      },
      modify: (modal) => ModalService.modify(id, modal),
    };
  }

  defineOptions({
    name: 'AppModals',
    inheritAttrs: false,
  });

  onMounted(() => ModalService.addEventListener('updated', updateModals));
  onUnmounted(() => ModalService.removeEventListener('updated', updateModals));
</script>

<template>
  <div class="app-modals">
    <div
      class="backdrop"
      v-for="(item, id) in modal"
      :key="id"
      :onClick="
        ({ currentTarget, target }) =>
          target == currentTarget && getModalFNs(id).close()
      "
    >
      <div
        :data-id="id"
        :class="['modal', closing !== id || 'closing']"
        :no-wrapper-spacing="item.options.noWrapperSpacing"
        :mobile-fullscreen="item.options.mobileFullscreen"
        :style="{
          '--modal-width': item.options.width && addPX(item.options.width),
          '--modal-height': item.options.height && addPX(item.options.height),
        }"
      >
        <icon v-if="item.icon" class="icon" :icon="item.icon" :width="36" />
        <div class="title" v-if="item.title">{{ item.title }}</div>
        <div class="content">
          <div class="wrapper">
            <template v-if="typeof item.content == 'string'">
              {{ item.content }}
            </template>
            <component v-else :is="item.content" :actions="getModalFNs(id)" />
          </div>
        </div>
        <div class="actions" v-if="item.actions.length">
          <div class="primary">
            <template v-for="(action, key) in item.actions" :key="key">
              <button
                :key="key"
                :role="action.role"
                :title="action.text"
                v-text="action.text"
                v-if="action.role != 'secondary'"
                @click="
                  () => action.onClick.call(ModalService, getModalFNs(id))
                "
              />
            </template>
          </div>
          <div class="secondary">
            <template v-for="(action, key) in item.actions" :key="key">
              <button
                :key="key"
                :role="action.role"
                :title="action.text"
                v-text="action.text"
                v-if="action.role == 'secondary'"
                @click="
                  () => action.onClick.call(ModalService, getModalFNs(id))
                "
              />
            </template>
          </div>
        </div>
      </div>
    </div>
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
    .backdrop {
      display: grid;
      place-items: center;
      position: absolute;
      overflow: hidden;
      inset: 0 0 0 0;
      background: #0004;
    }
    .modal {
      position: absolute;
      margin-block: auto;
      margin-inline: auto;
      overflow: hidden;
      scale: 0.9;
      opacity: 0.3;
      border-radius: var(--lg);
      background-color: var(--app-modal-color);
      display: grid;
      min-width: clamp(
        0px,
        var(--modal-width, 400px),
        calc(100dvw - var(--xl))
      );
      min-height: var(--modal-height);
      max-width: clamp(
        0px,
        var(--modal-width, 768px),
        calc(100dvw - var(--xl))
      );
      max-height: calc(100dvh - var(--xl));
      grid-template-areas:
        'icon'
        'title'
        'content'
        'actions';
      grid-template-rows: auto auto 1fr auto;
      animation: modal-open 0.3s forwards;

      > * + * {
        margin-top: var(--sm);
      }

      &.closing {
        scale: 1;
        opacity: 1;
        animation: modal-close 0.3s forwards;
      }

      > .icon {
        grid-area: icon;
        justify-self: center;
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
        .wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--sm);
          & > * {
            text-align: initial;
          }
        }
      }

      &[no-wrapper-spacing='true'] {
        .content {
          padding: 0px;
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
        button {
          display: block;
          font: inherit;
          font-size: var(--font-sm);
          font-weight: 600;
          border-radius: 999px;
          border: none;
          outline-color: #7777;
          background: none;
          padding: var(--md) var(--xl);
          &:focus-visible,
          &:hover {
            background-color: var(--color-600-10);
          }
        }
        .primary {
          margin-left: auto;
          display: flex;
          flex-wrap: nowrap;
          grid-area: primary;
        }
        .secondary {
          grid-area: secondary;
        }
      }
    }
  }

  @media screen and (max-width: 600px) {
    .app-modals .modal {
      &[mobile-fullscreen='true'] {
        border-radius: 0;
        width: 100dvw;
        height: 100dvh;
        max-width: 100dvw;
        max-height: 100dvh;
      }
    }
  }

  @keyframes modal-open {
    100% {
      scale: 1;
      opacity: 1;
    }
  }

  @keyframes modal-close {
    100% {
      scale: 0.9;
      opacity: 0;
    }
  }
</style>
