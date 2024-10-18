<script setup lang="ts">
import { useFetch } from '@/hooks/use-fetch'
import { Button, LinearProgress } from '@vue-material/core'
import { parse } from 'marked'

const fetch = useFetch('/changelog.md', 'text')
</script>

<template>
  <LinearProgress v-if="fetch.loading" />
  <Button v-else-if="fetch.error" @click="fetch.refetch">Reload</Button>
  <div v-else v-html="parse(fetch.data || 'No data')" class="changelog marked-content" />
</template>
