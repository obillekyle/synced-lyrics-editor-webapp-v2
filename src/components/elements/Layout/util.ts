import type Colors from '@/api/colors';
import type {
  AppSizes,
  AppSizesPrefixes,
  AppSizesString,
  ColorString,
  AppColorVariants,
  SizesString,
} from '@/api/util';

export type SizesObject = { [key in AppSizes]: SizesString };
export type AppSizesObject = { [key in AppSizesPrefixes]: SizesObject };
export const AppShades = [
  0, 1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100,
] as const;
export type AppColorShades = (typeof AppShades)[number];

export const DefaultSizes: AppSizesObject = {
  padding: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
  },
  component: {
    xxs: 8,
    xs: 16,
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
    xxl: 56,
  },
  size: {
    xxs: 24,
    xs: 36,
    sm: 48,
    md: 60,
    lg: 72,
    xl: 84,
    xxl: 96,
  },
  font: {
    xxs: 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 22,
  },
  icon: {
    xxs: 8,
    xs: 12,
    sm: 16,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
  },
};

export type ElementSizes = {
  navbar: AppSizesString;
  header: AppSizesString;
  fab: AppSizesString;
};

export const DefaultElementSizes: ElementSizes = {
  navbar: 'xl',
  header: 'md',
  fab: 'md',
};

export interface LayoutOther {
  [key: string]: any;
}

export type LayoutOptions = {
  theme: 'light' | 'dark';
  color: { [key in AppColorVariants]: ColorString | Colors };
  fontFamily: string;
  sizes: AppSizesObject;
  component: ElementSizes;
  other: LayoutOther;
};

export const DefaultLayoutOptions: LayoutOptions = {
  theme: 'dark',
  color: {
    primary: '#1a73e8',
    secondary: '#ffbe0d',
    error: '#f01c00',
    mono: '#000000',
  },
  fontFamily: 'sans-serif',
  sizes: DefaultSizes,
  component: DefaultElementSizes,
  other: {},
};
