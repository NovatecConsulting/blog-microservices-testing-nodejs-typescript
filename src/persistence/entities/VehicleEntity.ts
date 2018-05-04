import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AbstractMeta, NewDocument } from 'documentdb';
import 'reflect-metadata';

/**
 * Available colors
 */
export enum COLORS {
    RED,
    YELLOW,
    BLUE,
    GREEN,
}

/**
 * The vehicle entity.
 */
export class VehicleEntity implements IVehicleEntity {

    @IsNotEmpty()
    @IsString()
    public id: string;

    @IsNotEmpty()
    @IsEnum(COLORS)
    public color: COLORS;

    public _self: string;
    public _ts: number;
    public _rid?: string;
    public _etag?: string;
    public _attachments?: string;
    public ttl?: number;

    /**
     * Constructs the VehicleEntity
     * @param id The id.
     * @param color The color.
     */
    constructor(id: string, color: COLORS) {
        this.id = id;
        this.color = color;
    }

    public toString(): string {
        return `${this.constructor.name}{id: ${this.id}}`;
    }
}

/**
 * The vehicle interface.
 */
export interface IVehicleEntity extends AbstractMeta, NewDocument {
    color: COLORS;
}
