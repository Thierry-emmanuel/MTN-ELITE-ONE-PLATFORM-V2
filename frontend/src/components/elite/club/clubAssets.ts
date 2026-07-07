// ─── Club visual asset registry ────────────────────────────────────────────────
// Centralises every bundled image used across the Club Hub so Vite can hash /
// optimise them properly (fixes the previous broken "/assets/..." public paths).

import cotonsport   from '@/assets/images/logo/Cotonsport_logo.png';
import dynamoDouala from '@/assets/images/logo/dynamo_douala.png';
import pwd          from '@/assets/images/logo/Pwd_logo.png';
import canon        from '@/assets/images/logo/Canon_logo.png';
import uniisport     from '@/assets/images/logo/Uniisport_bafang_logo.png';
import aigleMoungo   from '@/assets/images/logo/Aigle_Moungo_logo.png';
import colombe       from '@/assets/images/logo/colombe_logo.png';
import victoria      from '@/assets/images/logo/victoria_logo.png';
import fauve         from '@/assets/images/logo/fauve_logo.png';
import panthere      from '@/assets/images/logo/panthere_logo.png';

import heroStadium from '@/assets/hero-stadium.jpg';

import actionImg1  from '@/assets/images/actions/img1.png';
import actionImg2  from '@/assets/images/actions/img2.png';
import actionImg3  from '@/assets/images/actions/img3.png';
import actionImg4  from '@/assets/images/actions/img4.png';
import actionImg5  from '@/assets/images/actions/img5.png';
import actionImg6  from '@/assets/images/actions/img6.png';
import actionImg7  from '@/assets/images/actions/img7.png';
import actionImg8  from '@/assets/images/actions/img8.png';
import actionImg9  from '@/assets/images/actions/img9.png';
import actionImg10 from '@/assets/images/actions/img10.png';

import equipeCanon    from '@/assets/images/equipe/canon.png';
import equipeCanon2   from '@/assets/images/equipe/canon2.png';
import equipeColombe  from '@/assets/images/equipe/colombe.png';
import equipeColombe2 from '@/assets/images/equipe/colombe2.png';
import equipeCoton    from '@/assets/images/equipe/coton.png';
import equipeVictoria from '@/assets/images/equipe/victoria.png';

import trophyBallonDor from '@/assets/images/trophies/ballon-dor-cameroun.png';

/** club.id → crest image (bundled, hashed) */
export const CLUB_CRESTS: Record<string, string> = {
  cot:  cotonsport,
  uds:  dynamoDouala,
  pwd:  pwd,
  cnk:  canon,
  ymb:  uniisport,
  apb:  aigleMoungo,
  cof:  colombe,
  vict: victoria,
  fov:  fauve,
  bam:  panthere,
};

/** Generic on-pitch action shots, used to round out any club's gallery */
export const ACTION_POOL = [
  actionImg1, actionImg2, actionImg3, actionImg4, actionImg5,
  actionImg6, actionImg7, actionImg8, actionImg9, actionImg10,
];

/** club.id → dedicated action photography, when available */
export const CLUB_ACTION_SHOTS: Record<string, string[]> = {
  cot:  [equipeCoton],
  cnk:  [equipeCanon, equipeCanon2],
  cof:  [equipeColombe, equipeColombe2],
  vict: [equipeVictoria],
};

export const STADIUM_FALLBACK_IMAGE = heroStadium;
export const TROPHY_ICON_IMAGE = trophyBallonDor;

/** Builds a stable, varied gallery for a given club id (6 images). */
export function buildClubGallery(clubId: string): string[] {
  const dedicated = CLUB_ACTION_SHOTS[clubId] ?? [];
  const seed = clubId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rotated = [...ACTION_POOL.slice(seed % ACTION_POOL.length), ...ACTION_POOL.slice(0, seed % ACTION_POOL.length)];
  const fillers = rotated.filter(img => !dedicated.includes(img));
  return [...dedicated, ...fillers].slice(0, 6);
}
