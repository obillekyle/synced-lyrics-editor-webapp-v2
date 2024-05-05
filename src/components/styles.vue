<script setup lang="ts">
  import { inject, onMounted, onUnmounted, ref, type Ref, watch } from 'vue';

  const Colors = window.app.colors;
  const Player = window.app.player;
  const theme = inject<Ref<string>>('app-theme')!;
  const styleElem = ref('');

  function setStyle() {
    let value = 'html {\n';

    if (theme.value == 'dark') {
      for (let i = 0; i < 10; i++) {
        const index = i === 0 ? 5 : i * 10;
        const shade = index * 10;
        value += `  --color-${shade}: ${Colors.shade(index).hexa()};\n`;

        for (let j = 0; j < 9; j++) {
          const color = Colors.shade(index, (j + 1) * 0.1).hexa();
          value += `  --color-${shade}-${(j + 1) * 10}: ${color};\n`;
        }
      }
    } else {
      for (let i = 0; i < 10; i++) {
        const index = i === 9 ? 95 : (i + 1) * 10;
        const shade = (index - 100) * -10;
        console.log(shade, index);
        value += `  --color-${shade}: ${Colors.shade(index).hexa()};\n`;

        for (let j = 0; j < 9; j++) {
          const color = Colors.shade(index, (j + 1) * 0.1).hexa();
          value += `  --color-${shade}-${(j + 1) * 10}: ${color};\n`;
        }
      }
    }

    value += '  --color-primary: var(--color-500);\n';
    value += '  --album-color: var(--color-primary);\n';
    value += `  --album-image: url('${Player.picture?.data}');\n`;
    value += `  --album-blur: url('${Player.picture?.blur}');\n`;
    value += `  color-scheme: ${theme.value};\n`;
    value += '}\n';

    document.body.classList.toggle('dark', theme.value != 'light');

    styleElem.value = value;
  }

  onMounted(() => {
    setStyle();
    Colors.addEventListener('update', setStyle);
  });

  watch(theme, setStyle);

  onUnmounted(() => {
    Colors.removeEventListener('update', setStyle);
  });
</script>

<template>
  <component is="style" v-html="styleElem" />
</template>
