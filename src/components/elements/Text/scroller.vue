<script setup lang="ts">
  import { addPX, addUnit, type AppSizes } from '@/api/util';
  import { onMounted, ref, type HTMLAttributes } from 'vue';

  interface ScrollerProps extends /* @vue-ignore */ HTMLAttributes {
    speed?: number;
    spacing?: number;
  }

  const props = withDefaults(defineProps<ScrollerProps>(), {
    speed: 24,
  });

  const wrapper = ref<HTMLDivElement | null>(null);
  const content = ref<HTMLDivElement | null>(null);

  const cloned = ref(false);

  function setScroll() {
    cloned.value = false;
    setTimeout(() => {
      if (wrapper.value && content.value) {
        const wRect = wrapper.value.getBoundingClientRect();
        const cRect = content.value.getBoundingClientRect();

        const spacing = props.spacing ?? wRect.width / 2;
        cloned.value = wRect.width < content.value.offsetWidth;
        const speed = (cRect.width + spacing) / props.speed;
        wrapper.value.style.setProperty('--spacing', addPX(spacing));
        wrapper.value.style.setProperty(
          '--speed',
          addUnit(speed.toFixed(2), 's')
        );
      }
    });
  }

  onMounted(() => {
    setScroll();

    const observer = new ResizeObserver(setScroll);
    observer.observe(wrapper.value!);
    observer.observe(content.value!);
  });
</script>

<template>
  <span class="scroller" :class="{ cloned }">
    <div class="scroller-wrapper" ref="wrapper">
      <div class="scroller-content" ref="content">
        <slot />
      </div>
      <div class="scroller-content" v-if="cloned">
        <slot />
      </div>
    </div>
  </span>
</template>

<style scoped lang="scss">
  .scroller {
    display: grid;
    overflow: hidden;

    &.cloned {
      &:hover {
        .scroller-content {
          animation-play-state: paused;
        }
      }
      .scroller-content {
        padding-right: var(--spacing);
        animation: scroll var(--speed) linear infinite;
      }

      .scroller-wrapper {
        mask-image: linear-gradient(
          to left,
          #0000 0%,
          #000 var(--md),
          #000 calc(100% - var(--md)),
          #0000 100%
        );
      }
    }

    @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      75% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(-100%);
      }
    }

    .scroller-wrapper {
      height: 100%;
      position: relative;
      display: flex;
      padding-left: var(--md);
      overflow: hidden;
    }

    .scroller-content {
      height: 100%;
      position: relative;
      width: max-content;
      text-wrap: nowrap;
    }
  }
</style>
