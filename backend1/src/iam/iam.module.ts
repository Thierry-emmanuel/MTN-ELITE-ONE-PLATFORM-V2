import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Organization } from './entities/organization.entity';
import { UserSession } from './entities/user-session.entity';
import { AuditLog } from './entities/audit-log.entity';
import { IamConfig } from './entities/iam-config.entity';
import { RolesService } from './roles.service';
import { OrganizationsService } from './organizations.service';
import { SessionsService } from './sessions.service';
import { AuditService } from './audit.service';
import { IamConfigService } from './iam-config.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { IamController } from './iam.controller';

/**
 * IamModule — Enterprise Identity & Access Management (Sprint 1).
 * @Global so PermissionsGuard / RolesService / AuditService are injectable
 * from every domain module without import ceremony — the same reason
 * ConfigModule is global.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Role, Organization, UserSession, AuditLog, IamConfig])],
  providers: [RolesService, OrganizationsService, SessionsService, AuditService, IamConfigService, PermissionsGuard],
  controllers: [IamController],
  exports: [RolesService, OrganizationsService, SessionsService, AuditService, IamConfigService, PermissionsGuard],
})
export class IamModule {}
