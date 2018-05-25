import { Exclude, Expose } from 'class-transformer';
import 'reflect-metadata';
import { COLORS } from '../persistence/entities/VehicleEntity';

/**
 * The external representation of a vehicle.
 */
@Exclude()
export class VehicleDto {
    @Expose()
    public id: string;

    @Expose()
    public color: COLORS;

    @Expose()
    public damaged?: boolean;

    public toString(): string {
        return this.damaged !== undefined ?
        `${this.constructor.name}{id: ${this.id}, color: ${this.color}, damaged: ${this.damaged}}` :
        `${this.constructor.name}{id: ${this.id}, color: ${this.color}}`;
    }
}
