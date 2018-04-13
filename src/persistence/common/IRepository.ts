import { AbstractMeta } from 'documentdb';

/**
 * Common Repository
 */
export interface IRepository<T extends AbstractMeta> {
    create(obj: T): Promise<T>;
    findOne(id: string): Promise<T | null>;
    findAll(): Promise<T[] | null>;
    remove(obj: T): Promise<void>;
    removeAll(): Promise<void>;
}
