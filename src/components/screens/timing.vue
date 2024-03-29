<script setup lang="ts">
  import { type LRCTags, type LRCArgs, type LRCLine } from '@/api/parser';
  import { $ } from '@/api/util';
  import { Icon } from '@iconify/vue';
  import { onMounted, onUnmounted, ref, markRaw } from 'vue';

  import animatedScroll from 'animated-scroll-to';

  const Lyrics = window.app.lyric;
  const Player = window.app.player;

  const focus = ref(-1);
  const edit = ref(false);
  const lyrics = markRaw(Lyrics.getJSON());

  const timingPane = ref<HTMLElement | null>(null);
  const updateKey = ref(true);
  const update = () => (updateKey.value = !updateKey.value);

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
  const setFocus = (value: typeof focus.value) => {
    if (focus.value == value) return;
    const focused = timingPane.value?.children[value];
    edit.value = false;

    if (!focused) {
      focus.value = -1;
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
    const element = $(`.lrc-line.active .data`);
    const value = element?.textContent ?? '';
    console.log(value);

    Lyrics.updateLine(index, { data: value, type: 'single' });
  }

  function handleKeyDown(e: KeyboardEvent) {
    const index = focus.value;
    if (edit.value) return;

    e.preventDefault();

    switch (e.key) {
      case 'ArrowLeft':
        e.shiftKey || Player.fastSeek(-1);
        e.shiftKey && Player.fastSeek(-0.1);
        break;
      case 'ArrowRight':
        e.shiftKey || Player.fastSeek(1);
        e.shiftKey && Player.fastSeek(0.1);
        break;
    }

    if (index == -1) return;
    switch (e.key) {
      case 'ArrowLeft':
        Player.paused && adjustTime(-100);
        e.shiftKey && adjustTime(-100);
        break;
      case 'ArrowRight':
        Player.paused && adjustTime(100);
        e.shiftKey && adjustTime(100);
        break;
      case 'ArrowDown':
        setFocus(index + 1 >= lyrics.lines.length ? index : index + 1);
        break;
      case 'ArrowUp':
        setFocus(index == 0 ? 0 : index - 1);
        break;
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    const index = focus.value;

    if (edit.value) return;

    e.preventDefault();

    if (index == -1) {
      switch (e.key) {
        case 'Insert':
          Lyrics.addLine(Lyrics.EMPTYLINE);
          break;
        case 'ArrowDown':
          if (lyrics.lines.length > 0) setFocus(0);
          break;
        case 'ArrowUp':
          if (lyrics.lines.length > 0) setFocus(lyrics.lines.length - 1);
          break;
      }
      return;
    }

    switch (e.key) {
      case 'Enter':
        setTimeFromMusicCurrent();
        !Player.paused && setFocus(index + 1);
        break;
      case 'Escape':
        setFocus(-1);
        break;
      case 'Insert':
        const newItem = Lyrics.EMPTYLINE;

        e.shiftKey
          ? Lyrics.addLine(newItem, index - 1)
          : Lyrics.addLine(newItem, index);

        break;
      case 'Delete':
        Lyrics.removeLine(index);
        break;
    }
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
  <div
    :data-update="updateKey"
    class="timing-screen"
    ref="timingPane"
  >
    <div
      :key="index"
      @click="setFocus(index)"
      :class="['lrc-line', focus == index ? 'active' : 'inactive']"
      v-for="({ data, time }, index) in lyrics.lines"
    >
      <div
        class="time"
        :onclick="() => (Player.currentTime = time / 1000)"
      >
        {{ Lyrics.timeToString(time) }}
      </div>
      <div
        v-if="focus == index"
        class="edit-icon-container"
        @click="toggleEdit"
      >
        <button
          class="icon-button"
          title="edit"
          :onclick="() => edit && saveValue(index)"
        >
          <div class="wrapper">
            <icon
              v-if="edit"
              :width="24"
              class="edit-icon"
              icon="material-symbols:done"
            />
            <icon
              v-if="!edit"
              :width="24"
              class="edit-icon"
              icon="material-symbols:edit-outline"
            />
          </div>
        </button>
      </div>
      <div
        :contenteditable="focus == index && edit ? 'plaintext-only' : undefined"
        class="data"
      >
        <div
          :key="index"
          v-for="({ line }, index) in data"
          v-if="typeof data == 'object'"
        >
          {{ line }}
        </div>
        <template v-else>{{ data }}</template>
      </div>

      <div
        class="timing-buttons"
        v-if="focus == index"
      >
        <button
          @click="adjustTime(-100)"
          class="icon-button"
          title="-100ms"
        >
          <div class="wrapper">
            <icon
              :width="24"
              icon="material-symbols:fast-rewind"
            />
          </div>
        </button>
        <button
          @click="setTimeFromMusicCurrent"
          class="icon-button"
          title="Player current time"
        >
          <div class="wrapper">
            <icon
              :width="24"
              icon="material-symbols:hourglass-empty"
            />
          </div>
        </button>
        <button
          @click="adjustTime(100)"
          class="icon-button"
          title="+100ms"
        >
          <div class="wrapper">
            <icon
              :width="24"
              icon="material-symbols:fast-forward"
            />
          </div>
        </button>
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
        z-index: -1;
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
        color: var(--color-700);
      }

      .timing-buttons {
        grid-area: timing;
        display: grid;
        place-items: center;
        grid-template-areas:
          'set set'
          'rrr fff';
        :nth-child(1) {
          grid-area: rrr;
          align-self: self-start;
        }
        :nth-child(2) {
          grid-area: set;
          align-self: self-end;
        }
        :nth-child(3) {
          grid-area: fff;
          align-self: self-start;
        }
      }

      & + .lrc-line {
        border-top: 1px solid var(--overlay-10);
      }

      .data {
        font-size: calc(var(--font-xl));

        width: clamp(200px, 100%, 100%);
        white-space: pre-wrap;
        text-wrap: balance;

        grid-area: data;
        &:empty::after {
          content: '<Empty>';
          color: var(--overlay-40);
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
        top: var(--sm);

        &::before {
          background-color: var(--overlay-10);
        }

        .data {
          height: 72px;
          overflow: auto;
          outline: none;
          align-self: self-start;
          border-radius: calc(var(--sm) / 2);
          &[contenteditable] {
            outline: 1px solid var(--overlay-20);
          }
          &:focus-visible {
            box-shadow: 0 0 0 2px var(--overlay-20);
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
