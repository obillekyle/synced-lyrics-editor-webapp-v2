export const AppScreens = ['edit', 'timing', 'lyric', 'debug'] as const;
export type Screens = typeof AppScreens[number];