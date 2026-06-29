import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule }   from '@nestjs/typeorm';
import { MongooseModule }  from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule }     from '@nestjs/cache-manager';
import { redisStore }      from 'cache-manager-redis-yet';

// Modules
import { AuthModule }        from './auth/auth.module';
import { UsersModule }       from './users/users.module';
import { ClubsModule }       from './clubs/clubs.module';
import { PlayersModule }     from './players/players.module';
import { MatchesModule }     from './matches/matches.module';
import { SeasonsModule }     from './seasons/seasons.module';
import { StandingsModule }   from './standings/standings.module';
import { StatsModule }       from './stats/stats.module';
import { AwardsModule }      from './awards/awards.module';
import { ArticlesModule }    from './articles/articles.module';
import { HeroBannersModule } from './hero-banners/hero-banners.module';
import { AdminModule }       from './admin/admin.module';
import { WebsocketModule }   from './websocket/websocket.module';
import { TalentsModule }     from './talents/talents.module';
import { HallOfFameModule }  from './hall-of-fame/hall-of-fame.module';
import { CultureStoriesModule } from './culture-stories/culture-stories.module';
import { HomepageLayoutModule } from './homepage-layout/homepage-layout.module';
import { APP_GUARD }         from '@nestjs/core';
import { ThrottlerGuard }    from '@nestjs/throttler';

@Module({
  imports: [
    // ── Global config (.env) ────────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),
    
    // ── PostgreSQL (TypeORM) ─────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type:     'postgres',
        host:     cfg.get<string>('DB_HOST'),
        port:     cfg.get<number>('DB_PORT'),
        username: cfg.get<string>('DB_USERNAME'),
        password: cfg.get<string>('DB_PASSWORD'),
        database: cfg.get<string>('DB_NAME'),
        autoLoadEntities: true,
        // IMPORTANT: set DB_SYNCHRONIZE=false in production.
        // Use migrations instead (see src/migrations/).
        synchronize: cfg.get<string>('DB_SYNCHRONIZE') === 'true',
        logging:     cfg.get<string>('NODE_ENV') === 'development',
        // Connection pool — prevents exhaustion under load
        extra: {
          max: 20,
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 2_000,
        },
      }),
    }),

    // ── MongoDB (Mongoose) — editorial content ───────────────────────────────
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGODB_URI'),
      }),
    }),

    // ── Rate limiting ────────────────────────────────────────────────────────
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // ── Redis cache (BEFORE: used in-memory, Redis env vars were ignored) ────
    // AFTER: wired to Redis using cache-manager-redis-yet adapter.
    // Install: npm install cache-manager-redis-yet
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: cfg.get<string>('REDIS_HOST', 'localhost'),
            port: cfg.get<number>('REDIS_PORT', 6379),
          },
          ttl: cfg.get<number>('REDIS_TTL', 300) * 1_000, // redis-yet uses ms
        }),
      }),
    }),

    // ── Business modules ────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    ClubsModule,
    PlayersModule,
    MatchesModule,
    SeasonsModule,
    StandingsModule,
    StatsModule,
    AwardsModule,
    ArticlesModule,
    HeroBannersModule,
    AdminModule,
    WebsocketModule,
    TalentsModule,
    HallOfFameModule,
    CultureStoriesModule,
    HomepageLayoutModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

/*
 * ── main.ts reminder ──────────────────────────────────────────────────────────
 * Make sure your main.ts has:
 *
 *   app.useGlobalPipes(new ValidationPipe({
 *     whitelist:        true,   // strips unknown fields
 *     forbidNonWhitelisted: true,
 *     transform:        true,   // enables @Type() for query params
 *     transformOptions: { enableImplicitConversion: true },
 *   }));
 *
 * Without `transform: true`, PaginationDto.page comes in as a string
 * and .skip returns NaN.
 * ─────────────────────────────────────────────────────────────────────────────
 */