export interface Option {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}
