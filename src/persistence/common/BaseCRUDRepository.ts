import { transformAndValidate } from 'class-transformer-validator';
import { AbstractMeta, CollectionMeta, DatabaseMeta, DocumentClient, ProcedureMeta, QueryError, RetrievedDocument, SqlQuerySpec } from 'documentdb';
import { DATABASE_ID, MAX_DATABASE_QUERY_RETRIES } from '../../common/config';
import { DbQueryError } from '../../errors/DbQueryError';
import { RepositoryError } from '../../errors/RepositoryError';
import { UnexpectedServiceError } from '../../errors/UnexpectedServiceError';
import { ErrorHandler } from '../../middlewares/ErrorHandler';
import { DatabaseUtils } from './DatabaseUtils';
import DocumentDbClient from './DocumentClientFactory';
import { IRepository } from './IRepository';
import { IBulkDeleteResponseBody } from './stored-procedures/BulkDeleteStoredProcedure';

/**
 * The Base class for all Repositories.
 * Each Repository should extend this class and call its' construcotr first.
 */
export abstract class BaseCRUDRepository<T extends AbstractMeta> implements IRepository<T> {

    /**
     * The database this service is running against.
     * Should not be manipulated in common cases. Is public for testing reasons.
     */
    protected database: DatabaseMeta | undefined;

    /**
     * The collection of this repository.
     * Should not be manipulated in common cases. Is public for testing reasons.
     */
    protected collection: CollectionMeta | undefined;

    /**
     * The stored procedure reference for updating documents.
     */
    protected updateProcedure: ProcedureMeta | undefined;

    /**
     * The stored procedure reference for cleaning the collection.
     */
    protected bulkDeleteProcedure: ProcedureMeta | undefined;

    /**
     * The DocumentClient to work with the documentdb.
     */
    protected docDbClient: DocumentClient;

    /**
     * The class constructor of the entity that is handled by the repository.
     */
    protected classType: new (...args: any[]) => T;

    /**
     * The collectionId that is set initially.
     */
    private collectionId: string;

    /**
     * Constructor of the BaseCRUDRepository. Is used to initialize the database and the collection.
     * It is setting up the connect and creates or gets both.
     * @param collectionId The collection id.
     * @param classType The class constructor of the entity that the repository handles.
     */
    constructor(collectionId: string, classType: new (...args: any[]) => T) {
        this.docDbClient = DocumentDbClient;
        this.collectionId = collectionId;
        this.classType = classType;
    }

    /**
     * Creates a new object.
     * @param obj The object to create.
     * @returns {Promise<T>}
     * @throws {RepositoryError | UnexpectedServiceError}
     */
    public async create(obj: T): Promise<T> {
        return this.retry(this.cr, obj);
    }

    /**
     * Finds an object by id.
     * Returns the retrieved document or null in case nothing was found.
     * @param id The id to search for.
     * @returns {Promise<T | null>}
     * @throws {RepositoryError | UnexpectedServiceError}
     */
    public async findOne(id: string): Promise<T | null> {
        return this.retry(this.fi, id);
    }

    /**
     * Finds all objects.
     * Returns array of result if retrieved at least one document or null if nothing was found.
     * @returns {Promise<T[]| null>}
     * @throws {RepositoryError | UnexpectedServiceError}
     */
    public async findAll(): Promise<T[] | null> {
        return this.retry(this.fiAll);
    }

    /**
     * Deletes an object.
     * @param obj The object.
     * @returns {Promise<void>}
     * @throws {RepositoryError | UnexpectedServiceError}
     */
    public async remove(obj: T): Promise<void> {
        return this.retry(this.rm, obj);
    }

    /**
     * Deletes all objects.
     * @returns {Promise<void>}
     * @throws {RepositoryError}
     */
    public async removeAll(): Promise<void> {
        return this.retry(this.rmAll);
    }

    /**
     * Retries the given method with the given arguments for docdb client timeout error (ECONNRESET) until the limit is reached.
     * @param method The method to retry.
     * @param args The arguments to apply to the given method.
     */
    protected async retry<A>(method: (...args: any[]) => A, ...args: any[]): Promise<A> {
        // tslint:disable-next-line:no-unused-variable
        for (const retry of new Array(MAX_DATABASE_QUERY_RETRIES)) {
            try {
                return await method.apply(this, args);
            } catch (e) {
                if (e.retry === undefined || !e.retry) {
                    throw e;
                }
            }
        }
        throw new RepositoryError('Maximum database query retries.');
    }

    /**
     * Checks if the asynchronous initialization has already happened, or if it should be ran.
     * Should be considered to be placed in front of each repository method.
     */
    protected async evaluateInit(): Promise<void> {
        if (this.database === undefined || this.collection === undefined || this.updateProcedure === undefined || this.bulkDeleteProcedure === undefined) {
            await this.initDbCollAndStoredProcedures();
        }
    }

    /**
     * Initializes the database and the collection for the respective repository, as wells as the stored procedures needed.
     * Only public, that it can be used in integration testing to reinitialize the database and the collection.
     * @throws Error when getting or creating db or collection is not successful
     */
    private async initDbCollAndStoredProcedures(): Promise<void> {
        try {
            this.database = await DatabaseUtils.getOrCreateDatabase(this.docDbClient, DATABASE_ID);
            this.collection = await DatabaseUtils.getOrCreateCollection(this.docDbClient, this.database._self, this.collectionId);
            this.bulkDeleteProcedure = await DatabaseUtils.getOrCreateBulkDeleteStoredProcedure(this.docDbClient, this.collection._self);
        } catch (e) {
            throw e;
        }
    }

    /**
     * Creates a new object.
     * @param obj The object to create.
     * @returns {Promise<T>}
     * @throws {RepositoryError | UnexpectedServiceError}
     */
    private async cr(obj: T): Promise<T> {
        try {
            await this.evaluateInit();
            const retrieved = await new Promise<RetrievedDocument>((resolve, reject) => {
                this.docDbClient.createDocument(this.collection!._self, obj, (err: QueryError, result: RetrievedDocument) => {
                    if (err) {
                        reject(new DbQueryError(err));
                    } else {
                        resolve(result);
                    }
                });
            });
            return await transformAndValidate(this.classType, retrieved);
        } catch (e) {
            await ErrorHandler.handleRepositoryErrors(e);
        }
        throw new UnexpectedServiceError();
    }

    /**
     * Finds an object by id.
     * Returns the retrieved document or null in case nothing was found.
     * @param id The id to search for.
     * @returns {Promise<T | null>}
     * @throws {RepositoryError | UnexpectedServiceError}
     */
    private async fi(id: string): Promise<T | null> {
        try {
            await this.evaluateInit();
            const querySpec: SqlQuerySpec = {
                parameters: [{
                    name: '@id',
                    value: id,
                }],
                query: 'SELECT * FROM root r WHERE r.id=@id',
            };
            const retrieved = await new Promise<RetrievedDocument | null>((resolve, reject) => {
                this.docDbClient.queryDocuments(this.collection!._self, querySpec).toArray((err: QueryError, results: RetrievedDocument[]) => {
                    if (err) {
                        reject(new DbQueryError(err));
                    } else {
                        if (results.length === 0) {
                            resolve(null);
                        } else {
                            resolve(results[0]);
                        }
                    }
                });
            });
            return retrieved !== null ? await transformAndValidate(this.classType, retrieved) : null;
        } catch (e) {
            await ErrorHandler.handleRepositoryErrors(e);
        }
        throw new UnexpectedServiceError();
    }

    /**
     * Finds all objects.
     * Returns array of result if retrieved at least one document or null if nothing was found.
     * @returns {Promise<T[]| null>}
     * @throws {RepositoryError | UnexpectedServiceError}
     */
    private async fiAll(): Promise<T[] | null> {
        try {
            await this.evaluateInit();
            const querySpec: SqlQuerySpec = {
                parameters: [],
                query: 'SELECT * FROM root r',
            };
            const retrieved = await new Promise<RetrievedDocument[] | null>((resolve, reject) => {
                this.docDbClient.queryDocuments(this.collection!._self, querySpec).toArray((err: QueryError, results: RetrievedDocument[]) => {
                    if (err) {
                        reject(new DbQueryError(err));
                    } else {
                        if (results.length === 0) {
                            resolve(null);
                        } else {
                            resolve(results);
                        }
                    }
                });
            });
            return retrieved !== null ? await transformAndValidate(this.classType, retrieved) : null;
        } catch (e) {
            await ErrorHandler.handleRepositoryErrors(e);
        }
        throw new UnexpectedServiceError();
    }

    /**
     * Deletes an object.
     * @param obj The object.
     * @returns {Promise<void>}
     * @throws {RepositoryError | UnexpectedServiceError}
     */
    private async rm(obj: T): Promise<void> {
        try {
            await this.evaluateInit();
            let documentLink: string;
            if (obj._self !== undefined) {
                documentLink = obj._self;
            } else {
                throw new TypeError('The given type is not possible to remove.');
            }
            await new Promise<void>((resolve, reject) => {
                this.docDbClient.deleteDocument(documentLink, (err: QueryError, result: void) => {
                    if (err) {
                        reject(new DbQueryError(err));
                    } else {
                        resolve();
                    }
                });
            });
        } catch (e) {
            await ErrorHandler.handleRepositoryErrors(e);
        }
    }

    /**
     * Deletes all objects.
     * @returns {Promise<void>}
     * @throws {RepositoryError | UnexpectedServiceError}
     */
    private async rmAll(): Promise<void> {
        try {
            await this.evaluateInit();
            if (await new Promise<boolean>((resolve, reject) => {
                this.docDbClient.executeStoredProcedure(this.bulkDeleteProcedure!._self, ['SELECT * FROM root'], (err: QueryError, result: IBulkDeleteResponseBody) => {
                    if (err) {
                        reject(new DbQueryError(err));
                    } else {
                        resolve(result.continuation);
                    }
                });
            })) {
                await this.rmAll();
            }
        } catch (e) {
            await ErrorHandler.handleRepositoryErrors(e);
        }
    }
}
