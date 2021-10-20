

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserSql {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  
}