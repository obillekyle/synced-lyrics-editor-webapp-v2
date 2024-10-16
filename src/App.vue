<script setup lang="ts">
import type { AppOverlays } from './components/overlays/use-overlays'

import { computed, onMounted, shallowRef, watch } from 'vue'

import AppTag from './components/app-tag.vue'
import AppHeader from './components/header.vue'
import I18nString from './components/i18n-string.vue'
import NavigationBar from './components/navigation/navigation-bar.vue'
import AppOverlayProvider from './components/overlays/provider.vue'
import AppPlayer from './components/player.vue'
import LyricCard from './components/screens/lyric-card.vue'
import LrcScreen from './components/screens/main.vue'

import {
	$,
	Layout,
	LinearProgress,
	OverlayProvider,
	SquareImage,
} from '@vue-material/core'

import { useOverlays } from './components/overlays/use-overlays'
import { useAppData } from './hooks/use-app-data'
import { useConfig } from './hooks/use-config'
import { useLang } from './hooks/use-lang'
import { useLocation } from './hooks/use-location'
import { useScreen } from './hooks/use-screen'
import { useSession } from './hooks/use-session'

const screen = useScreen()
const config = useConfig()
const session = useSession()
const appData = useAppData()
const location = useLocation()
const lang = useLang('en')

const o = shallowRef({} as AppOverlays)
const overlays = useOverlays(o.value)

const page = computed(() => location.pathname.split('/')[1])

function setMetaDescription(value: string) {
	$('meta[name="description"]')?.setAttribute('content', value)
}

watch(page, (page) => {
	switch (page) {
		case 'lyric-card':
			document.title = 'Lyrics Card Maker | Synced Lyrics Editor and Maker v2 '
			setMetaDescription(
				'Create your own lyrics card in seconds with our new lyrics card maker.',
			)
			break
		default:
			document.title = 'Synced Lyrics Editor and Maker v2'
			setMetaDescription(
				'Create your own synced lyrics for the music you love – right from your browser. A sound file is required.',
			)
			break
	}
})

onMounted(() => {
	window.app.presets = overlays
})
</script>

<template>
  <AppOverlayProvider>
    <Layout :options="{
      theme: config.preferences.theme,
      fontFamily: 'Roboto Flex, sans-serif',
      colors: { primary: 'green', ...config.preferences.colorScheme } ,
    }">
      <template #navbar>
        <NavigationBar />
      </template>
      <template #header>
        <AppHeader />
      </template>
    
      <OverlayProvider>
        <Transition name="splash-loader">
          <div class="splash-loader" v-if="!lang.ready">
            <div class="splash-loader-wrapper" >
              <img alt="App Logo" src="/logo.svg" width="128" height="128" />
              <LinearProgress  />
            </div>
          </div>
        </Transition>
        <template v-if="lang.ready">
          <LyricCard v-if="page === 'lyric-card'" />
          <template v-else>
            <I18nString entry="ALPHA" :as="AppTag" v-if="!config.preferences" />
            <LrcScreen />
            <AppPlayer />
          </template>
        </template>
      </OverlayProvider>
    </Layout>
  </AppOverlayProvider>
</template>

<style lang="scss">
  .splash-loader {
    background: var(--surface-container-low);
    display: grid;
    place-items: center;
    position: fixed;
    inset: 0;
    z-index: 100;

    img {
      margin-inline: auto;
    }

    &-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: var(--component-md);
      width: min(150px, 100%);
    }

    &-leave-active {
      transition: opacity 0.3s ease;
      transition-delay: 1000ms;
    }

    &-leave-to {
      opacity: 0;
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
