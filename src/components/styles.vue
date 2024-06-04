<script setup lang="ts">
  import { inject, onMounted, onUnmounted, ref, type Ref, watch } from 'vue';
  import ColorsObj from '@/api/colors';

  const Player = window.app.player;
  const theme = inject<Ref<string>>('app-theme')!;
  const styleElem = ref('');

  const props = withDefaults(
    defineProps<{
      tag?: string;
      Colors?: ColorsObj;
    }>(),
    {
      tag: 'html',
      Colors: () => window.app.colors,
    }
  );

  function getShades(colors: ColorsObj, prefix = 'color') {
    const values: Record<string, string> = {};

    if (theme.value == 'dark') {
      for (let i = 0; i < 12; i++) {
        const index = i === 1 ? 5 : i === 0 ? 0 : (i - 1) * 10;
        const shade = index * 10;
        values[prefix + '-' + shade] = colors.shade(index).hexa();

        for (let j = 0; j < 9; j++) {
          const color = colors.shade(index, (j + 1) * 0.1).hexa();
          values[prefix + '-' + shade + '-' + (j + 1) * 10] = color;
        }
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const index = i === 10 ? 95 : i === 11 ? 100 : i * 10;
        const shade = Math.abs((index - 100) * -10);
        values[prefix + '-' + shade] = colors.shade(index).hexa();

        for (let j = 0; j < 9; j++) {
          const color = colors.shade(index, (j + 1) * 0.1).hexa();
          values[prefix + '-' + shade + '-' + (j + 1) * 10] = color;
        }
      }
    }
    return values;
  }

  function setStyle() {
    setTimeout(() => {
      const values: Record<string, string> = {};

      let value = '';

      Object.assign(values, {
        'color-primary': 'var(--color-500)',
        'album-color': 'var(--color-primary)',
        'album-image': `url('${Player.picture?.data || ''}')`,
        'album-blur': `url('${Player.picture?.blur || ''}')`,
      });

      Object.assign(values, getShades(props.Colors));
      Object.assign(values, getShades(new ColorsObj('#000000'), 'mono'));

      for (const key in values) {
        value += `  --${key}: ${values[key]};\n`;
      }

      if (props.tag == 'html') {
        const themeColor = document.querySelector('meta[name="theme-color"]');
        document.body.classList.toggle('dark', theme.value != 'light');
        themeColor?.setAttribute('content', values['color-100']);
      }

      styleElem.value = `${props.tag} {
        ${value}
        color-scheme: ${theme.value};
      }`;
    });
  }

  onMounted(() => {
    setStyle();
    props.Colors.addEventListener('update', setStyle);
  });

  watch(theme, setStyle);
  watch(props, setStyle);

  onUnmounted(() => {
    props.Colors.removeEventListener('update', setStyle);
  });
</script>

<template>
  <component is="style" v-html="styleElem" :data-for="tag" />
</template>
