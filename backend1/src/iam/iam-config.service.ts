import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IamConfig } from './entities/iam-config.entity';

/** Allowed namespaces — keeps the store from becoming a junk drawer. */
const ALLOWED_PREFIXES = ['os.menu', 'os.workspace.', 'os.landing.', 'flags.'];

@Injectable()
export class IamConfigService {
  constructor(@InjectRepository(IamConfig) private readonly repo: Repository<IamConfig>) {}

  private assertKey(key: string) {
    if (!ALLOWED_PREFIXES.some((p) => key === p || key.startsWith(p)))
      throw new BadRequestException(`Clé de configuration non autorisée: "${key}"`);
  }

  async get(key: string): Promise<Record<string, unknown>> {
    this.assertKey(key);
    const row = await this.repo.findOne({ where: { key } });
    return row?.value ?? {};
  }

  async set(key: string, value: Record<string, unknown>, updatedBy?: number) {
    this.assertKey(key);
    await this.repo.save(this.repo.create({ key, value, updatedBy: updatedBy ?? null }));
    return { key, value };
  }
}
