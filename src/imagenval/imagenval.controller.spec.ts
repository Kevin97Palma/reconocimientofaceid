import { Test, TestingModule } from '@nestjs/testing';
import { ImagenvalController } from './imagenval.controller';
import { ImagenvalService } from './imagenval.service';

describe('ImagenvalController', () => {
  let controller: ImagenvalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagenvalController],
      providers: [ImagenvalService],
    }).compile();

    controller = module.get<ImagenvalController>(ImagenvalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
