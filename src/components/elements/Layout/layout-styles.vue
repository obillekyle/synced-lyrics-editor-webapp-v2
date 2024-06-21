<script setup lang="ts">
  import { inject, onMounted, ref, watch, type ComputedRef } from 'vue';
  import { AppShades, type ElementSizes, type LayoutOptions } from './util';
  import ColorsObj, { Colors } from '@/api/colors';
  import {
    type AppColorVariants,
    type AppSizesPrefixes,
    type AppSizes,
    addPX,
    getCSSValue,
  } from '@/api/util';

  const options = inject<ComputedRef<LayoutOptions>>('options')!;
  const tag = inject<string>('layout-id')!;
  const styleElem = ref('');

  function getShades(color: string | String | Colors, prefix: string) {
    const colors =
      color instanceof Colors ? color : new ColorsObj(color.toString());
    const theme = options.value.theme;
    const values: Record<string, string> = {};

    if (theme == 'dark') {
      for (let shade of AppShades) {
        values[prefix + '-' + shade] = colors.shade(shade).hex();

        for (let j = 0; j < 9; j++) {
          const color = colors.shade(shade, (j + 1) * 0.1).hexa();
          values[prefix + '-' + shade + '-' + (j + 1) * 10] = color;
        }

        if (shade == 50) {
          const color = colors.shade(55);
          values[prefix] = color.hex();
          values['on-' + prefix] = colors.shade(color.isDark() ? 85 : 15).hex();
        }

        if (shade == 60) {
          const color = colors.shade(60);
          values[prefix + '-container'] = color.hex();
          values['on-' + prefix + '-container'] = colors
            .shade(color.isDark() ? 90 : 10)
            .hex();
        }
      }
    } else {
      for (let shade of AppShades) {
        const shadeValue = Math.abs(100 - shade);

        values[prefix + '-' + shade] = colors.shade(shadeValue, 1, theme).hex();

        for (let j = 0; j < 9; j++) {
          const color = colors.shade(shadeValue, (j + 1) * 0.1, 'light').hexa();
          values[prefix + '-' + shade + '-' + (j + 1) * 10] = color;
        }

        if (shade == 50) {
          const color = colors.shade(50, 1, 'light');
          values[prefix] = color.hex();
          values['on-' + prefix] = colors.shade(color.isDark() ? 85 : 15).hex();
        }

        if (shade == 40) {
          const color = colors.shade(60, 1, 'light');
          values[prefix + '-container'] = color.hex();
          values['on-' + prefix + '-container'] = colors
            .shade(color.darken(5).isDark() ? 95 : 10)
            .hex();
        }
      }
    }
    return values;
  }

  function getSizes(size: AppSizesPrefixes) {
    const obj: { [key: string]: string } = {};

    Object.keys(options.value.sizes[size]).forEach((key) => {
      obj[size + '-' + key] = addPX(options.value.sizes[size][key as AppSizes]);
    });

    return obj;
  }

  function setStyle() {
    setTimeout(() => {
      const values: Record<string, string> = {};
      let value = '';

      const colors = Object.keys(options.value.color) as AppColorVariants[];
      const sizes = Object.keys(options.value.sizes) as AppSizesPrefixes[];
      const components = Object.keys(
        options.value.component
      ) as (keyof ElementSizes)[];

      if (options.value.color.primary) {
        Object.assign(
          values,
          getShades(options.value.color.primary, 'primary')
        );
      }

      for (const color of colors) {
        Object.assign(values, getShades(options.value.color[color], color));
      }

      for (const size of sizes) {
        Object.assign(values, getSizes(size));
      }

      for (const component of components) {
        values[component + '-size'] = getCSSValue(
          options.value.component[component],
          'px',
          'size'
        );
      }

      for (const key in values) {
        value += `  --${key}: ${values[key]};\n`;
      }

      styleElem.value = `#${tag} {
        ${value}
        color-scheme: ${options.value.theme};
        font-family: ${options.value.fontFamily},
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          Oxygen,
          Ubuntu,
          Cantarell,
          'Open Sans',
          'Helvetica Neue',
          sans-serif;
      }`;
    });
  }

  onMounted(setStyle);
  watch(options, setStyle);
</script>

<template>
  <component is="style" :data-for="tag">
    {{ styleElem }}
  </component>
</template>
