<script setup lang="ts">
  import { inject, onMounted, onUnmounted, ref, type Ref, watch } from 'vue';
  import ColorsObj, { Colors } from '@/api/colors';
  import { AppShades } from './elements/Layout/util';

  const Player = window.app.player;
  const theme = inject<Ref<'light' | 'dark'>>('app-theme')!;
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

  function getShades(color: string | String | Colors, prefix: string) {
    const colors =
      color instanceof Colors ? color : new ColorsObj(color.toString());
    const values: Record<string, string> = {};

    if (theme.value == 'dark') {
      for (let shade of AppShades) {
        values[prefix + '-' + shade] = colors.shade(shade).hex();

        for (let j = 0; j < 9; j++) {
          const color = colors.shade(shade, (j + 1) * 0.1).hexa();
          values[prefix + '-' + shade + '-' + (j + 1) * 10] = color;
        }

        if (shade == 50) {
          const color = colors.shade(50);
          values[prefix] = color.hex();
          values['on-' + prefix] = colors.shade(color.isDark() ? 90 : 10).hex();
        }

        if (shade == 70) {
          const color = colors.shade(70);
          values[prefix + '-container'] = color.hex();
          values['on-' + prefix + '-container'] = colors
            .shade(color.isDark() ? 90 : 10)
            .hex();
        }
      }
    } else {
      for (let shade of AppShades) {
        const shadeValue = Math.abs(100 - shade);

        values[prefix + '-' + shade] = colors
          .shade(shadeValue, 1, theme.value)
          .hex();

        for (let j = 0; j < 9; j++) {
          const color = colors.shade(shadeValue, (j + 1) * 0.1, 'light').hexa();
          values[prefix + '-' + shade + '-' + (j + 1) * 10] = color;
        }

        if (shade == 50) {
          const color = colors.shade(50, 1, 'light');
          values[prefix] = color.hex();
          values['on-' + prefix] = colors.shade(color.isDark() ? 90 : 10).hex();
        }

        if (shade == 30) {
          const color = colors.shade(70, 1, 'light');
          values[prefix + '-container'] = color.hex();
          values['on-' + prefix + '-container'] = colors
            .shade(color.isDark() ? 90 : 10)
            .hex();
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
        'album-color': 'var(--primary)',
        'album-image': `url('${Player.picture?.data || ''}')`,
        'album-blur': `url('${Player.picture?.blur || ''}')`,
      });

      Object.assign(values, getShades(props.Colors, 'primary'));
      Object.assign(values, getShades(new Colors('#000000'), 'mono'));

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
