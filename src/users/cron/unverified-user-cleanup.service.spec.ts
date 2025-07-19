import { Test, TestingModule } from '@nestjs/testing';
import { UnverifiedUserCleanupService } from './unverified-user-cleanup.service';

describe('UnverifiedUserCleanupService', () => {
  let service: UnverifiedUserCleanupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnverifiedUserCleanupService],
    }).compile();

    service = module.get<UnverifiedUserCleanupService>(UnverifiedUserCleanupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
