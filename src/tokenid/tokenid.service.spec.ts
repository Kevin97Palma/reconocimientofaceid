import { Test, TestingModule } from '@nestjs/testing';
import { TokenidService } from './tokenid.service';

describe('TokenidService', () => {
  let service: TokenidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenidService],
    }).compile();

    service = module.get<TokenidService>(TokenidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
