import { Test, TestingModule } from '@nestjs/testing';
import { TokenidController } from './tokenid.controller';
import { TokenidService } from './tokenid.service';

describe('TokenidController', () => {
  let controller: TokenidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenidController],
      providers: [TokenidService],
    }).compile();

    controller = module.get<TokenidController>(TokenidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
