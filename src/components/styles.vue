<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';

  const Colors = window.app.colors;
  const Player = window.app.player;
  const styleElem = ref('');

  function setStyle() {
    let value = 'body {\n';

    for (let i = 0; i < 10; i++) {
      const index = i === 0 ? 5 : i * 10;
      const shade = index * 10;
      value += `  --color-${shade}: ${Colors.shade(index).hexa()};\n`;

      for (let j = 0; j < 9; j++) {
        const color = Colors.shade(index, (j + 1) * 0.1).hexa();
        value += `  --color-${shade}-${(j + 1) * 10}: ${color};\n`;
      }
    }

    value += '  --color-primary: var(--color-500);\n';
    value += '  --album-color: var(--color-primary);\n';
    value += `  --album-image: url('${Player.picture?.data}');\n`;
    value += `  --album-blur: url('${Player.picture?.blur}');\n`;
    value += '}\n';

    styleElem.value = value;

    // <style>
    //   body {
    //     --color-primary: ${Colors.main};
    //     --color-50: ${Colors.array[0]};
    //     --color-100: ${Colors.array[1]};
    //     --color-200: ${Colors.array[2]};
    //     --color-300: ${Colors.array[3]};
    //     --color-400: ${Colors.array[4]};
    //     --color-500: ${Colors.array[5]};
    //     --color-600: ${Colors.array[6]};
    //     --color-700: ${Colors.array[7]};
    //     --color-800: ${Colors.array[8]};
    //     --color-900: ${Colors.array[9]};

    //     --color-600-10: ${Colors.alphas[0]};
    //     --color-600-20: ${Colors.alphas[1]};
    //     --color-600-30: ${Colors.alphas[2]};
    //     --color-600-40: ${Colors.alphas[3]};
    //     --color-600-50: ${Colors.alphas[4]};
    //     --color-600-60: ${Colors.alphas[5]};
    //     --color-600-70: ${Colors.alphas[6]};
    //     --color-600-80: ${Colors.alphas[7]};
    //     --color-600-90: ${Colors.alphas[8]};

    //   }
    // </style>
    // `;
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
  <component is="style" v-html="styleElem" />
</template>
