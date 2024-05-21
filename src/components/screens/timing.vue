<script setup lang="ts">
  import { $, clamp } from '@/api/util';
  import { onMounted, onUnmounted, ref, markRaw, shallowRef } from 'vue';
  import iconButton from '../elements/button/icon-button.vue';

  import animatedScroll from 'animated-scroll-to';
  import { getKeybinds, keyHandlers, processKey } from '../keybinds/keys';
  import type { LRCLine } from '@/api/parser';

  const Lyrics = window.app.lyric;
  const Player = window.app.player;
  const Keybinds = getKeybinds();

  const focus = ref(-1);
  const edit = ref(false);
  const lyrics = ref<ReturnType<typeof Lyrics.getJSON>>({
    lines: [],
    tags: {},
  });

  const updateKey = ref(true);
  const timingPane = ref<HTMLElement | null>(null);
  const update = () => (updateKey.value = !updateKey.value);

  const setFocus = (value: typeof focus.value) => {
    if (focus.value == value) return;
    const focused = timingPane.value?.children[value];
    edit.value = false;

    if (!focused) {
      if (value >= lyrics.value.lines.length) {
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
    const lrcData = Lyrics.getJSON();
    lyrics.value = lrcData;
    console.log('update');
    setFocus(-1);
  };

  const handleLineAdd = (index: number, data: LRCLine) => {
    lyrics.value.lines.splice(index, 0, data);
    setFocus(index);
  };

  const handleLineRemove = (index: number) => {
    lyrics.value.lines.splice(index, 1);
    setFocus(index >= lyrics.value.lines.length ? index - 1 : index);
  };

  const handleLineUpdate = (index: number, data: LRCLine) => {
    lyrics.value.lines[index] = data;
    setFocus(index);
  };

  const toggleEdit = () => (edit.value = !edit.value);
  const setTimeFromMusicCurrent = (e?: MouseEvent) => {
    const index = focus.value;

    if (index == -1) return;
    if (!lyrics.value.lines[index]) return;
    if (!isFinite(Player.duration)) return;

    const newIndex =
      index + 1 === lyrics.value.lines.length ? index : index + 1;
    const currentTime = Player.currentTime * 1000;

    e?.stopPropagation?.();
    setFocus(newIndex);

    if (lyrics.value.lines[newIndex].time != currentTime) {
      Lyrics.updateLine(index, { time: currentTime });
    }
  };

  const adjustTime = (value: number) => {
    const index = focus.value;
    const lrcLine = lyrics.value.lines[index];

    if (index == -1) return;
    if (!lrcLine) return;

    const time = lrcLine.time + value;

    Lyrics.updateLine(index, {
      time: time < 0 ? 0 : time,
    });
  };

  function saveValue(index: number) {
    const element = $<HTMLInputElement>(`.lrc-line.active .data`);
    const value = element?.value ?? '';
    toggleEdit();

    Lyrics.updateLine(index, { data: value, type: 'single' });
  }

  function handleKeyDown(e: KeyboardEvent) {
    const index = focus.value;
    const lines = lyrics.value.lines;

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
      setFocus(index + 1 >= lines.length ? index : index + 1);
    });
    processKey(Keybinds.timing.arrowUpFocus, e, () => {
      setFocus(index == 0 ? 0 : (index < 0 ? lines.length : index) - 1);
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
      setTimeout(() => $('.lrc-line.active .data')?.focus(), 100);
    });
  }

  onMounted(() => {
    const app = $('#app')!;

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
</script>

<template>
  <div :data-update="updateKey" class="timing-screen" ref="timingPane">
    <div
      :key="index"
      :data-index="index"
      @click="setFocus(index)"
      class="lrc-line"
      :class="{
        active: focus == index,
        edit,
      }"
      v-for="({ data, time }, index) in lyrics.lines"
    >
      <div class="time" @click="() => (Player.currentTime = time / 1000)">
        {{ Lyrics.timeToString(time) }}
      </div>
      <div v-if="focus == index" class="edit-icon-container">
        <icon-button
          v-show="edit"
          title="Save"
          icon="material-symbols:done"
          @click="() => saveValue(index)"
        />
        <icon-button
          v-show="!edit"
          title="Edit"
          @click="toggleEdit"
          icon="material-symbols:edit-outline"
        />
      </div>

      <input class="data" v-if="focus == index && edit" :defaultValue="data" />

      <div class="data" v-else>
        <div
          :key="index"
          v-for="({ line }, index) in data"
          v-if="typeof data == 'object'"
        >
          {{ line }}
        </div>
        <template v-else>{{ data }}</template>
      </div>

      <div class="timing-buttons" v-if="focus == index">
        <icon-button
          @click="
            () => (Player.currentTime = clamp(0, time / 1000, Player.duration))
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

      .data {
        font-size: calc(var(--font-xl));

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
