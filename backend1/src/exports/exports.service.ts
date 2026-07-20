import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from '../articles/schemas/article.schema';
import { AuditLog } from '../iam/entities/audit-log.entity';

@Injectable()
export class ExportsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectModel(Article.name) private readonly articleModel: Model<any>,
  ) {}

  async exportData(entity: string, format: string): Promise<string> {
    let data: any[] = [];

    if (entity === 'articles') {
      data = await this.articleModel.find().lean();
    } else if (['players', 'clubs', 'matches', 'standings', 'transfers', 'staff'].includes(entity)) {
      const repoMap: Record<string, string> = {
        players: 'Player',
        clubs: 'Club',
        matches: 'Match',
        standings: 'Standing',
        transfers: 'Transfer',
        staff: 'Staff',
      };
      const entityName = repoMap[entity];
      const repo = this.dataSource.getRepository(entityName);
      data = await repo.find();
    } else if (entity === 'audit') {
      const repo = this.dataSource.getRepository(AuditLog);
      data = await repo.find({ order: { createdAt: 'DESC' } as any, take: 1000 });
    } else {
      throw new BadRequestException(`Entity "${entity}" is not exportable.`);
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const csvRows: string[] = [];
      csvRows.push(headers.join(','));
      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
          return `"${valStr.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
      }
      return csvRows.join('\n');
    } else {
      throw new BadRequestException(`Unsupported format: ${format}`);
    }
  }
}
