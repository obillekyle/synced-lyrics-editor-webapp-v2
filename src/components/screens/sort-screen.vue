<script setup lang="ts">
import type { LRCLine } from '@/api/parser'
import type { ObjectValue } from '@vue-material/core/utils/other/to-object-value.js'

import { List } from '@vue-material/core'
import { onBeforeUnmount, ref } from 'vue'

const Lyrics = window.app.lyric
const raw = Lyrics.getRaw()

const lrc = ref<ObjectValue[]>(
	raw.lines.map((line, index) => ({
		value: line.id,
		label: index,
	})),
)

onBeforeUnmount(() => {
	Lyrics.import({
		tags: raw.tags,
		lines: [...lrc.value]
			.sort((a, b) => a.label - b.label)
			.map<LRCLine>((line) => raw.lines[line.label]),
	})
})
</script>

<template>
  <div class="sort-screen">
    <div class="guide">Swipe left or right to remove</div>
    <List
      v-model="lrc"
      swipe="dismiss"
    >
      <template #default="{ label }">
        {{ raw.lines[label].data }}
      </template>
    </List>
  </div>
</template>