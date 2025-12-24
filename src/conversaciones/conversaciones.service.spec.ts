import { Test, TestingModule } from '@nestjs/testing';
import { ConversacionesService } from './conversaciones.service';

describe('ConversacionesService', () => {
  let service: ConversacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversacionesService],
    }).compile();

    service = module.get<ConversacionesService>(ConversacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
