import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Sprint 1 — Enterprise Identity & Access Management foundation.
 *
 * Creates:
 *   iam_roles          runtime permission bundles (Role Builder)
 *   iam_organizations  federation → departments/committees/leagues → teams
 *   iam_user_sessions  refresh tokens (hashed), device management
 *   iam_audit_logs     append-only action trail
 *   iam_config         menus / workspaces / feature flags (jsonb store)
 *
 * Extends users with lifecycle status, IAM role keys, organization link and
 * forced password change — WITHOUT touching the legacy `role` enum, so every
 * existing account and token keeps working.
 *
 * Seeds the three system roles mirroring the legacy enum.
 */
export class IamFoundation1784206000000 implements MigrationInterface {
    name = 'IamFoundation1784206000000';

    public async up(q: QueryRunner): Promise<void> {
        await q.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // ── iam_roles ────────────────────────────────────────────────
        await q.query(`
            CREATE TABLE "iam_roles" (
                "id"              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "key"             varchar(64)  NOT NULL,
                "name"            varchar(120) NOT NULL,
                "description"     text,
                "permissions"     jsonb NOT NULL DEFAULT '[]',
                "field_policies"  jsonb NOT NULL DEFAULT '{}',
                "is_system"       boolean NOT NULL DEFAULT false,
                "is_default"      boolean NOT NULL DEFAULT false,
                "status"          varchar(16) NOT NULL DEFAULT 'active',
                "version"         integer NOT NULL DEFAULT 1,
                "cloned_from_key" varchar(64),
                "created_at"      timestamp NOT NULL DEFAULT now(),
                "updated_at"      timestamp NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_iam_roles_key" UNIQUE ("key")
            )`);

        // ── iam_organizations ────────────────────────────────────────
        await q.query(`
            CREATE TABLE "iam_organizations" (
                "id"          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name"        varchar(160) NOT NULL,
                "type"        varchar(24)  NOT NULL,
                "parent_id"   uuid,
                "club_id"     varchar(64),
                "status"      varchar(16) NOT NULL DEFAULT 'active',
                "description" text,
                "created_at"  timestamp NOT NULL DEFAULT now(),
                "updated_at"  timestamp NOT NULL DEFAULT now()
            )`);
        await q.query(`CREATE INDEX "IDX_iam_organizations_parent" ON "iam_organizations" ("parent_id")`);

        // ── iam_user_sessions ────────────────────────────────────────
        await q.query(`
            CREATE TABLE "iam_user_sessions" (
                "id"                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id"            integer NOT NULL,
                "refresh_token_hash" varchar(64) NOT NULL,
                "user_agent"         varchar(400),
                "ip"                 varchar(64),
                "expires_at"         timestamp NOT NULL,
                "last_used_at"       timestamp,
                "revoked_at"         timestamp,
                "created_at"         timestamp NOT NULL DEFAULT now()
            )`);
        await q.query(`CREATE INDEX "IDX_iam_sessions_user"  ON "iam_user_sessions" ("user_id")`);
        await q.query(`CREATE INDEX "IDX_iam_sessions_token" ON "iam_user_sessions" ("refresh_token_hash")`);

        // ── iam_audit_logs ───────────────────────────────────────────
        await q.query(`
            CREATE TABLE "iam_audit_logs" (
                "id"          BIGSERIAL PRIMARY KEY,
                "actor_id"    integer,
                "actor_email" varchar(160),
                "action"      varchar(80) NOT NULL,
                "target_type" varchar(64),
                "target_id"   varchar(64),
                "metadata"    jsonb,
                "ip"          varchar(64),
                "created_at"  timestamp NOT NULL DEFAULT now()
            )`);
        await q.query(`CREATE INDEX "IDX_iam_audit_actor"   ON "iam_audit_logs" ("actor_id")`);
        await q.query(`CREATE INDEX "IDX_iam_audit_action"  ON "iam_audit_logs" ("action")`);
        await q.query(`CREATE INDEX "IDX_iam_audit_target"  ON "iam_audit_logs" ("target_type")`);
        await q.query(`CREATE INDEX "IDX_iam_audit_created" ON "iam_audit_logs" ("created_at")`);

        // ── iam_config ───────────────────────────────────────────────
        await q.query(`
            CREATE TABLE "iam_config" (
                "key"        varchar(120) PRIMARY KEY,
                "value"      jsonb NOT NULL DEFAULT '{}',
                "updated_by" integer,
                "updated_at" timestamp NOT NULL DEFAULT now()
            )`);

        // ── users extensions ─────────────────────────────────────────
        await q.query(`ALTER TABLE "users" ADD COLUMN "status" varchar(16) NOT NULL DEFAULT 'active'`);
        await q.query(`ALTER TABLE "users" ADD COLUMN "role_keys" jsonb NOT NULL DEFAULT '[]'`);
        await q.query(`ALTER TABLE "users" ADD COLUMN "organization_id" uuid`);
        await q.query(`ALTER TABLE "users" ADD COLUMN "must_change_password" boolean NOT NULL DEFAULT false`);
        // backfill: every account gets its legacy enum role as first IAM role key
        await q.query(`UPDATE "users" SET "role_keys" = to_jsonb(ARRAY["role"::text])`);
        await q.query(`UPDATE "users" SET "status" = 'suspended' WHERE "is_active" = false`);

        // ── seed system roles (mirror of the legacy enum) ────────────
        await q.query(`
            INSERT INTO "iam_roles" ("key","name","description","permissions","is_system","is_default") VALUES
            ('admin',  'Administrateur', 'Accès complet à la plateforme', '["*"]', true, false),
            ('editor', 'Éditeur',        'Journaliste / créateur de contenu',
             '["articles.view","articles.create","articles.update:own","articles.delete:own","articles.publish:own","media.view","media.create","media.import","uploads.create","matches.view","players.view","clubs.view","standings.view","awards.view","hall-of-fame.view","big-moments.view"]',
             true, false),
            ('user',   'Utilisateur',    'Compte public — aucune permission studio', '[]', true, true)
        `);
    }

    public async down(q: QueryRunner): Promise<void> {
        await q.query(`ALTER TABLE "users" DROP COLUMN "must_change_password"`);
        await q.query(`ALTER TABLE "users" DROP COLUMN "organization_id"`);
        await q.query(`ALTER TABLE "users" DROP COLUMN "role_keys"`);
        await q.query(`ALTER TABLE "users" DROP COLUMN "status"`);
        await q.query(`DROP TABLE "iam_config"`);
        await q.query(`DROP TABLE "iam_audit_logs"`);
        await q.query(`DROP TABLE "iam_user_sessions"`);
        await q.query(`DROP TABLE "iam_organizations"`);
        await q.query(`DROP TABLE "iam_roles"`);
    }
}
