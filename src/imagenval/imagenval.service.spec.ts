import { Test, TestingModule } from '@nestjs/testing';
import { ImagenvalService } from './imagenval.service';

describe('ImagenvalService', () => {
  let service: ImagenvalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImagenvalService],
    }).compile();

    service = module.get<ImagenvalService>(ImagenvalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
