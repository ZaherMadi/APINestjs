import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';
import { Boat } from '../boats/entities/boat.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Boat)
    private boatRepository: Repository<Boat>,
  ) {}

  /**
   * Créer une sortie pêche
   * Implémente BF26 : interdire la création si l'utilisateur n'a pas de bateau
   */
  async create(createTripDto: CreateTripDto, userId: string): Promise<Trip> {
    // Vérifier que l'utilisateur possède au moins un bateau
    const userBoats = await this.boatRepository.count({
      where: { ownerId: userId },
    });

    if (userBoats === 0) {
      throw new ForbiddenException({
        code: '403',
        businessCode: 'USER_HAS_NO_BOAT',
        message: 'User must own a boat to create trips',
      });
    }

    // Vérifier que le bateau spécifié appartient à l'utilisateur
    const boat = await this.boatRepository.findOne({
      where: { id: createTripDto.boatId },
    });

    if (!boat) {
      throw new NotFoundException('Boat not found');
    }

    if (boat.ownerId !== userId) {
      throw new ForbiddenException('You can only create trips with your own boats');
    }

    const trip = this.tripRepository.create({
      ...createTripDto,
      organizerId: userId,
    });

    return this.tripRepository.save(trip);
  }

  /**
   * Rechercher des sorties avec filtres
   * Implémente BF22
   */
  async findAll(filters?: {
    tripType?: string;
    minPrice?: number;
    maxPrice?: number;
    startDate?: string;
  }): Promise<Trip[]> {
    const query = this.tripRepository.createQueryBuilder('trip');

    if (filters?.tripType) {
      query.andWhere('trip.tripType = :tripType', {
        tripType: filters.tripType,
      });
    }

    if (filters?.minPrice) {
      query.andWhere('trip.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters?.maxPrice) {
      query.andWhere('trip.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    return query.leftJoinAndSelect('trip.boat', 'boat').getMany();
  }

  async findOne(id: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: ['boat', 'organizer', 'bookings'],
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }

  async update(
    id: string,
    updateTripDto: UpdateTripDto,
    userId: string,
  ): Promise<Trip> {
    const trip = await this.findOne(id);

    if (trip.organizerId !== userId) {
      throw new ForbiddenException('You can only edit your own trips');
    }

    Object.assign(trip, updateTripDto);
    return this.tripRepository.save(trip);
  }

  async remove(id: string, userId: string): Promise<void> {
    const trip = await this.findOne(id);

    if (trip.organizerId !== userId) {
      throw new ForbiddenException('You can only delete your own trips');
    }

    await this.tripRepository.remove(trip);
  }

  /**
   * Récupérer toutes les sorties d'un utilisateur
   * Implémente BF19
   */
  async findByUser(userId: string): Promise<Trip[]> {
    return this.tripRepository.find({ where: { organizerId: userId } });
  }
}
