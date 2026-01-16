import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Trip } from '../trips/entities/trip.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<Booking> {
    // Récupérer le trip pour calculer le prix
    const trip = await this.tripRepository.findOne({
      where: { id: createBookingDto.tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // Calculer le prix total
    const totalPrice = trip.price * createBookingDto.seats;

    const booking = this.bookingRepository.create({
      ...createBookingDto,
      userId,
      totalPrice,
    });

    return this.bookingRepository.save(booking);
  }

  /**
   * Rechercher des réservations avec filtres
   * Implémente BF23
   */
  async findAll(filters?: {
    tripId?: string;
    userId?: string;
  }): Promise<Booking[]> {
    const query = this.bookingRepository.createQueryBuilder('booking');

    if (filters?.tripId) {
      query.andWhere('booking.tripId = :tripId', { tripId: filters.tripId });
    }

    if (filters?.userId) {
      query.andWhere('booking.userId = :userId', { userId: filters.userId });
    }

    return query
      .leftJoinAndSelect('booking.trip', 'trip')
      .leftJoinAndSelect('booking.user', 'user')
      .getMany();
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['trip', 'user'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    userId: string,
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only edit your own bookings');
    }

    // Recalculer le prix si le nombre de places change
    if (updateBookingDto.seats) {
      const trip = await this.tripRepository.findOne({
        where: { id: booking.tripId },
      });
      booking.totalPrice = trip.price * updateBookingDto.seats;
    }

    Object.assign(booking, updateBookingDto);
    return this.bookingRepository.save(booking);
  }

  async remove(id: string, userId: string): Promise<void> {
    const booking = await this.findOne(id);

    if (booking.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    await this.bookingRepository.remove(booking);
  }

  /**
   * Récupérer toutes les réservations d'un utilisateur
   * Implémente BF19
   */
  async findByUser(userId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { userId },
      relations: ['trip'],
    });
  }
}
