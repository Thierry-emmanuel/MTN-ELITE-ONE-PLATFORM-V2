import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { getModelToken } from '@nestjs/mongoose';
import { Article } from './schemas/article.schema';

describe('ArticlesService', () => {
  let service: ArticlesService;

  const mockArticle = {
    title: { fr: 'Titre', en: 'Title' },
    body: { fr: 'Corps', en: 'Body' },
    category: 'news',
    author: 'Author',
    slug: 'slug',
  };

  beforeEach(async () => {
    // Define the mock constructor function
    function MockModel(dto) {
      return {
        ...dto,
        save: jest.fn().mockResolvedValue({ ...dto, _id: 'mockId' }),
      };
    }
    
    // Add static methods to the mock constructor
    MockModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockArticle]),
    });
    MockModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockArticle),
    });
    MockModel.findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockArticle),
    });
    MockModel.findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockArticle),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getModelToken(Article.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const dto = { ...mockArticle };
      const result = await service.create(dto);
      expect(result).toHaveProperty('_id', 'mockId');
    });
  });

  describe('findAll', () => {
    it('should return an array of articles', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual([mockArticle]);
    });
  });

  describe('findById', () => {
    it('should return a single article', async () => {
      const result = await service.findById('mockId');
      expect(result).toEqual(mockArticle);
    });
  });
});
