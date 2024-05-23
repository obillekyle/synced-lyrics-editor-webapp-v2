<script setup lang="ts">
  import { $, clamp } from '@/api/util';
  import {
    onMounted,
    onUnmounted,
    ref,
    markRaw,
    shallowRef,
    watch,
    computed,
    inject,
    type Ref,
  } from 'vue';
  import iconButton from '../elements/button/icon-button.vue';

  import animatedScroll from 'animated-scroll-to';
  import { getKeybinds, keyHandlers, processKey } from '../keybinds/keys';
  import type { LRCLine, LRCTags } from '@/api/parser';
  import List from '../elements/list/list.vue';
  import type { ListItemType } from '../elements/list/types';
  import TimingList from './timing-list.vue';
  import IconButton from '../elements/button/icon-button.vue';

  const Lyrics = window.app.lyric;
  const Player = window.app.player;
  const Keybinds = getKeybinds();

  const focus = ref(-1);
  const edit = ref(false);
  const lines = ref<ListItemType<LRCLine>[]>([]);
  const tags = ref<LRCTags>({});

  const sortMode = inject<Ref<boolean>>('app-timing-sort')!;
  const timingPane = ref<HTMLElement | null>(null);

  const setFocus = (value: typeof focus.value) => {
    if (focus.value == value) return;
    const focused = timingPane.value?.children[value];
    edit.value = false;

    if (!focused) {
      if (value >= lines.value.length) {
        focus.value = -1;
        return;
      }
      focus.value = value;
      return;
    }

    focus.value = value;
    const main = $('main')!;

    const rect = main.getBoundingClientRect();
    const halfElement = focused.clientHeight / 2;
    const offset = rect.height / 2 - halfElement;

    animatedScroll(focused, {
      speed: 400,
      verticalOffset: offset * -1,
      elementToScroll: main,
      cancelOnUserAction: false,
    });
  };

  const handleLyricsParse = () => {
    const lrcData = Lyrics.getRaw();

    lines.value = lrcData.lines.map((line) => ({
      id: line.id,
      props: line,
    }));

    tags.value = lrcData.tags;
    setFocus(-1);
  };

  const handleLineAdd = (index: number, data: LRCLine) => {
    lines.value.splice(index, 0, { id: data.id, props: data });
    setFocus(index);
  };

  const handleLineRemove = (index: number) => {
    lines.value.splice(index, 1);
    setFocus(index >= lines.value.length ? index - 1 : index);
  };

  const handleLineUpdate = (index: number, data: LRCLine) => {
    lines.value[index] = { id: data.id, props: data };
    setFocus(index);
  };

  const toggleEdit = () => (edit.value = !edit.value);
  const setTimeFromMusicCurrent = (e?: MouseEvent) => {
    const index = focus.value;

    if (index == -1) return;
    if (!lines.value[index]) return;
    if (!isFinite(Player.duration)) return;

    const newIndex = index + 1 === lines.value.length ? index : index + 1;
    const currentTime = Player.currentTime * 1000;

    e?.stopPropagation?.();
    setFocus(newIndex);

    if (lines.value[newIndex].props.time != currentTime) {
      Lyrics.updateLine(index, { time: currentTime });
    }
  };

  const adjustTime = (value: number) => {
    const index = focus.value;
    const lrcLine = lines.value[index];

    if (index == -1) return;
    if (!lrcLine) return;

    const time = lrcLine.props.time + value;

    Lyrics.updateLine(index, {
      time: time < 0 ? 0 : time,
    });
  };

  function saveValue(index: number) {
    const element = $<HTMLInputElement>(`.lrc-line.active .data`);
    const value = element?.value ?? '';
    toggleEdit();

    Lyrics.updateLine(index, {
      data: value.replace(/\n/g, ''),
      type: 'single',
    });
  }

  function handleKeyDown(e: KeyboardEvent) {
    const index = focus.value;
    const lyrics = lines.value;

    if (e.ctrlKey) return;
    if (edit.value) return;

    processKey(Keybinds.timing.adjustTimeBackward, e, () => {
      e.shiftKey || Player.fastSeek(-1);
      e.shiftKey && Player.fastSeek(-0.1);
      if (index !== -1) {
        Player.paused && adjustTime(-100);
        e.shiftKey && adjustTime(-100);
      }
    });
    processKey(Keybinds.timing.adjustTimeForward, e, () => {
      e.shiftKey || Player.fastSeek(1);
      e.shiftKey && Player.fastSeek(0.1);
      if (index !== -1) {
        Player.paused && adjustTime(100);
        e.shiftKey && adjustTime(100);
      }
    });

    processKey(Keybinds.timing.arrowDownFocus, e, () => {
      setFocus(index + 1 >= lyrics.length ? index : index + 1);
    });
    processKey(Keybinds.timing.arrowUpFocus, e, () => {
      setFocus(index == 0 ? 0 : (index < 0 ? lyrics.length : index) - 1);
    });
  }

  function handleKeyUp(e: KeyboardEvent) {
    const index = focus.value;

    if (e.ctrlKey) return;
    if (edit.value) {
      switch (e.key) {
        case 'Enter':
          $('#app')?.focus();
          saveValue(index);
          break;
      }
      return;
    }

    if (index == -1) {
      processKey(Keybinds.timing.addNewLine, e, keyHandlers.timing.addNewLine);
      processKey(Keybinds.timing.deleteLine, e, keyHandlers.timing.deleteLine);
      return;
    }

    processKey(Keybinds.timing.setLineTiming, e, () => {
      setTimeFromMusicCurrent();
      !Player.paused && setFocus(index + 1);
    });

    processKey(Keybinds.timing.unfocusLine, e, () => {
      setFocus(-1);
    });

    processKey(Keybinds.timing.addNewLine, e, () => {
      const newItem = Lyrics.EMPTYLINE;
      Lyrics.addLine(newItem, index);
    });

    processKey(Keybinds.timing.addNewLineReverse, e, () => {
      const newItem = Lyrics.EMPTYLINE;
      Lyrics.addLine(newItem, index - 1);
    });
    processKey(Keybinds.timing.deleteLine, e, () => {
      Lyrics.removeLine(index);
    });

    processKey(Keybinds.timing.toggleEditMode, e, () => {
      toggleEdit();
    });
  }

  watch(edit, (value) => {
    if (value) {
      setTimeout(() => {
        const element = $<HTMLInputElement>(`.lrc-line.active .data`);
        if (element) {
          element.focus();
          element.setSelectionRange(0, element.value.length);
        }
      }, 100);
    }
  });

  onMounted(() => {
    const app = $('#app')!;

    handleLyricsParse();

    Lyrics.addEventListener('parsed', handleLyricsParse);
    Lyrics.addEventListener('line-added', handleLineAdd);
    Lyrics.addEventListener('line-removed', handleLineRemove);
    Lyrics.addEventListener('line-updated', handleLineUpdate);

    app.addEventListener('keydown', handleKeyDown);
    app.addEventListener('keyup', handleKeyUp);
  });

  onUnmounted(() => {
    const app = $('#app')!;

    Lyrics.removeEventListener('parsed', handleLyricsParse);
    Lyrics.removeEventListener('line-added', handleLineAdd);
    Lyrics.removeEventListener('line-removed', handleLineRemove);
    Lyrics.removeEventListener('line-updated', handleLineUpdate);

    app.removeEventListener('keydown', handleKeyDown);
    app.removeEventListener('keyup', handleKeyUp);
  });

  function dismissLine(id: number) {
    Lyrics.removeLine(id);
  }
</script>

<template>
  <div class="timing-screen-drag" v-if="sortMode">
    <div class="guide">Swipe left or right to remove</div>
    <List
      :items="lines"
      :list-comp="TimingList"
      :on-dismiss="dismissLine"
      swipe="dismiss"
    />
  </div>

  <div class="timing-screen" ref="timingPane" v-else>
    <div
      :key="id"
      :data-index="index"
      @click="setFocus(index)"
      class="lrc-line"
      :class="{
        active: focus == index,
        edit,
      }"
      v-for="({ id, props }, index) in lines"
    >
      <div class="time" @click="() => (Player.currentTime = props.time / 1000)">
        {{ Lyrics.timeToString(props.time) }}
      </div>
      <div v-if="focus == index" class="edit-icon-container">
        <IconButton
          v-show="edit"
          title="Save"
          icon="material-symbols:done"
          @click="() => saveValue(index)"
        />
        <IconButton
          v-show="!edit"
          title="Edit"
          @click="toggleEdit"
          icon="material-symbols:edit-outline"
        />
      </div>

      <textarea
        class="data"
        v-if="focus == index && edit"
        :defaultValue="props.data"
      />

      <div class="data" v-else>
        <div
          :key="index"
          v-if="typeof props.data == 'object'"
          v-for="({ line }, index) in props.data"
        >
          {{ line }}
        </div>
        <template v-else>{{ props.data }}</template>
      </div>

      <div class="timing-buttons" v-if="focus == index">
        <IconButton
          @click="
            () =>
              (Player.currentTime = clamp(
                0,
                props.time / 1000,
                Player.duration
              ))
          "
          :disabled="!isFinite(Player.duration)"
          title="Player current time"
          icon="material-symbols:play-arrow-outline"
        />
        <icon-button
          @click="setTimeFromMusicCurrent"
          :disabled="!isFinite(Player.duration)"
          title="Player current time"
          icon="material-symbols:hourglass-empty"
        />
        <icon-button
          @click="adjustTime(-100)"
          :disabled="!isFinite(Player.duration)"
          title="-100ms"
          icon="material-symbols:fast-rewind"
        />
        <icon-button
          @click="adjustTime(100)"
          :disabled="!isFinite(Player.duration)"
          title="+100ms"
          icon="material-symbols:fast-forward"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .timing-screen-drag {
    width: 100%;
    height: 100%;
    padding-inline: var(--md);
    margin-inline: auto;
    position: relative;
    max-width: 768px;
    .list:empty::after {
      content: 'There are no lines';
      text-align: center;
      display: block;
      padding-block: var(--md);
      font-size: var(--font-xl);
      color: var(--mono-700);
    }

    .guide {
      top: 0;
      z-index: 10;
      position: sticky;
      background: var(--background-body);
      text-align: center;
      padding: var(--xl);
    }
  }

  .timing-screen {
    padding-block: calc((85dvh - 112px) / 2);
    max-width: 768px;
    width: 100%;
    padding-inline: var(--md);
    margin-inline: auto;
    position: relative;

    &:empty::after {
      content: "Press 'Insert' to add a new line";
      text-align: center;
      display: block;
      font-size: var(--font-xl);
      color: var(--color-500);
    }

    .lrc-line {
      user-select: none;
      display: grid;
      position: relative;
      grid-template-areas:
        'time data'
        'time data';
      grid-template-columns: 56px 1fr auto;
      grid-template-rows: 24px auto;
      height: 112px;
      overflow: hidden;
      align-content: center;

      column-gap: var(--sm);
      padding-inline: var(--sm);

      background: var(--background-body);
      box-shadow: 0 2px 12px var(--background-body);

      &::before {
        position: absolute;
        content: '';
        inset: 0;
        z-index: -1;
        background-color: transparent;
        transition: background-color 0.2s;
      }

      .edit-icon-container {
        width: 56px;
        display: grid;
        grid-area: edit;
        justify-content: center;
        cursor: pointer;
      }

      .time {
        font-size: var(--font-sm);
        align-self: center;
        color: var(--color-800);
      }

      .timing-buttons {
        grid-area: timing;
        display: grid;
        place-items: center;
        grid-template-areas:
          'ppp set'
          'rrr fff';

        :nth-child(1) {
          grid-area: ppp;
          align-self: self-start;
        }
        :nth-child(2) {
          grid-area: set;
          align-self: self-start;
        }
        :nth-child(3) {
          grid-area: rrr;
          align-self: self-end;
        }
        :nth-child(4) {
          grid-area: fff;
          align-self: self-start;
        }
      }

      &:is(:first-child):is(:last-child) {
        border-radius: var(--sm);
        border: 1px solid var(--color-800-10) !important;
      }

      &:not(.active) + .lrc-line {
        border-top: 1px solid var(--color-800-10);
      }

      textarea.data {
        word-break: break-word;
        white-space: none;
        resize: none;
        font: inherit;
        font-size: var(--font-xl);
      }

      .data {
        font-size: var(--font-xl);

        width: clamp(200px, 100%, 100%);
        white-space: pre-wrap;
        text-wrap: balance;
        border: none;

        grid-area: data;
        &:empty::after {
          content: '<Empty>';
          color: var(--color-800-40);
        }
      }

      &:is(:first-child:last-child) {
        border: 1px solid var(--color-10);
      }

      &.active {
        border-radius: var(--sm);
        grid-template-areas:
          'edit time timing'
          'edit data timing';
        position: sticky;
        z-index: 1;
        top: var(--sm);

        &::before {
          background-color: var(--color-900-10);
          transition: none;
        }

        .data {
          height: 72px;
          overflow: auto;
          outline: none;
          align-self: self-start;
          border-radius: calc(var(--sm) / 2);
          &:focus-visible {
            box-shadow: 0 0 0 2px var(--color-600-20);
          }
        }
      }

      &.inactive {
        .data {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
  }

  @media screen and (max-width: 768px) {
    .timing-screen {
      padding-inline: var(--sm);
    }
  }
</style>
