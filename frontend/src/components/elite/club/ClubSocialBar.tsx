import { memo } from 'react';
import { Globe } from 'lucide-react';
import { SocialIcon, type SocialNetwork } from './SocialIcon';
import { VitrinePanel } from './ClubSectionShell';
import type { Club } from '@/types/football.types';

interface ClubSocialBarProps {
  club: Club;
}

const NETWORKS: { key: SocialNetwork; label: string }[] = [
  { key: 'twitter',   label: 'X (Twitter)' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook',  label: 'Facebook' },
  { key: 'youtube',   label: 'YouTube' },
  { key: 'tiktok',    label: 'TikTok' },
];

export const ClubSocialBar = memo(({ club }: ClubSocialBarProps) => {
  const primary = club.color || '#FCD116';
  const links = NETWORKS.filter(n => club.socialMedia?.[n.key]);

  if (links.length === 0 && !club.websiteUrl) return null;

  return (
    <VitrinePanel className="p-7 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="text-center sm:text-left">
        <h3 className="font-display text-xl font-black text-white flex items-center gap-2 justify-center sm:justify-start">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primary }} />
          Suivez {club.short}
        </h3>
        <p className="text-sm text-white/45 mt-1">Restez connecté à l'actualité officielle du club.</p>
      </div>
      <div className="flex items-center gap-3">
        {club.websiteUrl && (
          <a
            href={club.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Site officiel"
            className="h-11 w-11 rounded-full grid place-items-center border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <Globe className="h-4 w-4" />
          </a>
        )}
        {links.map(n => (
          <a
            key={n.key}
            href={club.socialMedia![n.key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={n.label}
            className="h-11 w-11 rounded-full grid place-items-center border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <SocialIcon network={n.key} className="h-4 w-4" />
          </a>
        ))}
      </div>
    </VitrinePanel>
  );
});
ClubSocialBar.displayName = 'ClubSocialBar';
