export const AppScreens = [
  'edit',
  'timing',
  'lyric',
  'debug',
  'files',
] as const;
export type Screens = (typeof AppScreens)[number];
