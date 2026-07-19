import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BroadcastDeal, CommercialItem, CrmContact, FinanceRecord,
  LeagueDocument, License, SponsorshipDeal,
} from './business.schemas';

/**
 * Generic CRUD over the business collections. Mongoose `strict` schemas are
 * the write guard (unknown keys dropped, enums enforced); one service, one
 * controller, seven studios — no per-collection boilerplate.
 */
@Injectable()
export class BusinessService {
  private readonly models: Record<string, Model<any>>;

  constructor(
    @InjectModel(FinanceRecord.name)   finance: Model<FinanceRecord>,
    @InjectModel(SponsorshipDeal.name) sponsorship: Model<SponsorshipDeal>,
    @InjectModel(BroadcastDeal.name)   broadcast: Model<BroadcastDeal>,
    @InjectModel(LeagueDocument.name)  documents: Model<LeagueDocument>,
    @InjectModel(License.name)         licenses: Model<License>,
    @InjectModel(CrmContact.name)      contacts: Model<CrmContact>,
    @InjectModel(CommercialItem.name)  commercial: Model<CommercialItem>,
  ) {
    this.models = { finance, sponsorship, broadcast, documents, licenses, contacts, commercial };
  }

  private model(collection: string): Model<any> {
    const m = this.models[collection];
    if (!m) throw new BadRequestException(`Unknown business collection "${collection}"`);
    return m;
  }

  findAll(collection: string, filters: Record<string, unknown> = {}) {
    const q: Record<string, unknown> = {};
    for (const k of ['status', 'kind', 'type', 'tier', 'seasonId', 'clubId']) {
      if (filters[k] !== undefined && filters[k] !== '') q[k] = filters[k];
    }
    return this.model(collection).find(q).sort({ createdAt: -1 }).limit(500).lean();
  }

  async findOne(collection: string, id: string) {
    const doc = await this.model(collection).findById(id).lean();
    if (!doc) throw new NotFoundException(`${collection} "${id}" not found`);
    return doc;
  }

  create(collection: string, payload: Record<string, unknown>) {
    return this.model(collection).create(payload);
  }

  async update(collection: string, id: string, payload: Record<string, unknown>) {
    const doc = await this.model(collection)
      .findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
    if (!doc) throw new NotFoundException(`${collection} "${id}" not found`);
    return doc;
  }

  async remove(collection: string, id: string) {
    const res = await this.model(collection).findByIdAndDelete(id);
    if (!res) throw new NotFoundException(`${collection} "${id}" not found`);
    return { message: 'Deleted' };
  }
}
