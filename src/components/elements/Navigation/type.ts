export type NavigationBarProps = {
  active?: number;
  labels?: 'hidden' | 'always' | 'active';
  change?: (value: number) => void;
};
