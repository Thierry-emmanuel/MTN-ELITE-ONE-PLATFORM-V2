import { Test, TestingModule } from '@nestjs/testing';
import { TransfersService } from './transfers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transfer } from './transfer.entity';
import { Player } from '../players/player.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateTransferDto, UpdateTransferDto } from './dto/transfer.dto';

describe('TransfersService', () => {
  let service: TransfersService;
  let transferRepo: Repository<Transfer>;
  let playerRepo: Repository<Player>;

  const mockTransferRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPlayerRepo = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        {
          provide: getRepositoryToken(Transfer),
          useValue: mockTransferRepo,
        },
        {
          provide: getRepositoryToken(Player),
          useValue: mockPlayerRepo,
        },
      ],
    }).compile();

    service = module.get<TransfersService>(TransfersService);
    transferRepo = module.get<Repository<Transfer>>(getRepositoryToken(Transfer));
    playerRepo = module.get<Repository<Player>>(getRepositoryToken(Player));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all transfers', async () => {
      const mockTransfers = [{ id: 1 }, { id: 2 }];
      mockTransferRepo.find.mockResolvedValue(mockTransfers);

      const result = await service.findAll();
      expect(result).toEqual(mockTransfers);
      expect(mockTransferRepo.find).toHaveBeenCalledWith({
        where: {},
        order: { transferDate: 'DESC' },
      });
    });

    it('should return transfers for a specific player', async () => {
      const mockTransfers = [{ id: 1, playerId: 5 }];
      mockTransferRepo.find.mockResolvedValue(mockTransfers);

      const result = await service.findAll(5);
      expect(result).toEqual(mockTransfers);
      expect(mockTransferRepo.find).toHaveBeenCalledWith({
        where: { playerId: 5 },
        order: { transferDate: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a transfer if found', async () => {
      const mockTransfer = { id: 1 };
      mockTransferRepo.findOne.mockResolvedValue(mockTransfer);

      const result = await service.findOne(1);
      expect(result).toEqual(mockTransfer);
      expect(mockTransferRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if transfer not found', async () => {
      mockTransferRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a transfer and update player club if type is PERMANENT', async () => {
      const dto: CreateTransferDto = {
        playerId: 10,
        toClubId: 20,
        type: 'PERMANENT',
        windowLabel: 'Summer 2026',
        transferDate: '2026-07-01',
        amount: 2500000,
      };
      const savedTransfer = { id: 1, ...dto };

      mockTransferRepo.create.mockReturnValue(savedTransfer);
      mockTransferRepo.save.mockResolvedValue(savedTransfer);

      const result = await service.create(dto);

      expect(mockTransferRepo.create).toHaveBeenCalledWith(dto);
      expect(mockTransferRepo.save).toHaveBeenCalledWith(savedTransfer);
      expect(mockPlayerRepo.update).toHaveBeenCalledWith(10, { clubId: 20 });
      expect(result).toEqual(savedTransfer);
    });

    it('should create a transfer and update player club if type is FREE', async () => {
      const dto: CreateTransferDto = {
        playerId: 10,
        toClubId: 20,
        type: 'FREE',
        windowLabel: 'Summer 2026',
        transferDate: '2026-07-01',
      };
      const savedTransfer = { id: 1, ...dto };

      mockTransferRepo.create.mockReturnValue(savedTransfer);
      mockTransferRepo.save.mockResolvedValue(savedTransfer);

      const result = await service.create(dto);

      expect(mockPlayerRepo.update).toHaveBeenCalledWith(10, { clubId: 20 });
      expect(result).toEqual(savedTransfer);
    });

    it('should create a transfer without updating player club if type is LOAN', async () => {
      const dto: CreateTransferDto = {
        playerId: 10,
        toClubId: 20,
        type: 'LOAN',
        windowLabel: 'Summer 2026',
        transferDate: '2026-07-01',
      };
      const savedTransfer = { id: 1, ...dto };

      mockTransferRepo.create.mockReturnValue(savedTransfer);
      mockTransferRepo.save.mockResolvedValue(savedTransfer);

      const result = await service.create(dto);

      expect(mockPlayerRepo.update).not.toHaveBeenCalled();
      expect(result).toEqual(savedTransfer);
    });
  });

  describe('update', () => {
    it('should update and return the transfer', async () => {
      const dto: UpdateTransferDto = { amount: 200000 };
      const existingTransfer = { id: 1, amount: 100000 };
      const updatedTransfer = { ...existingTransfer, ...dto };

      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(existingTransfer as Transfer)
        .mockResolvedValueOnce(updatedTransfer as Transfer);

      const result = await service.update(1, dto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockTransferRepo.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updatedTransfer);
    });
  });

  describe('remove', () => {
    it('should remove the transfer if it exists', async () => {
      const existingTransfer = { id: 1 };
      jest.spyOn(service, 'findOne').mockResolvedValue(existingTransfer as Transfer);

      await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockTransferRepo.remove).toHaveBeenCalledWith(existingTransfer);
    });
  });
});
