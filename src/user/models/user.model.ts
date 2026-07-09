import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Bookings } from 'src/bookings/models/bookings.model';

export interface UserTableInterface {
  name?: string;
  id?: string;
  email?: string;
  password?: string;
  guest?: boolean;
}

@Table({
  tableName: 'users',
})
export class User extends Model<UserTableInterface> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @HasMany(() => Bookings)
  bookings: Bookings[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  guest: boolean;
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  password: string;
}
