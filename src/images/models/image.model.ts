import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Vehicle } from 'src/vehicle/models/vehicle.model';

@Table({
  tableName: 'VehicleImages',
})
export class Images extends Model {
  @ForeignKey(() => Vehicle)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  vehicle_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image: string;

  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;
}
