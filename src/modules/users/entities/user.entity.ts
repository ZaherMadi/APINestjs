import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Boat } from '../../boats/entities/boat.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { LogbookEntry } from '../../logbook/entities/logbook-entry.entity';

/**
 * Entité User - Représente la table "users" dans la base de données
 *
 * CONCEPT TypeORM - ENTITY:
 * Une entité est une classe qui représente une table SQL.
 * Chaque propriété devient une colonne dans la table.
 *
 * DECORATEURS TypeORM:
 * @Entity() : Marque la classe comme une entité de base de données
 * @Column() : Définit une colonne de table
 * @PrimaryGeneratedColumn('uuid') : Clé primaire auto-générée au format UUID
 * @CreateDateColumn() : Colonne avec date de création automatique
 * @UpdateDateColumn() : Colonne avec date de modification automatique
 * @OneToMany() : Relation "un-à-plusieurs" (1 user → plusieurs boats)
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lastName: string;

  @Column()
  firstName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Ne pas inclure le mot de passe dans les requêtes SELECT par défaut
  password: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({
    type: 'enum',
    enum: ['individual', 'professional'],
    default: 'individual',
  })
  status: string;

  @Column({ nullable: true, length: 8 })
  boatLicenseNumber: string;

  @Column({ nullable: true, length: 12 })
  insuranceNumber: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({
    type: 'enum',
    enum: ['rental', 'fishing_guide'],
    nullable: true,
  })
  activityType: string;

  // Nouveaux champs CDC Annexe 1
  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true, length: 10 })
  postalCode: string;

  @Column('simple-array', { nullable: true })
  languages: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  // Un utilisateur peut avoir plusieurs bateaux
  @OneToMany(() => Boat, (boat) => boat.owner)
  boats: Boat[];

  // Un utilisateur peut organiser plusieurs sorties
  @OneToMany(() => Trip, (trip) => trip.organizer)
  trips: Trip[];

  // Un utilisateur peut avoir plusieurs réservations
  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  // Un utilisateur peut avoir plusieurs entrées dans son carnet de pêche
  @OneToMany(() => LogbookEntry, (entry) => entry.user)
  logbookEntries: LogbookEntry[];
}
