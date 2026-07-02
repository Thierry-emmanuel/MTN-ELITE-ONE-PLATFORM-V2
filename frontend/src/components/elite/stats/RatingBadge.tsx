import { memo } from 'react';
import { ratingTone } from '@/lib/statsRating';

interface RatingBadgeProps {
  rating: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  xs: 'h-5 min-w-5 px-1 text-[9px]',
  sm: 'h-6 min-w-6 px-1 text-[10px]',
  md: 'h-8 min-w-8 px-1.5 text-[12px]',
  lg: 'h-11 min-w-11 px-2 text-[16px]',
};

export const RatingBadge = memo(({ rating, size = 'sm' }: RatingBadgeProps) => {
  const tone = ratingTone(rating);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-display font-bold tabular-nums leading-none shadow-sm ${tone.bg} ${tone.text} ${SIZE_MAP[size]}`}
      title="Note de performance"
    >
      {rating.toFixed(1)}
    </span>
  );
});
RatingBadge.displayName = 'RatingBadge';
