import { RolesBuilder } from 'nest-access-control';
import { Role } from './enums';

export const RBAC_POLICY: RolesBuilder = new RolesBuilder();

// prettier-ignore
RBAC_POLICY
    .grant(Role.USER)
        .readOwn('userData')
    .grant(Role.ADMIN)
        .extend(Role.USER)
        .read('userData')
        .update('userData')
        .delete('userData');
