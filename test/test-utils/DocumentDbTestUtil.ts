import { UriFactory, DocumentClient } from 'documentdb';
import { DATABASE_ID, DATABASE_URL, DATABASE_MASTER_KEY } from '../../src/common/config';

/**
 * Util for document db usage in the tests.
 */
export class DocumentDbTestUtil {
    public static async deleteTestDatabase(): Promise<void> {
        const documentClient = new DocumentClient(DATABASE_URL, { masterKey: DATABASE_MASTER_KEY });
        return new Promise<void>((res, rej) => {
            documentClient.deleteDatabase(UriFactory.createDatabaseUri(DATABASE_ID), (err) => {
                err ? rej(err) : res();
            });
        });
    }
}
