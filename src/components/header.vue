<script setup lang="ts">
import type { Screens } from '@/app/main'

import { useConfig } from '@/hooks/use-config'
import { useScreen } from '@/hooks/use-screen'
import { useSession } from '@/hooks/use-session'
import {
	Button,
	Divider,
	Floater,
	IconButton,
	Switch,
	TopAppBar,
} from '@vue-material/core'
import I18nString from './i18n-string.vue'
import { useOverlays } from './overlays/use-overlays'

const screenNames: Record<Screens, string> = {
	home: 'APP_HOME',
	edit: 'APP_EDIT',
	timing: 'APP_TIMING',
	lyric: 'APP_LYRIC',
	debug: 'DEBUG',
}

const screen = useScreen()
const session = useSession()
const config = useConfig()
const overlays = useOverlays()
</script>

<template>
  <TopAppBar :headline="screen === 'home' ? 'Synced Lyrics Editor' : undefined">
    <I18nString class="app-title" v-if="screen !== 'home'" :entry="screenNames[screen]" element="h3" />
    <template #actions>
      <template v-if="screen === 'lyric'">
        <I18nString entry="TRANSLATE" fallback="Translate" />
        <Switch v-model="session.preview.translate" title="Translate" />
        <Divider direction="y" size="24" margin="none" />
      </template>

      <template v-if="screen === 'timing'">
        <IconButton
          :icon="session.timing.sorting ? 'mdi:clock-edit-outline' : 'mdi:sort-ascending'"
          @click="session.timing.sorting = !session.timing.sorting"
          title="Switch sorting mode"
        />
        <Divider direction="y" size="24" margin="none" />
      </template>

      <Floater text="LRC" pos="bottom">
        <IconButton
          @click="overlays.uploadNewLrc"
          class="icon-button"
          title="Open LRC file"
          icon="material-symbols:upload-file-outline-sharp"
        />
      </Floater>
      <Button
        variant="tonal"
        title="Export"
        icon="material-symbols:download"
        right-icon="mdi:export"
        @click="overlays.download"
      >
        <I18nString entry="EXPORT" />
      </Button>
    </template>
  </TopAppBar>
</template>

<style scoped>
.app-title {
  font-size: var(--font-lg);
  margin-left: var(--xl);
}
</style>