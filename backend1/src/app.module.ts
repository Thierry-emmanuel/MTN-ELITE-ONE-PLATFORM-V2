import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule }   from '@nestjs/typeorm';
import { MongooseModule }  from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule }     from '@nestjs/cache-manager';
import { redisStore }      from 'cache-manager-redis-yet';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';


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
import { CoachesModule }        from './coaches/coaches.module';
import { UploadsModule }        from './uploads/uploads.module';
// ── New domains added by this refactor ──────────────────────────────────────
import { TransfersModule }   from './transfers/transfers.module';
import { InjuriesModule }    from './injuries/injuries.module';
import { SelectionsModule }  from './selections/selections.module';
import { BigMomentsModule }  from './big-moments/big-moments.module';
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
        host:     cfg.get<string>('DB_HOST'),
        port:     cfg.get<number>('DB_PORT'),
        username: cfg.get<string>('DB_USERNAME'),
        password: cfg.get<string>('DB_PASSWORD'),
        database: cfg.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: cfg.get<string>('DB_SYNCHRONIZE') === 'true',
        logging:     cfg.get<string>('NODE_ENV') === 'development',
        extra: { max: 20, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 2_000 },
      }),
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({ uri: cfg.get<string>('MONGODB_URI') }),
    }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: cfg.get<string>('REDIS_HOST', 'localhost'),
            port: cfg.get<number>('REDIS_PORT', 6379),
          },
          ttl: cfg.get<number>('REDIS_TTL', 300) * 1_000,
        }),
      }),
    }),

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
    CoachesModule,
    UploadsModule,
    TransfersModule,
    InjuriesModule,
    SelectionsModule,
    BigMomentsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}