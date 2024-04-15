<script setup lang="ts">
  import { $ } from '@/api/util';
  import { Icon } from '@iconify/vue';
  import { type LRCArgs } from '@/api/parser';
  import { onMounted, onUnmounted, ref, markRaw } from 'vue';
  import iconButton from '../elements/icon-button.vue';

  import animatedScroll from 'animated-scroll-to';
  import { getKeybinds, keyHandlers, processKey } from '../keybinds/keys';

  const Lyrics = window.app.lyric;
  const Player = window.app.player;
  const Keybinds = getKeybinds();

  const focus = ref(-1);
  const edit = ref(false);
  const lyrics = markRaw(Lyrics.getJSON());

  const updateKey = ref(true);
  const timingPane = ref<HTMLElement | null>(null);
  const update = () => (updateKey.value = !updateKey.value);

  const setFocus = (value: typeof focus.value) => {
    if (focus.value == value) return;
    const focused = timingPane.value?.children[value];
    edit.value = false;

    if (!focused) {
      if (value >= lyrics.lines.length) {
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

  const setLyricsObj = (...args: LRCArgs) => {
    if (args[0] == 'parsed') {
      const lrcData = Lyrics.getJSON();
      lyrics.lines = lrcData.lines;
      lyrics.tags = lrcData.tags;
      return update();
    }

    const [event, line, index] = args;

    switch (event) {
      case 'line-added':
        lyrics.lines.splice(index, 0, line);
        setFocus(index);
        break;
      case 'line-removed':
        lyrics.lines.splice(index, 1);
        setFocus(index >= lyrics.lines.length ? index - 1 : index);
        break;
      case 'line-updated':
        lyrics.lines[index] = line;
        break;
    }

    update();
  };

  const toggleEdit = () => (edit.value = !edit.value);
  const setTimeFromMusicCurrent = (e?: MouseEvent) => {
    const index = focus.value;

    if (index == -1) return;
    if (!lyrics.lines[index]) return;
    if (!isFinite(Player.duration)) return;

    const newIndex = index + 1 === lyrics.lines.length ? index : index + 1;
    const currentTime = Player.currentTime * 1000;

    e?.stopPropagation?.();
    setFocus(newIndex);

    if (lyrics.lines[newIndex].time != currentTime) {
      Lyrics.updateLine(index, { time: currentTime });
    }
  };

  const adjustTime = (value: number) => {
    const index = focus.value;
    const lrcLine = lyrics.lines[index];

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

    Lyrics.updateLine(index, { data: value, type: 'single' });
  }

  function handleKeyDown(e: KeyboardEvent) {
    const index = focus.value;
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
      setFocus(index + 1 >= lyrics.lines.length ? index : index + 1);
    });
    processKey(Keybinds.timing.arrowUpFocus, e, () => {
      setFocus(index == 0 ? 0 : (index < 0 ? lyrics.lines.length : index) - 1);
    });
  }

  function handleKeyUp(e: KeyboardEvent) {
    const index = focus.value;

    if (e.ctrlKey) return;
    if (edit.value) {
      switch (e.key) {
        case 'Enter':
          saveValue(index);
          $('#app')?.focus();
          toggleEdit();
          break;
      }
      return;
    }

    e.preventDefault();

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
    setLyricsObj('parsed', Lyrics);
    Lyrics.addEventListener('lrc-updated', setLyricsObj);
    app.addEventListener('keydown', handleKeyDown);
    app.addEventListener('keyup', handleKeyUp);
  });

  onUnmounted(() => {
    const app = $('#app')!;
    Lyrics.removeEventListener('lrc-updated', setLyricsObj);
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
      :class="{
        'lrc-line': true,
        active: focus == index,
        edit,
      }"
      v-for="({ data, time }, index) in lyrics.lines"
    >
      <div class="time" :onclick="() => (Player.currentTime = time / 1000)">
        {{ Lyrics.timeToString(time) }}
      </div>
      <div
        v-if="focus == index"
        class="edit-icon-container"
        @click="toggleEdit"
      >
        <icon-button
          title="edit"
          :onclick="() => edit && saveValue(index)"
          :icon="
            edit ? 'material-symbols:done' : 'material-symbols:edit-outline'
          "
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
          @click="setTimeFromMusicCurrent"
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
    padding-inline: var(--md);
    max-width: 768px;
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
      border-radius: var(--sm);
      column-gap: var(--sm);
      padding-inline: var(--sm);

      background: var(--background-body);
      box-shadow: 0 2px 12px var(--background-body);

      &::before {
        position: absolute;
        content: '';
        inset: 0;
        z-index: 0;
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

      & + .lrc-line {
        border-top: 1px solid var(--color-800-10);
      }

      .data {
        font-size: calc(var(--font-xl));

        width: clamp(200px, 100%, 100%);
        white-space: pre-wrap;
        text-wrap: balance;

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
          &[contenteditable] {
            outline: 1px solid var(--color-600-20);
          }
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
