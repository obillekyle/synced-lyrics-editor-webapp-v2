<script setup lang="ts">
  import { as, getKeybinds, type KeyBind } from './keys';
  import entry from './entry.vue';

  const binds = getKeybinds();
</script>

<template>
  <div class="guide-wrapper">
    <template v-for="(item, name) in binds">
      <entry v-if="'label' in item" :keys="item" :key="name" />

      <div v-else :class="['binds-group', name]">
        <div class="group">{{ name }}</div>
        <entry
          v-for="(groupItem, name) in as<Record<string, KeyBind>>(item)"
          :keys="groupItem"
          :key="name"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss">
  .guide-wrapper {
    display: grid;

    .binds-group {
      border-bottom: 1px solid var(--color-600-30);
      padding-block: var(--sm) var(--md);

      &:empty {
        display: none;
      }

      .group {
        text-transform: capitalize;
        font-size: var(--font-lg);
        font-weight: 600;
      }
      + .item {
        margin-top: var(--md);
      }
    }
    .item {
      display: flex;
      align-items: center;
      gap: var(--sm);
      margin-left: var(--md);
      margin-top: var(--sm);
    }
    .key {
      user-select: none;
      font-family: 'JetBrains Mono', monospace;
      border-radius: calc(var(--sm) / 2);
      background-color: var(--color-600-10);
      font-size: var(--font-sm);
      padding: calc(var(--sm) / 2) var(--sm);
      border: 1px solid var(--color-600-60);
    }

    .label {
      font-size: var(--font-md);
      margin-right: auto;
      padding-right: 32px;
      color: var(--mono-900);
    }
  }
</style>
