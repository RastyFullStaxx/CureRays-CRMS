type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)] ${sizes[size]}`}
      />
    </div>
  );
}
