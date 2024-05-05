<script setup lang="ts">
  import { $, debounce, evaluate } from '@/api/util';
  import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
  import { KeyboardGuides, type BindItems, as } from './keys';
  import { useToggle } from '../hooks/update';
  import entry from './entry.vue';

  const Screen = window.app.screen;

  const keyActive = shallowRef({
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
  });

  const update = ref(false);
  const onUpdate = () => (update.value = !update.value);
  const screen = ref(Screen.current);

  const binds = KeyboardGuides();

  function setScreen() {
    screen.value = Screen.current;
  }

  function matches(special?: [boolean, boolean, boolean, boolean]) {
    special ??= [false, false, false, false];
    const value = keyActive.value;

    if (special[0] && !value.ctrl) return false;
    if (special[1] && !value.alt) return false;
    if (special[2] && !value.shift) return false;
    if (special[3] && !value.meta) return false;
    return true;
  }

  function onKey(e: KeyboardEvent) {
    debounce(
      function () {
        keyActive.value = {
          ctrl: e.ctrlKey,
          shift: e.shiftKey,
          alt: e.altKey,
          meta: e.metaKey,
        };
      },
      50,
      'keyActive-' + e.key
    );
  }

  onMounted(() => {
    const app = $('#app')!;

    app.addEventListener('click', onUpdate);
    app.addEventListener('keydown', onKey);
    app.addEventListener('keyup', onKey);
    Screen.addEventListener('screenchange', setScreen);
  });

  onUnmounted(() => {
    const app = $('#app')!;

    app.removeEventListener('click', onUpdate);
    app.removeEventListener('keydown', onKey);
    app.removeEventListener('keyup', onKey);
    Screen.removeEventListener('screenchange', setScreen);
  });
</script>

<template>
  <div class="keybinds" :update="update">
    <template v-for="(item, _key) in binds">
      <template v-if="'label' in item">
        <entry
          v-if="matches(item.key.special) && evaluate(item.cond, keyActive)"
          :name="evaluate(item.label, keyActive)"
          :keys="item.key"
        />
      </template>
      <template
        v-else
        v-for="(item2, _id) in as<Record<string, BindItems>>(item)"
      >
        <entry
          v-if="matches(item2.key.special) && evaluate(item2.cond, keyActive)"
          :name="evaluate(item2.label, keyActive)"
          :keys="item2.key"
        />
      </template>
    </template>
  </div>
</template>

<style lang="scss">
  .keybinds {
    display: flex;
    position: absolute;
    flex-direction: column;
    justify-items: flex-end;
    top: 0;
    right: 0;
    transform: translateY(calc(-100% - 1px));
    font-size: var(--font-sm);
    color: var(--color-900);
    z-index: 2;

    & .item {
      position: relative;
      z-index: -1;
      display: flex;
      margin-left: auto;
      overflow: hidden;
      align-items: center;
      gap: var(--sm);
      padding: calc(var(--sm) / 2) var(--sm);
      background-color: var(--background-body);
      border-radius: calc(var(--sm) / 2);
      + .item {
        margin-top: calc(var(--sm) / -2);
      }

      &::before {
        inset: 0;
        content: '';
        background-color: var(--color-600-10);
        position: absolute;
        z-index: -1;
      }

      .key {
        padding: 2px 4px;
        border-radius: 2px;
        font-family: 'JetBrains Mono', monospace;
        border: 1px solid var(--color-600-30);
        background-color: var(--color-600-10);
      }
    }
  }
</style>
