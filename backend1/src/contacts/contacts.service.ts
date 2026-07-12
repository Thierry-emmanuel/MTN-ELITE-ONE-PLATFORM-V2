import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactMessage, ContactMessageDocument } from './schemas/contact.schema';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(ContactMessage.name)
    private readonly contactModel: Model<ContactMessageDocument>,
  ) {}

  async create(createDto: { name: string; email: string; subject: string; message: string }): Promise<ContactMessage> {
    const newMessage = new this.contactModel(createDto);
    return newMessage.save();
  }

  async findAll(): Promise<ContactMessage[]> {
    return this.contactModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateStatus(id: string, status: string): Promise<ContactMessage> {
    return this.contactModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.contactModel.findByIdAndDelete(id).exec();
  }
}
