import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'api_logs', timestamps: false })
export class ApiLogModel extends Model {
  @Column({ type: DataType.JSON, allowNull: true })
  solicitud_payload: any;

  @Column({ type: DataType.JSON, allowNull: true })
  respuesta_payload: any;

  @Column({ type: DataType.STRING(256), allowNull: true })
  mensaje_api: string;

  @Column({ type: DataType.STRING(19), allowNull: true })
  fecha_registro: string;
}
