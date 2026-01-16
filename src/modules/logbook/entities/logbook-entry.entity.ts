import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Entité LogbookEntry - Représente la table "logbook_entries" (carnet de pêche)
 */
@Entity('logbook_entries')
export class LogbookEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fishSpecies: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  length: number; // en cm

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number; // en kg

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'date' })
  fishingDate: Date;

  @Column({ default: false })
  released: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.logbookEntries)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}
