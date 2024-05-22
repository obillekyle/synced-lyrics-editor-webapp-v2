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
  items?: ListItemType[];
  swipe?: 'dismiss' | 'custom' | 'off';
  listComp?: string | Component;
  swipeDistance?: number;
  onReorder?: (from: number, to: number) => void;
  onDismiss?: (id: number) => void;
  swipeOptions?: SwipeOptions;
};
