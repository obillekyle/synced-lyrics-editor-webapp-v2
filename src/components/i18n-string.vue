<script setup lang="ts">
import type { BoxProps } from '@vue-material/core'

import { useLang } from '@/hooks/use-lang'
import { Text } from '@vue-material/core'
import { ref } from 'vue'

interface I18nProps extends /* @vue-ignore */ BoxProps {
	entry: string
	fallback?: string
	args?: unknown[]
	apply?: string[]
}

const value = ref<string>()
const props = defineProps<I18nProps>()
const lang = useLang('en')
</script>

<template>
  <Text class="i18n-string">
    <slot v-if="!value">
      {{ lang.get(props.entry, ...props.args || []) || props.fallback }}
    </slot>

    <template v-else>
      {{ value }}
    </template>
  </Text>
</template>
