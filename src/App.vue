<script setup lang="ts">
import { computed, ref, watch } from "vue";

import AppTag from "./components/elements/Text/app-tag.vue";
import I18nString from "./components/elements/Text/i18n-string.vue";
import Progress from "./components/elements/Progress/linear-progress.vue";
import AppHeader from "./components/header.vue";
import NavigationBar from "./components/navigation/navigation-bar.vue";
import AppPlayer from "./components/player.vue";
import LrcScreen from "./components/screens/main.vue";
import LyricCard from "./components/screens/lyric-card.vue";
import _presets from "./components/modals/_presets";
import { Layout } from "@vue-material/core";
import { useScreen } from "./hooks/use-screen";
import { useConfig } from "./hooks/use-config";
import { useSession } from "./hooks/use-session";
import { useAppData } from "./hooks/use-app-data";
import { useLocation } from "./hooks/use-location";
import { $ } from "./api/util";

const screen = useScreen();
const config = useConfig();
const session = useSession();
const appData = useAppData();
const location = useLocation();

const ready = ref(false);
const loaderRef = ref<HTMLElement | null>(null);

const page = computed(() => {
	return location.pathname.split("/")[1];
});

function setMetaDescription(value: string) {
	const metaDesc = $('meta[name="description"]')?.setAttribute(
		"content",
		value,
	);
}

watch(page, (page) => {
	switch (page) {
		case "lyric-card":
			document.title = "Lyrics Card Maker | Synced Lyrics Editor and Maker v2 ";
			setMetaDescription(
				"Create your own lyrics card in seconds with our new lyrics card maker.",
			);
			break;
		default:
			document.title = "Synced Lyrics Editor and Maker v2";
			setMetaDescription(
				"Create your own synced lyrics for the music you love – right from your browser. A sound file is required.",
			);
			break;
	}
});
</script>

<template>
  <div class="loader" :class="{ ready }" ref="loaderRef">
    <img alt="App Logo" src="/logo.svg" width="96" height="96" />
    <Progress :value="Infinity" />
  </div>

  <Layout :options="{
    theme: config.preferences.theme,
    colors: config.preferences.colorScheme,
  }">
    <template #navbar>
      <NavigationBar />
    </template>

    <template #header>
      <AppHeader />
    </template>

    <template v-if="ready">

      <LyricCard v-if="page === 'lyric-card'" />
      <template v-else>
        <I18nString entry="ALPHA" :element="AppTag" v-if="!config.preferences" />
        <LrcScreen />
        <AppPlayer />
      </template>
    </template>
  </Layout>

</template>

<style lang="scss" scoped>
  .loader {
    color: white;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100dvh;
    width: 100dvw;
    gap: var(--xl);
    position: fixed;
    inset: 0;
    z-index: 1000;
    transition: opacity 0.4s;
    .progress {
      width: clamp(0px, 96px, 500px);
    }
    &.ready {
      opacity: 0;
      pointer-events: none;
    }
  }

  @media (prefers-color-scheme: dark) {
    .loader {
      background: #222;
    }
  }

  main {
    position: relative;
    display: block;
    height: calc(100dvh - var(--app-header-height) - var(--app-player-height));
    width: calc(100dvw - var(--app-navbar-size));
    transform: translate(0, 0);
    overflow: overlay;

    &:has(.preview-screen) {
      mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 56px,
        black calc(100% - 56px),
        transparent 100%
      );
    }
  }

  .content-wrapper {
    position: fixed;
    contain: content;
    inset: 0 0 0 var(--app-navbar-size);
    overflow: hidden;
  }

  @media screen and (max-width: 600px) {
    main {
      width: 100vw;
      height: calc(
        100dvh - var(--app-header-height) - var(--app-player-height) - var(
            --app-navbar-size
          )
      );

      &::-webkit-scrollbar {
        width: 0px;
        height: 0px;
      }
    }
    .content-wrapper {
      inset: 0 0 var(--app-navbar-size) 0;
    }
  }
</style>

<style lang="scss">
  #app:has([data-screen='lyric']) {
    background: linear-gradient(
        to bottom,
        var(--primary-10-40) -20%,
        var(--primary-10-70) 20%,
        var(--primary-10-90) 60%,
        var(--primary-10) 100%
      ),
      var(--album-blur, var(--primary-10));
    background-size: cover;
    height: 100dvh;
    background-position: center, center;
  }
</style>
