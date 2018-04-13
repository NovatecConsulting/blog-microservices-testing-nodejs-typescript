import { Procedure } from 'documentdb';
import { bulkDeleteAll } from './bulkDeleteAll';

export const bulkDeleteProc: Procedure = {
    id: 'bulkDelete',
    serverScript: bulkDeleteAll,
};

/**
 * The object that will be returned by the stored procedure
 */
export interface IBulkDeleteResponseBody {
    deleted: number;
    continuation: boolean;
}
