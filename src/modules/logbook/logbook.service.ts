import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogbookEntry } from './entities/logbook-entry.entity';
import { CreateLogbookEntryDto } from './dto/create-logbook-entry.dto';
import { UpdateLogbookEntryDto } from './dto/update-logbook-entry.dto';

@Injectable()
export class LogbookService {
  constructor(
    @InjectRepository(LogbookEntry)
    private logbookRepository: Repository<LogbookEntry>,
  ) {}

  async create(
    createLogbookEntryDto: CreateLogbookEntryDto,
    userId: string,
  ): Promise<LogbookEntry> {
    const entry = this.logbookRepository.create({
      ...createLogbookEntryDto,
      userId,
    });

    return this.logbookRepository.save(entry);
  }

  /**
   * Rechercher des entrées de carnet avec filtres
   */
  async findAll(filters: {
    userId: string;
    startDate?: string;
    fishSpecies?: string;
  }): Promise<LogbookEntry[]> {
    const query = this.logbookRepository.createQueryBuilder('entry');

    // userId est obligatoire selon le Swagger
    query.andWhere('entry.userId = :userId', { userId: filters.userId });

    if (filters.startDate) {
      query.andWhere('entry.fishingDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.fishSpecies) {
      query.andWhere('entry.fishSpecies ILIKE :fishSpecies', {
        fishSpecies: `%${filters.fishSpecies}%`,
      });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<LogbookEntry> {
    const entry = await this.logbookRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!entry) {
      throw new NotFoundException(`Logbook entry with ID ${id} not found`);
    }

    return entry;
  }

  async update(
    id: string,
    updateLogbookEntryDto: UpdateLogbookEntryDto,
    userId: string,
  ): Promise<LogbookEntry> {
    const entry = await this.findOne(id);

    if (entry.userId !== userId) {
      throw new ForbiddenException('You can only edit your own logbook entries');
    }

    Object.assign(entry, updateLogbookEntryDto);
    return this.logbookRepository.save(entry);
  }

  async remove(id: string, userId: string): Promise<void> {
    const entry = await this.findOne(id);

    if (entry.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own logbook entries',
      );
    }

    await this.logbookRepository.remove(entry);
  }

  /**
   * Récupérer toutes les entrées du carnet d'un utilisateur
   * Implémente BF19
   */
  async findByUser(userId: string): Promise<LogbookEntry[]> {
    return this.logbookRepository.find({ where: { userId } });
  }
}
