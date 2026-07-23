import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule }   from '@nestjs/typeorm';
import { MongooseModule }  from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule }     from '@nestjs/cache-manager';
import { redisStore }      from 'cache-manager-redis-yet';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';


import { IamModule }         from './iam/iam.module';
import { EquipmentsModule }  from './equipments/equipments.module';
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
import { MediaModule }       from './media/media.module';
import { BusinessModule }    from './business/business.module';
import { HeroBannersModule } from './hero-banners/hero-banners.module';
import { AdminModule }       from './admin/admin.module';
import { WebsocketModule }   from './websocket/websocket.module';
import { TalentsModule }     from './talents/talents.module';
import { HallOfFameModule }  from './hall-of-fame/hall-of-fame.module';
import { CultureStoriesModule } from './culture-stories/culture-stories.module';
import { HomepageLayoutModule } from './homepage-layout/homepage-layout.module';
import { CoachesModule }        from './coaches/coaches.module';
import { UploadsModule }        from './uploads/uploads.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { ContactsModule }       from './contacts/contacts.module';
// ── New domains added by this refactor ──────────────────────────────────────
import { TransfersModule }   from './transfers/transfers.module';
import { InjuriesModule }    from './injuries/injuries.module';
import { SelectionsModule }  from './selections/selections.module';
import { BigMomentsModule }  from './big-moments/big-moments.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { StadiumsModule } from './stadiums/stadiums.module';
import { RefereesModule } from './referees/referees.module';
import { StaffModule } from './staff/staff.module';
import { WorkflowModule } from './workflow/workflow.module';
import { ExportsModule } from './exports/exports.module';
import { APP_GUARD }         from '@nestjs/core';
import { ThrottlerGuard }    from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type:     'postgres',
        url:      cfg.get<string>('DATABASE_URL'),
        host:     cfg.get<string>('DB_HOST'),
        port:     cfg.get<number>('DB_PORT'),
        username: cfg.get<string>('DB_USERNAME'),
        password: cfg.get<string>('DB_PASSWORD'),
        database: cfg.get<string>('DB_NAME'),
        ssl:      cfg.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: cfg.get<string>('DB_SYNCHRONIZE') === 'true',
        logging:     cfg.get<string>('NODE_ENV') === 'development',
        extra: { max: 20, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 10_000 },
      }),
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const uri = cfg.get<string>('MONGODB_URI') || 'mongodb://127.0.0.1:27017/mtn_elite_one_editorial';
        return { uri };
      },
    }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => {
        const host = cfg.get<string>('REDIS_HOST', 'localhost');
        const port = cfg.get<number>('REDIS_PORT', 6379);
        const ttl  = cfg.get<number>('REDIS_TTL', 300) * 1_000;

        try {
          // Probe the Redis connection before committing to the store
          const store = await redisStore({
            socket: { host, port, connectTimeout: 3_000 },
            ttl,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
          console.log(`[Cache] Redis connected at ${host}:${port}`);
          return { store };
        } catch (err) {
          console.warn(
            `[Cache] Redis unavailable at ${host}:${port} — falling back to in-memory cache.`,
            (err as Error).message,
          );
          // Return empty config = @nestjs/cache-manager default (memory store)
          return {};
        }
      },
    }),

    IamModule,
    EquipmentsModule,
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
    MediaModule,
    BusinessModule,
    HeroBannersModule,
    AdminModule,
    WebsocketModule,
    TalentsModule,
    HallOfFameModule,
    CultureStoriesModule,
    HomepageLayoutModule,
    CoachesModule,
    UploadsModule,
    SystemSettingsModule,
    ContactsModule,
    TransfersModule,
    InjuriesModule,
    SelectionsModule,
    BigMomentsModule,
    CompetitionsModule,
    SponsorsModule,
    StadiumsModule,
    RefereesModule,
    StaffModule,
    WorkflowModule,
    ExportsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}