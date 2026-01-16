import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Boat } from './entities/boat.entity';
import { User } from '../users/entities/user.entity';
import { CreateBoatDto } from './dto/create-boat.dto';
import { UpdateBoatDto } from './dto/update-boat.dto';

/**
 * Service Boats
 * Implémente les règles métier pour les bateaux
 */
@Injectable()
export class BoatsService {
  constructor(
    @InjectRepository(Boat)
    private boatRepository: Repository<Boat>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Créer un bateau
   * Implémente BF4 et BF27 (interdire création sans permis)
   */
  async create(createBoatDto: CreateBoatDto, userId: string): Promise<Boat> {
    // Vérifier que l'utilisateur a un permis bateau (BF27)
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user.boatLicenseNumber) {
      throw new ForbiddenException({
        code: '403',
        businessCode: 'PERMIT_REQUIRED',
        message: 'Boat license is required to create a boat',
      });
    }

    const boat = this.boatRepository.create({
      ...createBoatDto,
      ownerId: userId,
    });

    return this.boatRepository.save(boat);
  }

  /**
   * Rechercher des bateaux avec filtres
   * Implémente BF21 et BF24 (bounding box)
   */
  async findAll(filters?: {
    boatType?: string;
    homePort?: string;
    minCapacity?: number;
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
  }): Promise<Boat[]> {
    const query = this.boatRepository.createQueryBuilder('boat');

    if (filters?.boatType) {
      query.andWhere('boat.boatType = :boatType', {
        boatType: filters.boatType,
      });
    }

    if (filters?.homePort) {
      query.andWhere('boat.homePort ILIKE :homePort', {
        homePort: `%${filters.homePort}%`,
      });
    }

    if (filters?.minCapacity) {
      query.andWhere('boat.maxCapacity >= :minCapacity', {
        minCapacity: filters.minCapacity,
      });
    }

    // Bounding box pour la recherche géographique (BF24)
    if (
      filters?.minLat &&
      filters?.maxLat &&
      filters?.minLng &&
      filters?.maxLng
    ) {
      query.andWhere(
        'boat.latitude BETWEEN :minLat AND :maxLat AND boat.longitude BETWEEN :minLng AND :maxLng',
        {
          minLat: filters.minLat,
          maxLat: filters.maxLat,
          minLng: filters.minLng,
          maxLng: filters.maxLng,
        },
      );
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Boat> {
    const boat = await this.boatRepository.findOne({
      where: { id },
      relations: ['owner', 'trips'],
    });

    if (!boat) {
      throw new NotFoundException(`Boat with ID ${id} not found`);
    }

    return boat;
  }

  /**
   * Mettre à jour un bateau
   * Seul le propriétaire peut modifier son bateau
   */
  async update(
    id: string,
    updateBoatDto: UpdateBoatDto,
    userId: string,
  ): Promise<Boat> {
    const boat = await this.findOne(id);

    if (boat.ownerId !== userId) {
      throw new ForbiddenException('You can only edit your own boats');
    }

    Object.assign(boat, updateBoatDto);
    return this.boatRepository.save(boat);
  }

  /**
   * Supprimer un bateau
   * Seul le propriétaire peut supprimer son bateau
   */
  async remove(id: string, userId: string): Promise<void> {
    const boat = await this.findOne(id);

    if (boat.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own boats');
    }

    await this.boatRepository.remove(boat);
  }

  /**
   * Récupérer tous les bateaux d'un utilisateur
   * Implémente BF19
   */
  async findByUser(userId: string): Promise<Boat[]> {
    return this.boatRepository.find({ where: { ownerId: userId } });
  }
}
