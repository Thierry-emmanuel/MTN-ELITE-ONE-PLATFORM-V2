import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjuriesService } from './injuries.service';
import { Injury } from './injury.entity';
import { CreateInjuryDto, UpdateInjuryDto } from './dto/injury.dto';

describe('InjuriesService', () => {
  let service: InjuriesService;
  let repo: Repository<Injury>;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InjuriesService,
        { provide: getRepositoryToken(Injury), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<InjuriesService>(InjuriesService);
    repo = module.get<Repository<Injury>>(getRepositoryToken(Injury));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all injuries when no status filter is provided', async () => {
      const injuries = [{ id: 1 }, { id: 2 }];
      mockRepo.find.mockResolvedValue(injuries);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: {},
        relations: ['player', 'player.club'],
        order: { injuredAt: 'DESC' },
      });
      expect(result).toEqual(injuries);
    });

    it('should filter by status when a status is provided', async () => {
      const injuries = [{ id: 1, status: 'ACTIVE' }];
      mockRepo.find.mockResolvedValue(injuries);

      const result = await service.findAll('ACTIVE');

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        relations: ['player', 'player.club'],
        order: { injuredAt: 'DESC' },
      });
      expect(result).toEqual(injuries);
    });

    it('should filter by RECOVERING status', async () => {
      mockRepo.find.mockResolvedValue([]);

      await service.findAll('RECOVERING');

      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'RECOVERING' } }),
      );
    });

    it('should always eager-load player and player.club relations', async () => {
      mockRepo.find.mockResolvedValue([]);

      await service.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ relations: ['player', 'player.club'] }),
      );
    });

    it('should order results by injuredAt DESC', async () => {
      mockRepo.find.mockResolvedValue([]);

      await service.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ order: { injuredAt: 'DESC' } }),
      );
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return an injury if found', async () => {
      const injury = { id: 1, type: 'Hamstring' };
      mockRepo.findOne.mockResolvedValue(injury);

      const result = await service.findOne(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(injury);
    });

    it('should throw NotFoundException when injury is not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow('Blessure introuvable');
    });
  });

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create and save a new injury record', async () => {
      const dto: CreateInjuryDto = {
        playerId: 5,
        type: 'Knee ligament',
        severity: 'SEVERE',
        injuredAt: '2026-03-01',
        expectedReturn: '2026-06-01',
        notes: 'Requires surgery',
      };
      const created = { id: 1, ...dto };

      mockRepo.create.mockReturnValue(created);
      mockRepo.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('should create an injury without optional fields', async () => {
      const dto: CreateInjuryDto = {
        playerId: 3,
        type: 'Ankle sprain',
        severity: 'MINOR',
        injuredAt: '2026-05-10',
      };
      const created = { id: 2, ...dto };

      mockRepo.create.mockReturnValue(created);
      mockRepo.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update an existing injury and return the updated record', async () => {
      const dto: UpdateInjuryDto = { status: 'CLEARED', notes: 'Fully recovered' };
      const existing = { id: 1, status: 'ACTIVE', type: 'Hamstring' };
      const updated = { ...existing, ...dto };

      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(existing as Injury)   // guard call
        .mockResolvedValueOnce(updated as Injury);   // return call

      const result = await service.update(1, dto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockRepo.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if injury does not exist during update', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Blessure introuvable'));

      await expect(service.update(999, { status: 'CLEARED' })).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should update status from ACTIVE to RECOVERING', async () => {
      const dto: UpdateInjuryDto = { status: 'RECOVERING' };
      const existing = { id: 1, status: 'ACTIVE' };
      const updated = { ...existing, ...dto };

      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(existing as Injury)
        .mockResolvedValueOnce(updated as Injury);

      const result = await service.update(1, dto);

      expect(result.status).toBe('RECOVERING');
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should remove an existing injury', async () => {
      const injury = { id: 1, type: 'Hamstring' };
      jest.spyOn(service, 'findOne').mockResolvedValue(injury as Injury);

      await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockRepo.remove).toHaveBeenCalledWith(injury);
    });

    it('should throw NotFoundException before removing if injury does not exist', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Blessure introuvable'));

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });
  });
});
