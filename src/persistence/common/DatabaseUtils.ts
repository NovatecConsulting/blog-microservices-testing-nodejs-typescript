import {
    Collection, CollectionMeta, DatabaseMeta, DocumentClient, ProcedureMeta, QueryError, RequestOptions,
    SqlQuerySpec, UniqueId,
} from 'documentdb';
import { DATABASE_COLLECTION_THROUGHPUT } from '../../common/config';
import { bulkDeleteProc } from './stored-procedures/BulkDeleteStoredProcedure';

/**
 * Offers some basic database utils.
 */
export class DatabaseUtils {

    /**
     * Gets the database meta data or creates a new database if not found.
     * @param client The DocumentClient.
     * @param databaseId The database id.
     */
    public static async getOrCreateDatabase(client: DocumentClient, databaseId: string): Promise<DatabaseMeta> {
        const querySpec: SqlQuerySpec = {
            parameters: [{
                name: '@id',
                value: databaseId,
            }],
            query: 'SELECT * FROM root r WHERE r.id= @id',
        };
        return new Promise<DatabaseMeta>((resolve, reject) => {
            client.queryDatabases(querySpec).toArray((queryErr: QueryError, results: DatabaseMeta[]) => {
                if (queryErr) {
                    reject(queryErr);
                } else {
                    if (results.length === 0) {
                        const databaseSpec: UniqueId = {
                            id: databaseId,
                        };
                        client.createDatabase(databaseSpec, (createErr: QueryError, result: DatabaseMeta) => {
                            if (createErr) {
                                reject(createErr);
                            } else {
                                resolve(result);
                            }
                        });
                    } else {
                        resolve(results[0]);
                    }
                }
            });
        });
    }

    /**
     * Gets the collection meta data or creates a new collection if not found for the given database link.
     * @param client The DocumentClient.
     * @param databaseLink The link to the database.
     * @param collectionId The collection id.
     */
    public static async getOrCreateCollection(client: DocumentClient, databaseLink: string, collectionId: string): Promise<CollectionMeta> {
        const querySpec: SqlQuerySpec = {
            parameters: [{
                name: '@id',
                value: collectionId,
            }],
            query: 'SELECT * FROM root r WHERE r.id=@id',
        };
        return new Promise<CollectionMeta>((resolve, reject) => {
            client.queryCollections(databaseLink, querySpec).toArray((queryErr: QueryError, results: CollectionMeta[]) => {
                if (queryErr) {
                    reject(queryErr);
                } else {
                    if (results.length === 0) {
                        const collectionSpec: Collection = {
                            id: collectionId,
                        };
                        const options: RequestOptions = {
                            offerThroughput: DATABASE_COLLECTION_THROUGHPUT,
                        };
                        client.createCollection(databaseLink, collectionSpec, options, (createErr: QueryError, result: CollectionMeta) => {
                            if (createErr) {
                                reject(createErr);
                            } else {
                                resolve(result);
                            }
                        });
                    } else {
                        resolve(results[0]);
                    }
                }
            });
        });
    }

    /**
     * Gets the 'bulkDelete' stored procedure meta data or creates a new 'bulkDelete' stored procedure if not found for the given collection link.
     * @param client The DocumentClient.
     * @param collectionLink The collection link.
     */
    public static async getOrCreateBulkDeleteStoredProcedure(client: DocumentClient, collectionLink: string): Promise<ProcedureMeta> {
        const querySpec: SqlQuerySpec = {
            parameters: [{
                name: '@id',
                value: bulkDeleteProc.id,
            }],
            query: 'SELECT * FROM root r WHERE r.id=@id',
        };

        return new Promise<ProcedureMeta>((resolve, reject) => {
            client.queryStoredProcedures(collectionLink, querySpec).toArray((queryErr: QueryError, resources: ProcedureMeta[]) => {
                if (queryErr) {
                    reject(queryErr);
                } else {
                    if (resources.length === 0) {
                        client.createStoredProcedure(collectionLink, bulkDeleteProc, (err: QueryError, result: ProcedureMeta) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result);
                            }
                        });
                    } else {
                        resolve(resources[0]);
                    }
                }
            });
        });
    }
}
