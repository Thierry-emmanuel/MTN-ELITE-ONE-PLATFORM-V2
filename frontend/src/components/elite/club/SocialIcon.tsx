import { memo } from 'react';

export type SocialNetwork = 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'tiktok';

interface SocialIconProps {
  network: SocialNetwork;
  className?: string;
}

/**
 * Minimal monochrome brand glyphs (currentColor).
 * lucide-react no longer ships brand/social icons, so these small inline
 * SVGs keep the same visual weight (1.5px stroke feel) as the rest of the UI.
 */
export const SocialIcon = memo(({ network, className = 'h-4 w-4' }: SocialIconProps) => {
  switch (network) {
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.6L18.9 2Zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20Z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M13.5 22v-8.4h2.8l.4-3.3h-3.2V8.1c0-.95.27-1.6 1.63-1.6H17V3.5A22 22 0 0 0 14.4 3.3c-2.6 0-4.4 1.6-4.4 4.5v2.5H7.2v3.3h2.8V22h3.5Z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M22.5 7.2a2.8 2.8 0 0 0-2-2C18.7 4.7 12 4.7 12 4.7s-6.7 0-8.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-4.8ZM9.8 15.5v-7l6.1 3.5-6.1 3.5Z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M16.6 2h-3.2v13.7a2.9 2.9 0 1 1-2.1-2.8v-3.3a6.2 6.2 0 1 0 5.3 6.1V8.9a8 8 0 0 0 4.6 1.5V7.2a4.8 4.8 0 0 1-4.6-5.2Z" />
        </svg>
      );
    default:
      return null;
  }
});
SocialIcon.displayName = 'SocialIcon';
