<script setup lang="ts">
  import { getCSSValue, type AppSizes, getUnique } from '@/api/util';
  import { ref, type HTMLAttributes, onBeforeMount, watch } from 'vue';
  import CircularProgress from './Progress/circular-progress.vue';
  import axios from 'axios';
  import { totalmem } from 'os';
  import { Icon } from '@iconify/vue/dist/iconify.js';

  interface SquareImageProps extends /* @vue-ignore */ HTMLAttributes {
    src?: string | Blob;
    size?: number | string;
    frame?: 'default' | 'scalloped-square' | 'circle';
    radius?: String | AppSizes | number;
  }

  const progress = ref(0);
  const image = ref<string>();
  const id = getUnique();
  const error = ref(false);

  async function resolve() {
    error.value = false;

    console.log(props.src);
    if (!props.src) {
      error.value = true;
      return;
    }

    if (props.src instanceof Blob) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        image.value = reader.result as string;
      });
      reader.readAsDataURL(props.src);
      return;
    }

    const data = await axios.get<Blob | undefined>(props.src, {
      responseType: 'blob',

      onDownloadProgress: (e) => {
        progress.value = !e.total
          ? Infinity
          : Math.floor((e.loaded / e.total) * 100);
      },
    });

    if (!data.data) {
      error.value = true;
      return;
    }

    image.value = URL.createObjectURL(data.data);
  }

  const props = withDefaults(defineProps<SquareImageProps>(), {
    frame: 'default',
    radius: 'sm',
    size: 96,
  });

  onBeforeMount(() => resolve());
  watch(props, () => resolve());
</script>

<template>
  <div class="image-container" :class="{ loaded: image }">
    <div class="loader">
      <CircularProgress :size="size" :value="progress">
        <Icon
          icon="material-symbols:refresh"
          :width="24"
          color="red"
          v-if="error"
          @click="resolve"
          style="cursor: pointer"
        />
      </CircularProgress>
    </div>
    <img
      v-if="frame === 'default'"
      v-bind="$attrs"
      :src="image"
      :width="size"
      :height="size"
      :style="{
        borderRadius: getCSSValue(radius),
        objectFit: 'cover',
      }"
    />

    <svg
      v-else
      :width="size"
      :height="size"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern
        :id="`img${id}`"
        patternUnits="userSpaceOnUse"
        :width="size"
        :height="size"
      >
        <image
          :href="image"
          x="0"
          y="0"
          width="100%"
          height="100%"
          :title="$attrs['title']"
          preserveAspectRatio="xMinYMin slice"
        />
      </pattern>
      <path
        v-if="frame === 'circle'"
        d="M22.5454 0.806477C23.4502 0.304797 24.5498 0.304798 25.4546 0.806478L26.9513 1.63626C27.5369 1.96091 28.2142 2.08034 28.8755 1.97555L30.5657 1.7077C31.5876 1.54576 32.6208 1.92182 33.2996 2.70274L34.4222 3.99437C34.8614 4.49971 35.457 4.84361 36.1143 4.97131L37.7942 5.2977C38.8098 5.49504 39.6521 6.2018 40.0228 7.16776L40.636 8.76546C40.8759 9.39054 41.318 9.91742 41.8919 10.2622L43.3589 11.1435C44.2458 11.6763 44.7955 12.6285 44.8135 13.663L44.8432 15.3741C44.8549 16.0435 45.0901 16.6898 45.5115 17.2101L46.5886 18.5399C47.2398 19.344 47.4307 20.4268 47.0938 21.405L46.5365 23.0231C46.3184 23.6561 46.3184 24.3439 46.5365 24.9769L47.0938 26.595C47.4307 27.5732 47.2398 28.656 46.5886 29.4601L45.5115 30.7899C45.0901 31.3102 44.8549 31.9565 44.8432 32.6259L44.8135 34.337C44.7955 35.3715 44.2458 36.3237 43.3589 36.8565L41.8919 37.7378C41.318 38.0826 40.8759 38.6095 40.636 39.2345L40.0228 40.8322C39.6521 41.7982 38.8098 42.505 37.7942 42.7023L36.1143 43.0287C35.457 43.1564 34.8614 43.5003 34.4222 44.0056L33.2996 45.2973C32.6208 46.0782 31.5876 46.4542 30.5657 46.2923L28.8755 46.0245C28.2142 45.9197 27.5369 46.0391 26.9513 46.3637L25.4546 47.1935C24.5498 47.6952 23.4502 47.6952 22.5454 47.1935L21.0487 46.3637C20.4631 46.0391 19.7858 45.9197 19.1245 46.0245L17.4343 46.2923C16.4124 46.4542 15.3792 46.0782 14.7004 45.2973L13.5778 44.0056C13.1386 43.5003 12.543 43.1564 11.8857 43.0287L10.2058 42.7023C9.19016 42.505 8.34787 41.7982 7.97717 40.8322L7.36402 39.2345C7.12413 38.6095 6.68203 38.0826 6.1081 37.7378L4.64114 36.8565C3.75424 36.3237 3.20447 35.3715 3.1865 34.337L3.15677 32.6259C3.14514 31.9565 2.90991 31.3102 2.48851 30.7899L1.41143 29.4601C0.760246 28.656 0.569316 27.5732 0.906243 26.595L1.46352 24.9769C1.68156 24.3439 1.68156 23.6561 1.46352 23.0231L0.906243 21.405C0.569316 20.4268 0.760247 19.344 1.41144 18.5399L2.48851 17.2101C2.90991 16.6898 3.14514 16.0435 3.15677 15.3741L3.1865 13.663C3.20447 12.6285 3.75424 11.6763 4.64114 11.1435L6.1081 10.2622C6.68203 9.91742 7.12413 9.39054 7.36402 8.76546L7.97717 7.16776C8.34787 6.2018 9.19016 5.49504 10.2058 5.2977L11.8857 4.97131C12.543 4.84361 13.1386 4.49971 13.5778 3.99437L14.7004 2.70274C15.3792 1.92182 16.4124 1.54576 17.4343 1.7077L19.1245 1.97555C19.7858 2.08034 20.4631 1.96091 21.0487 1.63626L22.5454 0.806477Z"
        :fill="`url(#img${id})`"
      />
      <path
        v-else
        d="M3.00852 17.8934C-3.80233 8.1028 8.10279 -3.80233 17.8934 3.00852C21.5641 5.56203 26.4359 5.56203 30.1066 3.00852C39.8972 -3.80233 51.8023 8.10279 44.9915 17.8934C42.438 21.5641 42.438 26.4359 44.9915 30.1066C51.8023 39.8972 39.8972 51.8023 30.1066 44.9915C26.436 42.438 21.5641 42.438 17.8934 44.9915C8.1028 51.8023 -3.80233 39.8972 3.00852 30.1066C5.56203 26.436 5.56203 21.5641 3.00852 17.8934Z"
        :fill="`url(#img${id})`"
      />
    </svg>
  </div>
</template>

<style lang="scss" scoped>
  .image-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    .loader {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      opacity: 1;
      transition: opacity 0.2s ease-out;
    }

    image,
    img {
      opacity: 0;
      transition: opacity 0.2s ease-out;
    }

    &.loaded {
      .loader {
        opacity: 0;
      }

      image,
      img {
        opacity: 1;
      }
    }
  }
</style>
