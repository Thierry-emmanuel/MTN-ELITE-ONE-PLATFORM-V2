import { Test, TestingModule } from '@nestjs/testing';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { CreateTransferDto, UpdateTransferDto } from './dto/transfer.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../iam/guards/permissions.guard';

describe('TransfersController', () => {
  let controller: TransfersController;
  let service: TransfersService;

  const mockTransfersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransfersController],
      providers: [
        {
          provide: TransfersService,
          useValue: mockTransfersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TransfersController>(TransfersController);
    service = module.get<TransfersService>(TransfersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll with undefined when playerId is not provided', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should call service.findAll with a number when playerId is provided as string', async () => {
      await controller.findAll('5');
      expect(service.findAll).toHaveBeenCalledWith(5);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with the correct id', async () => {
      await controller.findOne(10);
      expect(service.findOne).toHaveBeenCalledWith(10);
    });
  });

  describe('create', () => {
    it('should call service.create with the provided DTO', async () => {
      const dto: CreateTransferDto = {
        playerId: 1,
        toClubId: 2,
        type: 'LOAN',
        windowLabel: 'Winter 2026',
        transferDate: '2026-01-15',
        amount: 150000,
      };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should call service.update with the correct id and DTO', async () => {
      const dto: UpdateTransferDto = { amount: 500000 };
      await controller.update(15, dto);
      expect(service.update).toHaveBeenCalledWith(15, dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove with the correct id', async () => {
      await controller.remove(20);
      expect(service.remove).toHaveBeenCalledWith(20);
    });
  });
});
