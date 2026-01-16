import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Boat } from '../../boats/entities/boat.entity';
import { Booking } from '../../bookings/entities/booking.entity';

/**
 * Entité Trip - Représente la table "trips" (sorties pêche)
 */
@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  practicalInfo: string;

  @Column({
    type: 'enum',
    enum: ['daily', 'recurring'],
    default: 'daily',
  })
  tripType: string;

  @Column({
    type: 'enum',
    enum: ['total', 'per_person'],
    default: 'per_person',
  })
  pricingType: string;

  @Column({ type: 'simple-array', nullable: true })
  startDates: string[];

  @Column({ type: 'simple-array', nullable: true })
  endDates: string[];

  @Column({ type: 'simple-array', nullable: true })
  startTimes: string[];

  @Column({ type: 'simple-array', nullable: true })
  endTimes: string[];

  @Column()
  passengerCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.trips)
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @Column()
  organizerId: string;

  @ManyToOne(() => Boat, (boat) => boat.trips)
  @JoinColumn({ name: 'boatId' })
  boat: Boat;

  @Column()
  boatId: string;

  @OneToMany(() => Booking, (booking) => booking.trip)
  bookings: Booking[];
}
