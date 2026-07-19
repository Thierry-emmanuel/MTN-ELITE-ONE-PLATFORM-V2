import { BadRequestException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './business.schemas';

/**
 * Payment-READY architecture — the seam, not a fake integration.
 * `PaymentProvider` is the contract a real MTN MoMo / Orange Money / card
 * gateway implements; until one is plugged, initiation records the intent
 * (INITIATED) and returns 501 for provider execution instead of pretending.
 * Confirmation is a webhook-shaped endpoint updating the authoritative record.
 */
export interface PaymentProvider {
  readonly id: string;
  initiate(payment: Payment): Promise<{ providerRef: string; redirectUrl?: string }>;
}

@Injectable()
export class PaymentsService {
  private readonly providers = new Map<string, PaymentProvider>();

  constructor(@InjectModel(Payment.name) private readonly payments: Model<Payment>) {}

  register(provider: PaymentProvider) { this.providers.set(provider.id, provider); }

  list() { return this.payments.find().sort({ createdAt: -1 }).limit(200).lean(); }

  async initiate(dto: { reference: string; amount: number; provider?: string; currency?: string; relatedCollection?: string; relatedId?: string; payer?: string }) {
    if (!dto.reference || !(Number(dto.amount) > 0))
      throw new BadRequestException('reference and a positive amount are required');
    const record = await this.payments.create({ ...dto, status: 'INITIATED' });
    const provider = this.providers.get(record.provider);
    if (!provider)
      throw new NotImplementedException(
        `Payment provider "${record.provider}" is not connected yet — the intent is recorded (${record._id}); plug a PaymentProvider to execute it.`,
      );
    const { providerRef, redirectUrl } = await provider.initiate(record);
    await this.payments.findByIdAndUpdate(record._id, { providerRef, status: 'PENDING' });
    return { id: record._id, providerRef, redirectUrl };
  }

  async confirm(id: string, outcome: 'CONFIRMED' | 'FAILED', providerRef?: string) {
    const doc = await this.payments.findByIdAndUpdate(
      id, { status: outcome, ...(providerRef ? { providerRef } : {}) }, { new: true },
    ).lean();
    if (!doc) throw new NotFoundException(`Payment "${id}" not found`);
    return doc;
  }
}
