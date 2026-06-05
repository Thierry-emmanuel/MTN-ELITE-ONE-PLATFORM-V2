import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ArticleDocument } from '../articles/schemas/article.schema';

@Injectable()
export class AdminService {
  constructor(
    private dataSource: DataSource,
    @InjectModel('Article') private articleModel: Model<ArticleDocument>,
  ) {}

  async getDashboardStats() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const [
        totalUsers,
        totalClubs,
        totalPlayers,
        totalMatches,
        totalVotes,
      ] = await Promise.all([
        queryRunner.manager.query(`SELECT COUNT(*) FROM users`),
        queryRunner.manager.query(`SELECT COUNT(*) FROM clubs`),
        queryRunner.manager.query(`SELECT COUNT(*) FROM players`),
        queryRunner.manager.query(`SELECT COUNT(*) FROM matches`),
        queryRunner.manager.query(`SELECT COUNT(*) FROM votes`),
      ]);

      const totalArticles = await this.articleModel.countDocuments().exec();

      return {
        users: parseInt(totalUsers[0].count, 10),
        clubs: parseInt(totalClubs[0].count, 10),
        players: parseInt(totalPlayers[0].count, 10),
        matches: parseInt(totalMatches[0].count, 10),
        votes: parseInt(totalVotes[0].count, 10),
        articles: totalArticles,
      };
    } finally {
      await queryRunner.release();
    }
  }
}
