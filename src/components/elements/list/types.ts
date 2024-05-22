import type { Component } from 'vue';

export type SwipeOptions = {
  left?: {
    icon: string | Component;
    color: string;
    handler: () => void;
  };
  right?: {
    icon: string | Component;
    color: string;
    handler: () => void;
  };
};

export type ListItemType<T extends Record<string, any> = {}> = {
  id: number;
  props: T;
};

export type ListProps = {
  sortable?: boolean;
  swipe?: 'dismiss' | 'custom' | 'off';
  listComp?: string | Component;
  swipeDistance?: number;
  onDismiss?: (id: number) => void;
  swipeOptions?: SwipeOptions;
};
