import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

// Les 12 modules du CDC (section 9.3)
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClubsModule } from './clubs/clubs.module';
import { PlayersModule } from './players/players.module';
import { MatchesModule } from './matches/matches.module';
import { StandingsModule } from './standings/standings.module';
import { StatsModule } from './stats/stats.module';
import { AwardsModule } from './awards/awards.module';
import { ArticlesModule } from './articles/articles.module';
import { HeroBannersModule } from './hero-banners/hero-banners.module';
import { AdminModule } from './admin/admin.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({ isGlobal: true }),

    // PostgreSQL - données structurées (section 9.4 CDC)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: config.get('DB_SYNCHRONIZE') === 'true',
      }),
    }),

    // MongoDB - contenu éditorial (section 9.4 CDC)
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGODB_URI'),
      }),
    }),

    // Rate limiting (100 req/min routes publiques - section 6.2 CDC)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Redis Cache (section 10.9 CDC)
    CacheModule.register({ isGlobal: true, ttl: 300 }),

    // Les 12 modules métier
    AuthModule,
    UsersModule,
    ClubsModule,
    PlayersModule,
    MatchesModule,
    StandingsModule,
    StatsModule,
    AwardsModule,
    ArticlesModule,
    HeroBannersModule,
    AdminModule,
    WebsocketModule,
  ],
})
export class AppModule {}