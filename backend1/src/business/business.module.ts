import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BroadcastDeal, BroadcastDealSchema, CommercialItem, CommercialItemSchema,
  CrmContact, CrmContactSchema, FinanceRecord, FinanceRecordSchema,
  LeagueDocument, LeagueDocumentSchema, License, LicenseSchema,
  Payment, PaymentSchema, SponsorshipDeal, SponsorshipDealSchema,
} from './business.schemas';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { PaymentsService } from './payments.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: FinanceRecord.name, schema: FinanceRecordSchema },
    { name: SponsorshipDeal.name, schema: SponsorshipDealSchema },
    { name: BroadcastDeal.name, schema: BroadcastDealSchema },
    { name: LeagueDocument.name, schema: LeagueDocumentSchema },
    { name: License.name, schema: LicenseSchema },
    { name: CrmContact.name, schema: CrmContactSchema },
    { name: CommercialItem.name, schema: CommercialItemSchema },
    { name: Payment.name, schema: PaymentSchema },
  ])],
  controllers: [BusinessController],
  providers: [BusinessService, PaymentsService],
})
export class BusinessModule {}
