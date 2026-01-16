\restrict lhp10Ec2aV6rs8jn1wz8EqtyqfF1YNctnUMJX4QNazAKcwe6hQzuTpWNU0AQUdG

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

CREATE TABLE public.control (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    framework_id character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'draft'::character varying NOT NULL,
    testing_frequency character varying(50),
    org_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by character varying(255) DEFAULT 'system'::character varying NOT NULL,
    updated_by character varying(255) DEFAULT 'system'::character varying NOT NULL,
    deleted_by character varying(255),
    hash character varying(255) DEFAULT 'system'::character varying NOT NULL
);

CREATE TABLE public.document (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    url character varying(500) NOT NULL,
    size bigint,
    framework_id character varying(255),
    control_id character varying(255),
    org_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by character varying(255) DEFAULT 'system'::character varying NOT NULL,
    updated_by character varying(255) DEFAULT 'system'::character varying NOT NULL,
    deleted_by character varying(255),
    hash character varying(255) DEFAULT 'system'::character varying NOT NULL
);

CREATE TABLE public.effect_sql_migrations (
    migration_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL
);

CREATE TABLE public.framework (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    version character varying(50),
    status character varying(50) DEFAULT 'draft'::character varying NOT NULL,
    org_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by character varying(255) DEFAULT 'system'::character varying NOT NULL,
    updated_by character varying(255) DEFAULT 'system'::character varying NOT NULL,
    deleted_by character varying(255),
    hash character varying(255) DEFAULT 'system'::character varying NOT NULL
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

ALTER TABLE ONLY public.control
    ADD CONSTRAINT control_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.effect_sql_migrations
    ADD CONSTRAINT effect_sql_migrations_pkey PRIMARY KEY (migration_id);

ALTER TABLE ONLY public.framework
    ADD CONSTRAINT framework_pkey PRIMARY KEY (id);

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

ALTER TABLE ONLY public.control
    ADD CONSTRAINT control_framework_id_fkey FOREIGN KEY (framework_id) REFERENCES public.framework(id);

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_control_id_fkey FOREIGN KEY (control_id) REFERENCES public.control(id);

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_framework_id_fkey FOREIGN KEY (framework_id) REFERENCES public.framework(id);

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

\unrestrict lhp10Ec2aV6rs8jn1wz8EqtyqfF1YNctnUMJX4QNazAKcwe6hQzuTpWNU0AQUdG

\restrict kXxa5UcK6ij5ObRDIixhXwyeDGuBmlv2xGlyZkYcvEFy4aZT219k4LhUN11aBcA

INSERT INTO public.effect_sql_migrations (migration_id, created_at, name) VALUES (1, '2026-01-16 22:03:00.283918+00', 'init');

\unrestrict kXxa5UcK6ij5ObRDIixhXwyeDGuBmlv2xGlyZkYcvEFy4aZT219k4LhUN11aBcA