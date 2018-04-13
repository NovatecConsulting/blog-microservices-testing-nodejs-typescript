import 'reflect-metadata';
import { BaseCRUDRepository } from '../../src/persistence/common/BaseCRUDRepository';
import { AbstractMeta, NewDocument } from 'documentdb';
import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * The test repository setup. CRUD operations and more on the TestEntity.
 */
export class TestRepository extends BaseCRUDRepository<ITestEntity> {
    constructor() {
        super('test', TestEntity);
    }
}

/**
 * The TestEntity definition.
 */
export interface ITestEntity extends AbstractMeta, NewDocument {
    name: string;
    phonenumbers: number[];
    friends: IFriend[];
}

/**
 * The TestEntity update properties definition.
 */
export interface ITestEntityUpdateProperties {
    id?: string;
    phonenumbers?: number[] | number;
    name?: string;
    friends?: IFriend;
}

/**
 * The TestEntity.
 */
export class TestEntity implements ITestEntity {
    @IsNotEmpty()
    @IsString()
    public id: string;
    public name: string;
    public phonenumbers: number[];
    @Type(() => Friend)
    public friends: IFriend[];
    public _self: string;
    public _ts: number;
    public _rid?: string;
    public _etag?: string;
    public _attachments?: string;
    public ttl?: number;

    /**
     * toString method
     */
    public toString(): string {
        return `TestEntity{id: ${this.id}, phonenumbers: [${this.phonenumbers ? this.phonenumbers.join() : ''}], friends: [${this.friends ? this.friends.join() : ''}]}`;
    }
}

/**
 * Some test entity addition.
 */
export interface IFriend {
    id: string;
    name?: string;
}

/**
 * Some test entity addition.
 */
export class Friend implements IFriend {
    constructor(public id: string, public name?: string) { }

    public toString(): string {
        return `Friend{id: ${this.id}}`;
    }
}
