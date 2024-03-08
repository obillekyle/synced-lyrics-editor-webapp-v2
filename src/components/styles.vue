<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';

  const Colors = window.app.colors;
  const Player = window.app.player;
  const styleElem = ref('');

  function setStyle() {
    styleElem.value = `
    <style>
      body {
        --color-primary: ${Colors.main};
        --color-50: ${Colors.array[0]};
        --color-100: ${Colors.array[1]};
        --color-200: ${Colors.array[2]};
        --color-300: ${Colors.array[3]};
        --color-400: ${Colors.array[4]};
        --color-500: ${Colors.array[5]};
        --color-600: ${Colors.array[6]};
        --color-700: ${Colors.array[7]};
        --color-800: ${Colors.array[8]};
        --color-900: ${Colors.array[9]};

        --overlay-10: ${Colors.alphas[0]};
        --overlay-20: ${Colors.alphas[1]};
        --overlay-30: ${Colors.alphas[2]};
        --overlay-40: ${Colors.alphas[3]};
        --overlay-50: ${Colors.alphas[4]};
        --overlay-60: ${Colors.alphas[5]};
        --overlay-70: ${Colors.alphas[6]};
        --overlay-80: ${Colors.alphas[7]};
        --overlay-90: ${Colors.alphas[8]};

        --album-color: var(--color-primary);
        --album-image: url('${Player.picture?.data}');
        --album-blur: url('${Player.picture?.blur}');
      }
    </style>
    `;
  }

  onMounted(() => {
    setStyle();
    Colors.addEventListener('update', setStyle);
  });

  onUnmounted(() => {
    Colors.removeEventListener('update', setStyle);
  });
</script>

<template>
  <div v-html="styleElem"></div>
</template>
