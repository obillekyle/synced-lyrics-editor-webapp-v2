export const AppScreens = ['home', 'edit', 'timing', 'lyric', 'debug'] as const
export type Screens = (typeof AppScreens)[number]
export const defaultColor = 'rgb(76, 255, 165)'
