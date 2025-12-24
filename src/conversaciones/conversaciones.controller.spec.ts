import { Test, TestingModule } from '@nestjs/testing';
import { ConversacionesController } from './conversaciones.controller';
import { ConversacionesService } from './conversaciones.service';

describe('ConversacionesController', () => {
  let controller: ConversacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversacionesController],
      providers: [ConversacionesService],
    }).compile();

    controller = module.get<ConversacionesController>(ConversacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
