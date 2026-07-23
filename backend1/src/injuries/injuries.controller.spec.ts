import { Test, TestingModule } from '@nestjs/testing';
import { InjuriesController } from './injuries.module';
import { InjuriesService } from './injuries.service';
import { CreateInjuryDto, UpdateInjuryDto } from './dto/injury.dto';

describe('InjuriesController', () => {
  let controller: InjuriesController;
  let service: InjuriesService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InjuriesController],
      providers: [
        { provide: InjuriesService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<InjuriesController>(InjuriesController);
    service = module.get<InjuriesService>(InjuriesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should call service.findAll with undefined when no status is provided', async () => {
      await controller.findAll(undefined);
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should call service.findAll with "ACTIVE" status', async () => {
      await controller.findAll('ACTIVE');
      expect(service.findAll).toHaveBeenCalledWith('ACTIVE');
    });

    it('should call service.findAll with "RECOVERING" status', async () => {
      await controller.findAll('RECOVERING');
      expect(service.findAll).toHaveBeenCalledWith('RECOVERING');
    });

    it('should call service.findAll with "CLEARED" status', async () => {
      await controller.findAll('CLEARED');
      expect(service.findAll).toHaveBeenCalledWith('CLEARED');
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should call service.findOne with the correct numeric id', async () => {
      await controller.findOne(7);
      expect(service.findOne).toHaveBeenCalledWith(7);
    });
  });

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should call service.create with the provided DTO', async () => {
      const dto: CreateInjuryDto = {
        playerId: 12,
        type: 'Ankle sprain',
        severity: 'MODERATE',
        injuredAt: '2026-04-20',
        expectedReturn: '2026-05-15',
        notes: 'Strapping applied',
      };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should call service.create with only required fields', async () => {
      const dto: CreateInjuryDto = {
        playerId: 8,
        type: 'Muscle pull',
        severity: 'MINOR',
        injuredAt: '2026-07-01',
      };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should call service.update with the correct id and DTO', async () => {
      const dto: UpdateInjuryDto = { status: 'CLEARED', notes: 'Player has returned to training' };
      await controller.update(3, dto);
      expect(service.update).toHaveBeenCalledWith(3, dto);
    });

    it('should call service.update with a partial DTO (status only)', async () => {
      const dto: UpdateInjuryDto = { status: 'RECOVERING' };
      await controller.update(5, dto);
      expect(service.update).toHaveBeenCalledWith(5, dto);
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should call service.remove with the correct id', async () => {
      await controller.remove(10);
      expect(service.remove).toHaveBeenCalledWith(10);
    });
  });
});
