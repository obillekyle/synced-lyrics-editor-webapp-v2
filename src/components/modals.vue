<script setup lang="ts">
  import type { ModalArgs } from '@/api/modals';
  import { onMounted, onUnmounted, reactive, ref } from 'vue';
  import { Icon } from '@iconify/vue';
  import './_modals.scss';

  const ModalService = window.app.modals;

  const closing = ref<number | string>('');
  const modals = reactive({ ...ModalService.modals });

  function updateModals(...args: ModalArgs) {
    const [event, key, value] = args;

    switch (event) {
      case 'closed':
        closing.value = key;
        setTimeout(() => {
          closing.value = '';
          delete modals[key];
        }, 300);
        break;
      default:
        modals[key] = value;
    }
  }

  onMounted(() => {
    for (const id in ModalService.modals) {
      modals[id] = ModalService.modals[id];
    }
    ModalService.addEventListener('updated', updateModals);
  });

  onUnmounted(() => {
    ModalService.removeEventListener('updated', updateModals);
  });
</script>

<template>
  <div class="app-modals">
    <div
      :class="{
        modal: true,
        closing: closing == id,
      }"
      v-for="({ title, content, actions, icon }, id) in modals"
      :key="id"
    >
      <div
        class="icon"
        v-if="icon"
      >
        <icon
          :icon="icon"
          :width="36"
        />
      </div>
      <div class="title">{{ title }}</div>
      <div class="content">
        <div
          class="wrapper"
          v-html="content"
        />
      </div>
      <div class="actions">
        <div class="primary">
          <template
            v-for="({ onClick, text, role }, key) in actions"
            :key="key"
          >
            <button
              :key="key"
              :role="role"
              :title="text"
              v-html="text"
              v-if="role != 'secondary'"
              :onclick="
                () =>
                  onClick.call(ModalService, {
                    id,
                    close: () => ModalService.close(id),
                    modify: () =>
                      ModalService.modify(id, { title, content, actions }),
                  })
              "
            />
          </template>
        </div>
        <div class="secondary">
          <template
            v-for="({ onClick, text, role }, key) in actions"
            :key="key"
          >
            <button
              :key="key"
              :role="role"
              :title="text"
              v-html="text"
              v-if="role == 'secondary'"
              :onclick="
                () =>
                  onClick.call(ModalService, {
                    id,
                    close: () => ModalService.close(id),
                    modify: () =>
                      ModalService.modify(id, { title, content, actions }),
                  })
              "
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .app-modals {
    display: grid;
    place-items: center;
    position: fixed;
    overflow: hidden;
    inset: 0 0 0 0;
    background: #0004;
    z-index: 100;

    &:empty {
      display: none;
    }

    .modal {
      position: absolute;
      margin-block: auto;
      margin-inline: auto;
      scale: 0.9;
      opacity: 0.3;
      padding-top: var(--xl);
      border-radius: var(--lg);
      background-color: var(--app-modal-color);
      display: grid;
      gap: var(--sm);
      min-width: clamp(0px, 400px, 768px);
      max-width: calc(100dvw - var(--xl));
      max-height: calc(100dvh - var(--xl));
      grid-template-areas:
        'icon'
        'title'
        'content'
        'actions';
      grid-template-rows: auto auto 1fr auto;
      animation: modal-open 0.3s forwards;

      &.closing {
        scale: 1;
        opacity: 1;
        animation: modal-close 0.3s forwards;
      }

      .icon {
        grid-area: icon;
        justify-self: center;
      }

      .title {
        font-size: var(--header-size);
        font-weight: var(--header-weight);
        text-align: center;
        grid-area: title;
      }

      .content {
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

      .actions {
        display: grid;
        grid-area: actions;
        padding: var(--md);
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
          padding: var(--md) var(--lg);
          &:focus-visible,
          &:hover {
            background-color: var(--overlay-10);
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

  @media screen and (max-width: 400px) {
    .app-modals .modal {
      border-radius: 0;
      max-width: 100dvw;
      max-height: 100dvh;
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
