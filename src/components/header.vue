<script setup lang="ts">
import type { Screens } from "@/app/main";

import I18nString from "./i18n-string.vue";
import presets from "./modals/presets";
import {
	IconButton,
	Switch,
	Divider,
	Button,
	Floater,
	TopAppBar,
} from "@vue-material/core";
import { useScreen } from "@/hooks/use-screen";
import { useSession } from "@/hooks/use-session";

const screenNames: Record<Screens, string> = {
	home: "APP_HOME",
	edit: "APP_EDIT",
	timing: "APP_TIMING",
	lyric: "APP_LYRIC",
	debug: "DEBUG",
};

const screen = useScreen();
const session = useSession();
</script>

<template>
  <TopAppBar :data-screen="screen">
    <I18nString :entry="screenNames[screen]" element="h3" />
    <div class="actions">
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
          :onclick="presets.uploadNewLrc"
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
        r="#xs"
        @click="presets.download"
      >
        <I18nString entry="EXPORT" />
      </Button>
    </div>
  </TopAppBar>
</template>
