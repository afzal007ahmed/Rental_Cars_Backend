import { Column, DataType, Model, Table } from 'sequelize-typescript';

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
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  guest: boolean;
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;
}
