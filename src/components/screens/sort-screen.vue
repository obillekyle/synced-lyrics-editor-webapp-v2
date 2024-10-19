<script setup lang="ts">
import { List } from '@vue-material/core'
import { h, onBeforeUnmount, ref } from 'vue'
import SortItem from './sort-item.vue'

const Lyrics = window.app.lyric
const raw = Lyrics.getRaw()

const lines = ref(
	Object.keys(raw.lines).map((line) => ({
		label: line,
		value: line,
	})),
)

onBeforeUnmount(() => {
	Lyrics.import({
		tags: raw.tags,
		lines: Object.fromEntries(
			lines.value.map(({ value }) => [value, raw.lines[value]]),
		),
	})
})
</script>

<template>
  <div class="sort-screen">
    <div class="guide">Swipe left or right to remove</div>
    <List
      v-model="lines"
      swipe="dismiss"
      sortable
      :list-comp="SortItem"
    >
    <template #default="{ label }">
        {{ raw.lines[label].data }}
      </template>
    </List>
  </div>
</template>