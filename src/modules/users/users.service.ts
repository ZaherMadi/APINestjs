import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Boat } from '../boats/entities/boat.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { LogbookEntry } from '../logbook/entities/logbook-entry.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

/**
 * Service Users - Contient toute la logique métier pour les utilisateurs
 *
 * Les services utilisent Repository<Entity> pour interagir avec la DB.
 * Repository vient de TypeORM et fournit des méthodes comme:
 * - find() : récupérer plusieurs entités
 * - findOne() : récupérer une entité
 * - save() : créer ou mettre à jour
 * - remove() : supprimer
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Boat)
    private boatRepository: Repository<Boat>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(LogbookEntry)
    private logbookRepository: Repository<LogbookEntry>,
  ) {}

  /**
   * Créer un nouvel utilisateur
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Créer l'entité User
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Sauvegarder en DB
    return this.userRepository.save(user);
  }

  /**
   * Rechercher des utilisateurs avec filtres optionnels
   * Implémente BF20 du cahier des charges
   */
  async findAll(filters?: {
    lastName?: string;
    city?: string;
    status?: string;
  }): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');

    // Ajouter les filtres si présents
    if (filters?.lastName) {
      query.andWhere('user.lastName ILIKE :lastName', {
        lastName: `%${filters.lastName}%`,
      });
    }

    if (filters?.city) {
      query.andWhere('user.city ILIKE :city', {
        city: `%${filters.city}%`,
      });
    }

    if (filters?.status) {
      query.andWhere('user.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['boats', 'trips', 'bookings', 'logbookEntries'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Mettre à jour un utilisateur
   * Implémente BF13 du cahier des charges
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
  ): Promise<User> {
    // Vérifier que l'utilisateur modifie son propre profil
    if (id !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.findOne(id);

    // Si le mot de passe est modifié, le hasher
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  /**
   * Supprimer un utilisateur (anonymisation RGPD)
   * Implémente BF8 et BN6 du cahier des charges
   */
  async remove(id: string, currentUserId: string): Promise<void> {
    // Vérifier que l'utilisateur supprime son propre compte
    if (id !== currentUserId) {
      throw new ForbiddenException('You can only delete your own account');
    }

    const user = await this.findOne(id);

    // Anonymisation des données personnelles (RGPD)
    user.lastName = 'ANONYME';
    user.firstName = 'ANONYME';
    user.email = `deleted_${Date.now()}@anonymized.com`;
    user.phone = null;
    user.photoUrl = null;
    user.boatLicenseNumber = null;
    user.insuranceNumber = null;
    user.companyName = null;

    await this.userRepository.save(user);
  }

  /**
   * Récupérer les bateaux d'un utilisateur (BF19)
   */
  async getUserBoats(userId: string) {
    await this.findOne(userId); // Vérifie que l'utilisateur existe
    return this.boatRepository.find({ where: { ownerId: userId } });
  }

  /**
   * Récupérer les sorties d'un utilisateur (BF19)
   */
  async getUserTrips(userId: string) {
    await this.findOne(userId); // Vérifie que l'utilisateur existe
    return this.tripRepository.find({
      where: { organizerId: userId },
      relations: ['boat'],
    });
  }

  /**
   * Récupérer les réservations d'un utilisateur (BF19)
   */
  async getUserBookings(userId: string) {
    await this.findOne(userId); // Vérifie que l'utilisateur existe
    return this.bookingRepository.find({
      where: { userId },
      relations: ['trip'],
    });
  }
}
