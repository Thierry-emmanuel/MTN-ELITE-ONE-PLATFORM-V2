import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Football Business — one module, seven collections (Mongo, strict schemas:
 * unknown keys are dropped at the door). Each becomes a full FootballOS
 * builder through the frontend factory; PARTNERS stay in the existing SQL
 * `sponsors` entity — these are the CONTRACTS and RELATIONSHIPS around them.
 */

@Schema({ collection: 'finance_records', timestamps: true, strict: true })
export class FinanceRecord {
  @Prop({ enum: ['INCOME', 'EXPENSE'], required: true }) kind: string;
  @Prop({ required: true }) category: string;           // subventions, billetterie, primes, officiels…
  @Prop({ required: true }) label: string;
  @Prop({ required: true }) amount: number;
  @Prop({ default: 'FCFA' }) currency: string;
  @Prop() date?: string;
  @Prop() counterparty?: string;
  @Prop() seasonId?: number;
  @Prop() clubId?: number;
  @Prop({ enum: ['DRAFT', 'APPROVED', 'PAID'], default: 'DRAFT' }) status: string;
  @Prop() reference?: string;
  @Prop() notes?: string;
}
export const FinanceRecordSchema = SchemaFactory.createForClass(FinanceRecord);

@Schema({ collection: 'sponsorship_deals', timestamps: true, strict: true })
export class SponsorshipDeal {
  @Prop({ required: true }) sponsorName: string;        // relates to SQL sponsors registry
  @Prop() sponsorId?: number;
  @Prop({ enum: ['TITLE', 'OFFICIAL', 'TECHNICAL', 'MEDIA', 'SUPPLIER'], default: 'OFFICIAL' }) tier: string;
  @Prop({ required: true }) amount: number;
  @Prop({ default: 'FCFA' }) currency: string;
  @Prop() startDate?: string;
  @Prop() endDate?: string;
  @Prop([String]) assets: string[];                     // maillot, LED, naming, digital…
  @Prop({ enum: ['NEGOTIATION', 'SIGNED', 'ACTIVE', 'EXPIRED'], default: 'NEGOTIATION' }) status: string;
  @Prop() notes?: string;
}
export const SponsorshipDealSchema = SchemaFactory.createForClass(SponsorshipDeal);

@Schema({ collection: 'broadcast_deals', timestamps: true, strict: true })
export class BroadcastDeal {
  @Prop({ required: true }) broadcaster: string;
  @Prop({ enum: ['TV', 'RADIO', 'STREAMING', 'HIGHLIGHTS'], default: 'TV' }) medium: string;
  @Prop({ enum: ['EXCLUSIVE', 'NON_EXCLUSIVE'], default: 'NON_EXCLUSIVE' }) exclusivity: string;
  @Prop() territory?: string;
  @Prop() amount?: number;
  @Prop({ default: 'FCFA' }) currency: string;
  @Prop() seasonId?: number;
  @Prop() matchesPerRound?: number;
  @Prop({ enum: ['NEGOTIATION', 'SIGNED', 'ACTIVE', 'EXPIRED'], default: 'NEGOTIATION' }) status: string;
  @Prop() notes?: string;
}
export const BroadcastDealSchema = SchemaFactory.createForClass(BroadcastDeal);

@Schema({ collection: 'league_documents', timestamps: true, strict: true })
export class LeagueDocument {
  @Prop({ required: true }) title: string;
  @Prop({ enum: ['CONTRACT', 'REGULATION', 'LICENSE', 'MINUTES', 'CIRCULAR', 'OTHER'], default: 'OTHER' }) type: string;
  @Prop({ required: true }) fileUrl: string;
  @Prop() relatedEntity?: string;                       // ex. « clubs/4 », « seasons/2 »
  @Prop() expiryDate?: string;
  @Prop({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' }) status: string;
  @Prop([String]) tags: string[];
}
export const LeagueDocumentSchema = SchemaFactory.createForClass(LeagueDocument);

@Schema({ collection: 'licenses', timestamps: true, strict: true })
export class License {
  @Prop({ required: true }) subjectType: string;        // CLUB / PLAYER / STAFF / MEDIA
  @Prop({ required: true }) subjectId: number;
  @Prop() subjectName?: string;
  @Prop() seasonId?: number;
  @Prop({ enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REVOKED'], default: 'PENDING' }) status: string;
  @Prop() validUntil?: string;
  @Prop([String]) documents: string[];
  @Prop() reviewer?: string;
  @Prop() notes?: string;
}
export const LicenseSchema = SchemaFactory.createForClass(License);

@Schema({ collection: 'crm_contacts', timestamps: true, strict: true })
export class CrmContact {
  @Prop({ required: true }) name: string;
  @Prop() organization?: string;
  @Prop() role?: string;
  @Prop({ enum: ['PARTNER', 'MEDIA', 'OFFICIAL', 'SUPPLIER', 'INSTITUTION', 'OTHER'], default: 'OTHER' }) type: string;
  @Prop() email?: string;
  @Prop() phone?: string;
  @Prop([String]) tags: string[];
  @Prop() notes?: string;
}
export const CrmContactSchema = SchemaFactory.createForClass(CrmContact);

@Schema({ collection: 'commercial_items', timestamps: true, strict: true })
export class CommercialItem {
  @Prop({ required: true }) name: string;
  @Prop({ enum: ['TICKETING', 'HOSPITALITY', 'MERCHANDISING', 'DIGITAL', 'EVENT'], default: 'TICKETING' }) kind: string;
  @Prop() price?: number;
  @Prop({ default: 'FCFA' }) currency: string;
  @Prop() description?: string;
  @Prop({ enum: ['DRAFT', 'ON_SALE', 'SOLD_OUT', 'ARCHIVED'], default: 'DRAFT' }) status: string;
  @Prop() seasonId?: number;
  @Prop() clubId?: number;
}
export const CommercialItemSchema = SchemaFactory.createForClass(CommercialItem);

@Schema({ collection: 'payments', timestamps: true, strict: true })
export class Payment {
  @Prop({ required: true }) reference: string;
  @Prop({ required: true }) amount: number;
  @Prop({ default: 'FCFA' }) currency: string;
  @Prop({ enum: ['MTN_MOMO', 'ORANGE_MONEY', 'CARD', 'BANK', 'CASH'], default: 'MTN_MOMO' }) provider: string;
  @Prop({ enum: ['INITIATED', 'PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED'], default: 'INITIATED' }) status: string;
  @Prop() relatedCollection?: string;                   // finance_records / commercial_items / licenses
  @Prop() relatedId?: string;
  @Prop() payer?: string;
  @Prop() providerRef?: string;
}
export const PaymentSchema = SchemaFactory.createForClass(Payment);
