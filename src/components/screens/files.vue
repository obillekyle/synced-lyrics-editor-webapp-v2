<script setup lang="ts">
  import type { IndexType } from '@/api/files';
  import { Icon } from '@iconify/vue';
  import { computed, onMounted, ref, watch } from 'vue';
  import IconButton from '../elements/Button/icon-button.vue';
  import TextInput from '../elements/Input/text-input.vue';
  import _presets from '../modals/_presets';
  import dayjs from 'dayjs';
  import { rippleEffect, toFileSize } from '@/api/util';

  const FM = window.app.files;

  const currentPath = ref('/');
  const files = ref<IndexType[]>([]);
  const sortBy = ref('name');
  const reverse = ref(false);
  const rename = ref<number>();
  const renameValue = ref('');
  const timeout = ref<ReturnType<typeof setTimeout> | null>(null);

  const sortedFiles = computed(() => {
    return files.value.slice().sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      switch (sortBy.value) {
        case 'name': {
          return reverse.value
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        }
        case 'size': {
          if ('size' in a && 'size' in b) {
            return reverse.value ? b.size - a.size : a.size - b.size;
          }
          return 0;
        }
        case 'modified': {
          if ('modified' in a && 'modified' in b) {
            return reverse.value
              ? b.modified - a.modified
              : a.modified - b.modified;
          }
          return 0;
        }
        default: {
          return 0;
        }
      }
    });
  });

  async function getFiles() {
    if (timeout.value) {
      clearTimeout(timeout.value);
    }
    files.value = await FM.cd(currentPath.value);
  }

  function toggleSort(name: string) {
    if (name === sortBy.value) {
      reverse.value = !reverse.value;
    } else {
      sortBy.value = name;
      reverse.value = false;
    }
  }

  watch(currentPath, getFiles);

  function back() {
    const path = currentPath.value.split('/').slice(0, -1).join('/');
    currentPath.value = path === '' ? '/' : path;
  }

  function toFolder(name: string) {
    if (currentPath.value === '/') {
      currentPath.value += name;
      return;
    }

    currentPath.value += `/${name}`;
  }

  function updateFiles(path: string) {
    if (path === currentPath.value) {
      getFiles();
    }
  }

  function setRenameMode(id?: number) {
    timeout.value = setTimeout(() => {
      rename.value = id;

      if (id) {
        renameValue.value = files.value.find((f) => f.key! === id)!.name;
        console.log(renameValue.value);
      }
    }, 250);
  }

  onMounted(async () => {
    await getFiles();

    FM.on('create', updateFiles);

    document.addEventListener('keydown', async (e) => {
      if (e.key === 'Escape') {
        rename.value = undefined;
      }

      if (e.key === 'Enter') {
        if (rename.value) {
          e.preventDefault();
          await FM.rename(rename.value, renameValue.value);
          await getFiles();
          rename.value = undefined;
        }
      }
    });
  });
</script>

<template>
  <div class="files">
    <div class="header">
      <IconButton
        icon="material-symbols:arrow-back"
        @click="back"
        :disabled="currentPath === '/'"
      />
      <TextInput type="text" v-model="currentPath" height="md" />

      <div class="actions">
        <IconButton icon="material-symbols:refresh" @click="getFiles" />
        <IconButton
          icon="material-symbols:create-new-folder-outline"
          @click="() => _presets.createFM(currentPath, 'folder')"
        />
      </div>
    </div>
    <div class="files-wrapper">
      <div class="entry header">
        <span />
        <div @click="toggleSort('name')" @pointerdown="rippleEffect">
          <span>Name</span>
          <span v-show="sortBy === 'name'">
            {{ reverse ? '↓' : '↑' }}
          </span>
        </div>
        <div @click="toggleSort('size')" @pointerdown="rippleEffect">
          <span>Size</span>
          <span v-show="sortBy === 'size'">
            {{ reverse ? '↓' : '↑' }}
          </span>
        </div>
        <div @click="toggleSort('modified')" @pointerdown="rippleEffect">
          <span>Modified</span>
          <span v-show="sortBy === 'modified'">
            {{ reverse ? '↓' : '↑' }}
          </span>
        </div>
      </div>
      <div v-if="files.length === 0" class="no-files">No files</div>

      <template v-for="file in sortedFiles" :key="file.key">
        <div
          v-if="file.type === 'file'"
          class="entry file"
          @pointerdown="rippleEffect"
        >
          <Icon icon="material-symbols:file-open-outline-sharp" :width="24" />

          <div
            class="name"
            v-if="rename !== file.key"
            @click="setRenameMode(file.key)"
          >
            {{ file.name }}
          </div>

          <input
            v-else
            class="name"
            v-model="renameValue"
            @blur="setRenameMode(undefined)"
            @keydown.enter="setRenameMode(undefined)"
          />

          <div class="size">{{ toFileSize(file.size, 'byte') }}</div>
          <div class="modified">
            {{ dayjs(file.modified).format('YYYY/MM/DD h:mm A') }}
          </div>
        </div>
        <div
          v-if="file.type === 'folder'"
          class="entry folder"
          @dblclick="toFolder(file.name)"
          @pointerdown="rippleEffect"
        >
          <Icon icon="material-symbols:folder-outline-sharp" :width="24" />
          <div
            class="name"
            v-if="rename !== file.key"
            @click="setRenameMode(file.key)"
          >
            {{ file.name }}
          </div>
          <input
            v-else
            class="name"
            v-model="renameValue"
            @blur="setRenameMode(undefined)"
            @keydown.enter="setRenameMode(undefined)"
          />

          <div class="modified">
            {{ dayjs(file.modified).format('YYYY/MM/DD h:mm A') }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
  .files {
    display: flex;
    flex-direction: column;
    position: absolute;
    inset: 0 0 0 0;
  }

  .header {
    display: flex;
    align-items: center;
    padding-inline: var(--sm);

    .actions {
      margin-left: auto;
      display: flex;
      align-items: center;
    }
  }

  .files-wrapper {
    overflow: overlay;
    display: grid;
    grid-template-columns: minmax(48px, auto) 1fr auto auto;

    .no-files {
      grid-column: 1 / 5;
      font-size: var(--font-md);
      display: grid;
      place-items: center;
      height: 36px;
    }

    .entry {
      display: grid;
      grid-column: 1 / 5;
      grid-template-columns: subgrid;
      align-items: center;
      position: relative;
      overflow: hidden;
      grid-template-areas: 'icon name size modified';
      width: 100%;
      padding-inline: var(--xl);
      height: 36px;
      > div,
      input {
        padding-inline: var(--sm);
        margin: none;
      }
      > input {
        box-shadow: 0 0 0 1px inset var(--mono-50);
        height: 100%;
        border: none;
        font: inherit;
      }
      &.folder {
        cursor: pointer;
      }
      &:hover {
        background-color: var(--mono-50-20);
      }

      &.header {
        font-weight: 600;
        height: 36px;
        font-size: var(--font-md);
        grid-template-areas: initial;
        background: none !important;

        > div {
          height: 100%;
          display: flex;
          gap: var(--xs);
          position: relative;
          overflow: hidden;
          justify-content: space-between;
          cursor: pointer;
          align-items: center;
          padding-right: var(--sm);
          border-right: 1px var(--mono-40) solid;
          &:hover {
            background: var(--mono-20);
          }
        }
      }

      .icon {
        grid-area: icon;
      }

      .name {
        grid-area: name;
      }

      .size {
        grid-area: size;
      }

      .modified {
        grid-area: modified;
        font-size: var(--font-sm);
      }
    }
  }
</style>
