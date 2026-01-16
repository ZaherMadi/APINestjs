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
import { Trip } from '../../trips/entities/trip.entity';

/**
 * Entité Boat - Représente la table "boats" dans la base de données
 *
 * @ManyToOne() : Relation "plusieurs-à-un" (plusieurs boats → 1 user)
 * @JoinColumn() : Spécifie la colonne de jointure (clé étrangère)
 */
@Entity('boats')
export class Boat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  yearBuilt: number;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({
    type: 'enum',
    enum: ['coastal', 'river'],
    nullable: true,
  })
  licenseType: string;

  @Column({
    type: 'enum',
    enum: ['open', 'cabin', 'catamaran', 'sailboat', 'jet_ski', 'canoe'],
  })
  boatType: string;

  // type: 'simple-array' stocke un tableau sous forme de chaîne séparée par des virgules
  @Column({ type: 'simple-array', nullable: true })
  equipment: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deposit: number;

  @Column()
  maxCapacity: number;

  @Column({ nullable: true })
  bedCount: number;

  @Column()
  homePort: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({
    type: 'enum',
    enum: ['diesel', 'gasoline', 'none'],
    nullable: true,
  })
  engineType: string;

  @Column({ nullable: true })
  enginePower: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  // Plusieurs bateaux appartiennent à un utilisateur
  @ManyToOne(() => User, (user) => user.boats)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  // Un bateau peut être utilisé pour plusieurs sorties
  @OneToMany(() => Trip, (trip) => trip.boat)
  trips: Trip[];
}
