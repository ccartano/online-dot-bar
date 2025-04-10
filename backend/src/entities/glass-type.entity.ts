import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cocktail } from './index';

@Entity()
export class GlassType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @OneToMany(() => Cocktail, (cocktail) => cocktail.glassType)
  cocktails: Cocktail[];
}
