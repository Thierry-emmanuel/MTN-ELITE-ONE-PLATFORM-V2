import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { BigMomentsService } from './big-moments.module';
import { BigMoment } from './schemas/big-moment.schema';
import { CreateBigMomentDto, UpdateBigMomentDto } from './dto/big-moment.dto';

/** Helper to build a chainable Mongoose query mock */
const execMock = (resolvedValue: any) => ({
  exec: jest.fn().mockResolvedValue(resolvedValue),
});

const sortExecMock = (resolvedValue: any) => ({
  sort: jest.fn().mockReturnValue(execMock(resolvedValue)),
});

describe('BigMomentsService', () => {
  let service: BigMomentsService;

  const mockModel = {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BigMomentsService,
        {
          provide: getModelToken(BigMoment.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<BigMomentsService>(BigMomentsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all big moments when featuredOnly is false/undefined', async () => {
      const moments = [{ _id: '1', title: 'Goal!' }];
      mockModel.find.mockReturnValue(sortExecMock(moments));

      const result = await service.findAll();

      expect(mockModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual(moments);
    });

    it('should return only featured big moments when featuredOnly is true', async () => {
      const moments = [{ _id: '2', title: 'Trophy', featured: true }];
      mockModel.find.mockReturnValue(sortExecMock(moments));

      const result = await service.findAll(true);

      expect(mockModel.find).toHaveBeenCalledWith({ featured: true });
      expect(result).toEqual(moments);
    });

    it('should sort results by momentDate descending', async () => {
      const sortSpy = jest.fn().mockReturnValue(execMock([]));
      mockModel.find.mockReturnValue({ sort: sortSpy });

      await service.findAll();

      expect(sortSpy).toHaveBeenCalledWith({ momentDate: -1 });
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return a big moment if found', async () => {
      const moment = { _id: 'abc123', title: 'Record breaker' };
      mockModel.findById.mockReturnValue(execMock(moment));

      const result = await service.findOne('abc123');

      expect(mockModel.findById).toHaveBeenCalledWith('abc123');
      expect(result).toEqual(moment);
    });

    it('should throw NotFoundException when not found', async () => {
      mockModel.findById.mockReturnValue(execMock(null));

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow('Grand moment introuvable');
    });
  });

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create and return a new big moment', async () => {
      const dto: CreateBigMomentDto = {
        title: 'First Goal Ever',
        description: '<p>Historic goal</p>',
        momentDate: '2026-03-15',
        category: 'GOAL',
        mediaUrl: 'https://cdn.example.com/goal.jpg',
        featured: true,
      };
      const created = { _id: 'new123', ...dto };
      mockModel.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update and return the modified big moment', async () => {
      const dto: UpdateBigMomentDto = { title: 'Updated Title', featured: false };
      const updated = { _id: 'abc123', title: 'Updated Title', featured: false };
      mockModel.findByIdAndUpdate.mockReturnValue(execMock(updated));

      const result = await service.update('abc123', dto);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith('abc123', dto, { new: true });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when the moment to update does not exist', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue(execMock(null));

      await expect(service.update('ghost-id', {})).rejects.toThrow(NotFoundException);
      await expect(service.update('ghost-id', {})).rejects.toThrow('Grand moment introuvable');
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should remove an existing big moment', async () => {
      const existing = { _id: 'abc123', title: 'To Delete' };
      // findById called by the internal findOne guard
      mockModel.findById.mockReturnValue(execMock(existing));
      mockModel.findByIdAndDelete.mockReturnValue(execMock(existing));

      await service.remove('abc123');

      expect(mockModel.findById).toHaveBeenCalledWith('abc123');
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('abc123');
    });

    it('should throw NotFoundException before deleting when moment does not exist', async () => {
      mockModel.findById.mockReturnValue(execMock(null));

      await expect(service.remove('ghost-id')).rejects.toThrow(NotFoundException);
      expect(mockModel.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });
});
