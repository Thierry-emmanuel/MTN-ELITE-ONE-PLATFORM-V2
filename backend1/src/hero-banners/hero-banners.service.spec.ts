import { Test, TestingModule } from '@nestjs/testing';
import { HeroBannersService } from './hero-banners.service';
import { getModelToken } from '@nestjs/mongoose';
import { HeroBanner } from './schemas/hero-banner.schema';

describe('HeroBannersService', () => {
  let service: HeroBannersService;

  const mockHeroBanner = {
    title: { fr: 'Titre', en: 'Title' },
    subtitle: { fr: 'Sous-titre', en: 'Subtitle' },
    image_url: 'http://example.com/image.jpg',
    active: true,
    priority: 1,
  };

  beforeEach(async () => {
    function MockModel(dto) {
      return {
        ...dto,
        save: jest.fn().mockResolvedValue({ ...dto, _id: 'mockId' }),
      };
    }
    
    MockModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockHeroBanner]),
      }),
    });
    MockModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockHeroBanner),
    });
    MockModel.findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockHeroBanner),
    });
    MockModel.findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockHeroBanner),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeroBannersService,
        {
          provide: getModelToken(HeroBanner.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<HeroBannersService>(HeroBannersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new hero banner', async () => {
      const dto = { ...mockHeroBanner };
      const result = await service.create(dto as any);
      expect(result).toHaveProperty('_id', 'mockId');
    });
  });

  describe('findAll', () => {
    it('should return an array of hero banners', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockHeroBanner]);
    });
  });

  describe('findOne', () => {
    it('should return a single hero banner', async () => {
      const result = await service.findOne('mockId');
      expect(result).toEqual(mockHeroBanner);
    });
  });
});
