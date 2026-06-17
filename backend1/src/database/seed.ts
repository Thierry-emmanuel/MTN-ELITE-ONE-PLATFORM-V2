// src/database/seed.ts
// ============================================================================
// MTN Elite One — NestJS Seed Runner
// Usage:
//   npx ts-node -r tsconfig-paths/register src/database/seed.ts
//   or add to package.json: "seed": "ts-node -r tsconfig-paths/register src/database/seed.ts"
// ============================================================================

import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { MongoClient }  from 'mongodb';
import { hash }         from 'bcrypt';
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid';

import { SeasonStatus }    from '../seasons/season.entity';
import { ClubStatus }      from '../clubs/club.entity';
import { PlayerPosition }  from '../players/player.entity';
import { MatchStatus }     from '../matches/match.entity';
import { MatchEventType }  from '../matches/match-event.entity';
import { UserRole }        from '../users/user.entity';

import {
  SEASON, CLUBS, PLAYERS, MATCHES,
  MATCH_EVENTS, MATCH_STATS, STANDINGS, USERS,
} from './seed.data';

// ── TypeORM DataSource ───────────────────────────────────────────────────────
const AppDataSource = new DataSource({
  type:     'postgres',
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME     ?? 'mtn_elite_one',
  synchronize: false,
  entities: [
    __dirname + '/../**/*.entity{.ts,.js}',
  ],
});

// ── MongoDB ──────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/mtn_elite_one';

async function seedPostgres(ds: DataSource) {
  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    console.log('\n🐘 Seeding PostgreSQL…');

    // Disable FK checks during bulk insert
    await qr.query('SET session_replication_role = replica;');

    // ── Season ──────────────────────────────────────────────────────────────
    console.log('  → Season…');
    await qr.query(`
      INSERT INTO seasons (id, name, start_date, end_date, status)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (id) DO NOTHING`,
      [SEASON.id, SEASON.name, SEASON.startDate, SEASON.endDate, SEASON.status]
    );

    // ── Clubs ────────────────────────────────────────────────────────────────
    console.log(`  → ${CLUBS.length} clubs…`);
    for (const c of CLUBS) {
      await qr.query(`
        INSERT INTO clubs (id,name,city,stadium,founded_year,logo_url,description,primary_color,secondary_color,status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO NOTHING`,
        [c.id,c.name,c.city,c.stadium,c.foundedYear,c.logoUrl,c.description,c.primaryColor,c.secondaryColor,c.status]
      );
    }

    // ── Players ──────────────────────────────────────────────────────────────
    console.log(`  → ${PLAYERS.length} players…`);
    for (const p of PLAYERS) {
      await qr.query(`
        INSERT INTO players (id,first_name,last_name,position,nationality,birth_date,jersey_number,is_active,market_value,club_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO NOTHING`,
        [p.id,p.firstName,p.lastName,p.position,p.nationality,p.birthDate,p.jerseyNumber,p.isActive,p.marketValue,p.clubId]
      );
    }

    // ── Matches ───────────────────────────────────────────────────────────────
    console.log(`  → ${MATCHES.length} matches…`);
    for (const m of MATCHES) {
      await qr.query(`
        INSERT INTO matches (id,round,scheduled_at,status,home_score,away_score,venue,city,home_club_id,away_club_id,season_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (id) DO NOTHING`,
        [m.id,m.round,m.scheduledAt,m.status,m.homeScore,m.awayScore,m.venue,m.city,m.homeClubId,m.awayClubId,m.seasonId]
      );
    }

    // ── Match events ─────────────────────────────────────────────────────────
    console.log(`  → ${MATCH_EVENTS.length} match events…`);
    // Batch insert in chunks of 500
    const evChunks = chunkArray(MATCH_EVENTS as any, 500);
    for (const chunk of evChunks) {
      const placeholders = chunk.map((_,i) => `($${i*7+1},$${i*7+2},$${i*7+3},$${i*7+4},$${i*7+5},$${i*7+6},$${i*7+7})`).join(',');
      const values = chunk.flatMap((e: any) => [e.id,e.type,e.minute,e.extraTime,e.matchId,e.playerId,e.clubId]);
      await qr.query(
        `INSERT INTO match_events (id,type,minute,extra_time,match_id,player_id,club_id) VALUES ${placeholders} ON CONFLICT (id) DO NOTHING`,
        values
      );
    }

    // ── Match stats ──────────────────────────────────────────────────────────
    console.log(`  → ${MATCH_STATS.length} match stats…`);
    const msChunks = chunkArray(MATCH_STATS as any, 300);
    for (const chunk of msChunks) {
      const placeholders = chunk.map((_,i) => {
        const b = i*13;
        return `($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6},$${b+7},$${b+8},$${b+9},$${b+10},$${b+11},$${b+12},$${b+13})`;
      }).join(',');
      const values = chunk.flatMap((s: any) => [
        s.id,s.goals,s.assists,s.yellowCards,s.redCards,
        s.minutesPlayed,s.wasSubstitute,s.shotsOnTarget,s.passesCompleted,
        s.matchId,s.playerId,s.clubId,s.seasonId,
      ]);
      await qr.query(
        `INSERT INTO match_stats (id,goals,assists,yellow_cards,red_cards,minutes_played,was_substitute,shots_on_target,passes_completed,match_id,player_id,club_id,season_id)
         VALUES ${placeholders} ON CONFLICT (id) DO NOTHING`,
        values
      );
    }

    // ── Standings ────────────────────────────────────────────────────────────
    console.log(`  → ${STANDINGS.length} standings…`);
    for (const [i,s] of STANDINGS.entries()) {
      await qr.query(`
        INSERT INTO standings
          (id,position,played,won,drawn,lost,goals_for,goals_against,goal_difference,points,
           form_guide,home_played,home_won,home_drawn,home_lost,
           away_played,away_won,away_drawn,away_lost,club_id,season_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
        ON CONFLICT (season_id,club_id) DO UPDATE SET
          position=$2,played=$3,won=$4,drawn=$5,lost=$6,
          goals_for=$7,goals_against=$8,goal_difference=$9,points=$10,
          form_guide=$11,
          home_played=$12,home_won=$13,home_drawn=$14,home_lost=$15,
          away_played=$16,away_won=$17,away_drawn=$18,away_lost=$19`,
        [
          s.id, i+1, s.played, s.won, s.drawn, s.lost,
          s.goalsFor, s.goalsAgainst, s.goalDifference, s.points,
          s.formGuide,
          s.homePlayed, s.homeWon, s.homeDrawn, s.homeLost,
          s.awayPlayed, s.awayWon, s.awayDrawn, s.awayLost,
          s.clubId, s.seasonId,
        ]
      );
    }

    // ── Users ────────────────────────────────────────────────────────────────
    console.log(`  → ${USERS.length} users…`);
    for (const u of USERS) {
      const hashed = await hash(u.rawPassword, 12);
      await qr.query(`
        INSERT INTO users
          (id,email,password,"firstName","lastName",phone,role,"isVerified","isActive",
           "cniNumber",agency,"mediaType",purpose,"pressCardNumber","editorApproved")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        ON CONFLICT (id) DO NOTHING`,
        [
          u.id, u.email, hashed, u.firstName, u.lastName, u.phone,
          u.role, u.isVerified, u.isActive,
          u.cniNumber ?? null, u.agency ?? null, u.mediaType ?? null,
          u.purpose ?? null, u.pressCardNumber ?? null, u.editorApproved,
        ]
      );
    }

    // Re-enable FK checks
    await qr.query('SET session_replication_role = DEFAULT;');
    await qr.commitTransaction();
    console.log('✅ PostgreSQL seeded successfully\n');

  } catch (err) {
    await qr.rollbackTransaction();
    console.error('❌ PostgreSQL seed failed:', err);
    throw err;
  } finally {
    await qr.release();
  }
}

async function seedMongo() {
  console.log('🍃 Seeding MongoDB…');
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const dbName = MONGO_URI.split('/').pop()?.split('?')[0] ?? 'mtn_elite_one';
  const db = client.db(dbName);

  try {
    // ── Hero banners ─────────────────────────────────────────────────────────
    const banners = db.collection('hero_banners');
    await banners.deleteMany({ type: { $in: ['hero','match','player','promo'] } });
    const { HERO_BANNERS } = await import('./seed.mongo.data.js');
    const bRes = await banners.insertMany(HERO_BANNERS);
    console.log(`  → ${bRes.insertedCount} hero banners`);

    // ── Articles ─────────────────────────────────────────────────────────────
    const articles = db.collection('articles');
    await articles.deleteMany({ slug: { $regex: /^seed-/ } });
    const { ARTICLES } = await import('./seed.mongo.data.js');
    const aRes = await articles.insertMany(ARTICLES);
    console.log(`  → ${aRes.insertedCount} articles`);

    // ── Indexes ───────────────────────────────────────────────────────────────
    await articles.createIndex({ slug: 1 }, { unique: true });
    await articles.createIndex({ status: 1, publishedAt: -1 });
    await articles.createIndex({ category: 1, status: 1 });
    await articles.createIndex({ featured: 1, status: 1 });
    await banners.createIndex({ priority: 1, active: 1 });

    console.log('✅ MongoDB seeded successfully\n');
  } finally {
    await client.close();
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 MTN Elite One — Seed Runner\n');
  console.log(`   PostgreSQL: ${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? 5432}/${process.env.DB_NAME ?? 'mtn_elite_one'}`);
  console.log(`   MongoDB:    ${MONGO_URI.replace(/:\/\/.*@/, '://***@')}\n`);

  try {
    await AppDataSource.initialize();
    await seedPostgres(AppDataSource);
    await seedMongo();

    console.log('═══════════════════════════════════════════════');
    console.log('✅ All seed data inserted successfully!');
    console.log('   Season  : MTN Elite One 2025-26');
    console.log(`   Clubs   : ${CLUBS.length}`);
    console.log(`   Players : ${PLAYERS.length}`);
    console.log(`   Matches : ${MATCHES.length} (${MATCHES.filter(m=>m.status==='FINISHED').length} finished)`);
    console.log(`   Events  : ${MATCH_EVENTS.length}`);
    console.log(`   Stats   : ${MATCH_STATS.length} rows`);
    console.log(`   Users   : ${USERS.length}`);
    console.log('═══════════════════════════════════════════════\n');

  } catch (err) {
    console.error('Fatal error during seeding:', err);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  }
}

main();