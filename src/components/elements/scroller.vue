<script setup lang="ts">
  import { addPX, addUnit } from '@/api/util';
  import { onMounted, ref } from 'vue';
  const wrapper = ref<HTMLDivElement | null>(null);
  const content = ref<HTMLDivElement | null>(null);

  const cloned = ref(false);

  function setScroll() {
    cloned.value = false;
    setTimeout(() => {
      if (wrapper.value && content.value) {
        const wRect = wrapper.value.getBoundingClientRect();
        const cRect = content.value.getBoundingClientRect();

        cloned.value = wRect.width < content.value.offsetWidth;
        wrapper.value.style.setProperty(
          '--speed',
          addUnit(cRect.width / 40, 's')
        );
      }
    });
  }

  onMounted(() => {
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
        padding-right: 50%;
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
      90% {
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
