import { BaseCRUDRepository } from './common/BaseCRUDRepository';
import { IVehicleEntity, VehicleEntity } from './entities/VehicleEntity';

/**
 * The vehicle repository. CRUD operations and more on the VehicleEntity in the documentdb.
 */
class VehicleRepository extends BaseCRUDRepository<IVehicleEntity> {
    constructor() {
        super('vehicles', VehicleEntity);
    }
}

export default new VehicleRepository();
