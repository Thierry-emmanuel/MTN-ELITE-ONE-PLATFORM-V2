import {
  BadRequestException, ConflictException, ForbiddenException,
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import {
  LEGACY_ROLE_PERMISSIONS, allPermissions, checkPermission,
} from './permission.catalog';

const CACHE_TTL_MS = 30_000;

/**
 * RolesService — CRUD + clone + archive + versioning for runtime roles,
 * and the resolver that turns a user's role keys into an effective
 * permission set (with a 30s in-memory cache; every mutation invalidates).
 */
@Injectable()
export class RolesService {
  /** roleKeysHash → { at, permissions, fieldDeny } */
  private cache = new Map<string, { at: number; permissions: string[]; fieldDeny: Record<string, string[]> }>();

  constructor(@InjectRepository(Role) private readonly repo: Repository<Role>) {}

  private invalidate() { this.cache.clear(); }

  // ── CRUD ─────────────────────────────────────────────────────────
  findAll(includeArchived = false) {
    return this.repo.find({
      where: includeArchived ? {} : { status: 'active' },
      order: { isSystem: 'DESC', name: 'ASC' },
    });
  }

  async findByKey(key: string) {
    // Accepts the stable key ("journalist") or the uuid — the generic
    // frontend EntityCrudEngine addresses records by id.
    const role = await this.repo.findOne(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)
        ? { where: { id: key } }
        : { where: { key } },
    );
    if (!role) throw new NotFoundException(`Rôle "${key}" introuvable`);
    return role;
  }

  private validatePermissions(perms: string[]) {
    const valid = new Set([...allPermissions(), '*']);
    for (const p of perms) {
      const base = p.endsWith(':own') ? p.slice(0, -4) : p;
      if (base === '*' || base.endsWith('.*') || valid.has(base)) continue;
      throw new BadRequestException(`Permission inconnue: "${p}"`);
    }
  }

  async create(dto: Partial<Role>) {
    if (!dto.key || !dto.name) throw new BadRequestException('key et name sont requis');
    const key = dto.key.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
    if (await this.repo.findOne({ where: { key } }))
      throw new ConflictException(`Le rôle "${key}" existe déjà`);
    this.validatePermissions(dto.permissions ?? []);
    const role = this.repo.create({
      key,
      name: dto.name,
      description: dto.description ?? null,
      permissions: dto.permissions ?? [],
      fieldPolicies: dto.fieldPolicies ?? {},
      isDefault: !!dto.isDefault,
      clonedFromKey: dto.clonedFromKey ?? null,
    });
    if (role.isDefault) await this.clearDefault();
    const saved = await this.repo.save(role);
    this.invalidate();
    return saved;
  }

  async update(key: string, dto: Partial<Role>) {
    const role = await this.findByKey(key);
    if (dto.permissions) this.validatePermissions(dto.permissions);

    const permissionsChanged =
      (dto.permissions && JSON.stringify(dto.permissions) !== JSON.stringify(role.permissions)) ||
      (dto.fieldPolicies && JSON.stringify(dto.fieldPolicies) !== JSON.stringify(role.fieldPolicies));

    Object.assign(role, {
      name: dto.name ?? role.name,
      description: dto.description !== undefined ? dto.description : role.description,
      permissions: dto.permissions ?? role.permissions,
      fieldPolicies: dto.fieldPolicies ?? role.fieldPolicies,
    });
    if (permissionsChanged) role.version += 1;

    if (dto.isDefault === true && !role.isDefault) {
      await this.clearDefault();
      role.isDefault = true;
    } else if (dto.isDefault === false) {
      role.isDefault = false;
    }

    const saved = await this.repo.save(role);
    this.invalidate();
    return saved;
  }

  async clone(key: string, newKey: string, newName?: string) {
    const source = await this.findByKey(key);
    return this.create({
      key: newKey,
      name: newName ?? `${source.name} (copie)`,
      description: source.description,
      permissions: [...source.permissions],
      fieldPolicies: JSON.parse(JSON.stringify(source.fieldPolicies)),
      clonedFromKey: source.key,
    });
  }

  async archive(key: string) {
    const role = await this.findByKey(key);
    if (role.isSystem) throw new ForbiddenException('Les rôles système ne peuvent pas être archivés');
    role.status = 'archived';
    role.isDefault = false;
    const saved = await this.repo.save(role);
    this.invalidate();
    return saved;
  }

  async restore(key: string) {
    const role = await this.findByKey(key);
    role.status = 'active';
    const saved = await this.repo.save(role);
    this.invalidate();
    return saved;
  }

  async remove(key: string) {
    const role = await this.findByKey(key);
    if (role.isSystem) throw new ForbiddenException('Les rôles système ne peuvent pas être supprimés');
    await this.repo.remove(role);
    this.invalidate();
    return { message: `Rôle "${key}" supprimé` };
  }

  private async clearDefault() {
    await this.repo.update({ isDefault: true }, { isDefault: false });
  }

  async getDefaultKey(): Promise<string | null> {
    const def = await this.repo.findOne({ where: { isDefault: true, status: 'active' } });
    return def?.key ?? null;
  }

  // ── Effective permission resolution ──────────────────────────────
  /**
   * Union of the permissions of every role key the user carries.
   * Unknown keys fall back to the legacy enum mapping so pre-IAM
   * accounts (role = 'admin' | 'editor' | 'user') keep working.
   */
  async resolve(roleKeys: string[]): Promise<{ permissions: string[]; fieldDeny: Record<string, string[]> }> {
    const keys = [...new Set(roleKeys)].sort();
    const hash = keys.join('|') || '∅';
    const hit = this.cache.get(hash);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit;

    const roles = keys.length
      ? await this.repo.find({ where: { key: In(keys), status: 'active' } })
      : [];
    const found = new Set(roles.map((r) => r.key));

    const permissions = new Set<string>();
    const fieldDeny: Record<string, Set<string>> = {};

    for (const r of roles) {
      r.permissions.forEach((p) => permissions.add(p));
      for (const [entity, policy] of Object.entries(r.fieldPolicies ?? {})) {
        fieldDeny[entity] ??= new Set();
        (policy.deny ?? []).forEach((f) => fieldDeny[entity].add(f));
      }
    }
    // Legacy fallback for keys with no DB role (pre-migration tokens)
    for (const k of keys) {
      if (!found.has(k) && LEGACY_ROLE_PERMISSIONS[k])
        LEGACY_ROLE_PERMISSIONS[k].forEach((p) => permissions.add(p));
    }

    const value = {
      at: Date.now(),
      permissions: [...permissions],
      fieldDeny: Object.fromEntries(Object.entries(fieldDeny).map(([k, v]) => [k, [...v]])),
    };
    this.cache.set(hash, value);
    return value;
  }

  /** Convenience for guards/services. */
  async can(roleKeys: string[], required: string): Promise<'yes' | 'own' | 'no'> {
    const { permissions } = await this.resolve(roleKeys);
    return checkPermission(permissions, required);
  }

  /**
   * Field-level enforcement helper — strips fields denied for this user on
   * this entity from a write payload. Services call it before persisting:
   *   dto = await roles.stripDeniedFields(req.user.roleKeys, 'articles', dto)
   */
  async stripDeniedFields<T extends Record<string, unknown>>(
    roleKeys: string[], entity: string, payload: T,
  ): Promise<T> {
    const { permissions, fieldDeny } = await this.resolve(roleKeys);
    if (permissions.includes('*')) return payload; // full admins bypass field policies
    const denied = new Set(fieldDeny[entity] ?? []);
    if (denied.size === 0) return payload;
    return Object.fromEntries(
      Object.entries(payload).filter(([k]) => !denied.has(k)),
    ) as T;
  }
}
