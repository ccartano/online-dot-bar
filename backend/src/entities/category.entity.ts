import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cocktail } from './index';

@Entity({ schema: 'online_bar_schema' })
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Cocktail, (cocktail) => cocktail.category)
  cocktails: Cocktail[];
}
