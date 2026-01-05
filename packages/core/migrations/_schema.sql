\restrict 6p0uFLPDvX3hvBab9QrUcHekaM2gBuJkgbf0WfOc7yjEIM0Ft4f0gBLdMUvb8Zp

CREATE SCHEMA atlas_schema_revisions;

CREATE SCHEMA auth;

CREATE TABLE public.account (
    id text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE public.effect_sql_migrations (
    migration_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL
);

CREATE TABLE public.frameworks (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deleted_at timestamp without time zone,
    created_by character varying(255) NOT NULL,
    updated_by character varying(255) NOT NULL,
    deleted_by character varying(255),
    organization_id character varying(255) NOT NULL
);

CREATE TABLE public.invitation (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    email text NOT NULL,
    role text,
    status text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "inviterId" text NOT NULL
);

CREATE TABLE public.member (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "userId" text NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);

CREATE TABLE public.organization (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    "createdAt" timestamp with time zone NOT NULL,
    metadata text
);

CREATE TABLE public.session (
    id text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL,
    "activeOrganizationId" text
);

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.effect_sql_migrations
    ADD CONSTRAINT effect_sql_migrations_pkey PRIMARY KEY (migration_id);

ALTER TABLE ONLY public.frameworks
    ADD CONSTRAINT frameworks_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_token_key UNIQUE (token);

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);

CREATE INDEX "account_userId_idx" ON public.account USING btree ("userId");

CREATE INDEX invitation_email_idx ON public.invitation USING btree (email);

CREATE INDEX "invitation_organizationId_idx" ON public.invitation USING btree ("organizationId");

CREATE INDEX "member_organizationId_idx" ON public.member USING btree ("organizationId");

CREATE INDEX "member_userId_idx" ON public.member USING btree ("userId");

CREATE UNIQUE INDEX organization_slug_uidx ON public.organization USING btree (slug);

CREATE INDEX "session_userId_idx" ON public.session USING btree ("userId");

CREATE INDEX verification_identifier_idx ON public.verification USING btree (identifier);

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organization(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.member
    ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organization(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.member
    ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;

\unrestrict 6p0uFLPDvX3hvBab9QrUcHekaM2gBuJkgbf0WfOc7yjEIM0Ft4f0gBLdMUvb8Zp

\restrict UNXD6Sd0CageXzemLkENj15igP78f6kNIJ74pjfvvkQYzylBBxeOUmmtU91x4sy

INSERT INTO public.effect_sql_migrations (migration_id, created_at, name) VALUES (1, '2026-01-05 21:02:22.472001+00', 'add_framework');

\unrestrict UNXD6Sd0CageXzemLkENj15igP78f6kNIJ74pjfvvkQYzylBBxeOUmmtU91x4sy