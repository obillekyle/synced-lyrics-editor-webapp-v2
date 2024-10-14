import type { Screens } from '@/app/main'

import { useLocalStorage } from '@vue-material/core'
import { inject, provide } from 'vue'
import { useShared } from './use-shared'

export const useScreen = () => useShared<Screens>('app-screen', 'home')
