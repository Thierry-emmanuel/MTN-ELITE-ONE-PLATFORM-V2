import { Test, TestingModule } from '@nestjs/testing';
import { BigMomentsController, BigMomentsService } from './big-moments.module';
import { CreateBigMomentDto, UpdateBigMomentDto } from './dto/big-moment.dto';

describe('BigMomentsController', () => {
  let controller: BigMomentsController;
  let service: BigMomentsService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BigMomentsController],
      providers: [
        { provide: BigMomentsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<BigMomentsController>(BigMomentsController);
    service = module.get<BigMomentsService>(BigMomentsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should call service.findAll with false when featured query is absent', async () => {
      await controller.findAll(undefined);
      expect(service.findAll).toHaveBeenCalledWith(false);
    });

    it('should call service.findAll with true when featured query is "true"', async () => {
      await controller.findAll('true');
      expect(service.findAll).toHaveBeenCalledWith(true);
    });

    it('should call service.findAll with false when featured query is any other string', async () => {
      await controller.findAll('yes');
      expect(service.findAll).toHaveBeenCalledWith(false);
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should call service.findOne with the correct id', async () => {
      await controller.findOne('abc123');
      expect(service.findOne).toHaveBeenCalledWith('abc123');
    });
  });

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should call service.create with the provided DTO', async () => {
      const dto: CreateBigMomentDto = {
        title: 'Penalty Save',
        description: '<p>Incredible save</p>',
        momentDate: '2026-05-10',
        category: 'OTHER',
        mediaUrl: 'https://cdn.example.com/save.mp4',
        mediaType: 'video',
      };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should call service.update with the correct id and DTO', async () => {
      const dto: UpdateBigMomentDto = { featured: true, title: 'Hat-trick' };
      await controller.update('abc123', dto);
      expect(service.update).toHaveBeenCalledWith('abc123', dto);
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should call service.remove with the correct id', async () => {
      await controller.remove('abc123');
      expect(service.remove).toHaveBeenCalledWith('abc123');
    });
  });
});
