--
-- PostgreSQL database dump
--

\restrict wUpBYmSXTex5Txjc7y1fMTCUd35ymevoQOdRgWfKwskcojj2l3nnX1rOrSxK9x6

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_regional_association_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.regional_associations DROP CONSTRAINT IF EXISTS regional_associations_logo_media_asset_id_fkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.media_assets DROP CONSTRAINT IF EXISTS media_assets_uploaded_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.homepage_hero_slides DROP CONSTRAINT IF EXISTS homepage_hero_slides_media_asset_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contact_messages DROP CONSTRAINT IF EXISTS contact_messages_processed_by_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.association_posts DROP CONSTRAINT IF EXISTS association_posts_regional_association_id_fkey;
ALTER TABLE IF EXISTS ONLY public.association_posts DROP CONSTRAINT IF EXISTS association_posts_cover_media_asset_id_fkey;
ALTER TABLE IF EXISTS ONLY public.association_media_items DROP CONSTRAINT IF EXISTS association_media_items_regional_association_id_fkey;
ALTER TABLE IF EXISTS ONLY public.association_media_items DROP CONSTRAINT IF EXISTS association_media_items_media_asset_id_fkey;
DROP INDEX IF EXISTS public.users_role_id_idx;
DROP INDEX IF EXISTS public.users_regional_association_id_idx;
DROP INDEX IF EXISTS public.users_is_active_idx;
DROP INDEX IF EXISTS public.users_deleted_at_idx;
DROP INDEX IF EXISTS public.regional_associations_status_idx;
DROP INDEX IF EXISTS public.regional_associations_region_idx;
DROP INDEX IF EXISTS public.regional_associations_featured_order_idx;
DROP INDEX IF EXISTS public.regional_associations_deleted_at_idx;
DROP INDEX IF EXISTS public.refresh_tokens_user_id_idx;
DROP INDEX IF EXISTS public.refresh_tokens_expires_at_idx;
DROP INDEX IF EXISTS public.media_assets_visibility_idx;
DROP INDEX IF EXISTS public.media_assets_uploaded_by_user_id_idx;
DROP INDEX IF EXISTS public.media_assets_status_idx;
DROP INDEX IF EXISTS public.media_assets_metadata_gin_idx;
DROP INDEX IF EXISTS public.media_assets_media_type_idx;
DROP INDEX IF EXISTS public.media_assets_deleted_at_idx;
DROP INDEX IF EXISTS public.media_assets_created_at_idx;
DROP INDEX IF EXISTS public.institutional_partners_order_idx;
DROP INDEX IF EXISTS public.institutional_missions_order_idx;
DROP INDEX IF EXISTS public.institutional_key_figures_order_idx;
DROP INDEX IF EXISTS public.institutional_documents_order_idx;
DROP INDEX IF EXISTS public.homepage_hero_slides_public_idx;
DROP INDEX IF EXISTS public.homepage_hero_slides_media_unique;
DROP INDEX IF EXISTS public.executive_members_order_idx;
DROP INDEX IF EXISTS public.contact_messages_status_idx;
DROP INDEX IF EXISTS public.contact_messages_created_at_idx;
DROP INDEX IF EXISTS public.audit_logs_user_id_idx;
DROP INDEX IF EXISTS public.audit_logs_entity_idx;
DROP INDEX IF EXISTS public.audit_logs_created_at_idx;
DROP INDEX IF EXISTS public.association_posts_type_status_idx;
DROP INDEX IF EXISTS public.association_posts_event_start_idx;
DROP INDEX IF EXISTS public.association_posts_deleted_at_idx;
DROP INDEX IF EXISTS public.association_posts_association_idx;
DROP INDEX IF EXISTS public.association_media_items_type_idx;
DROP INDEX IF EXISTS public.association_media_items_deleted_at_idx;
DROP INDEX IF EXISTS public.association_media_items_association_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_code_key;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.regional_associations DROP CONSTRAINT IF EXISTS regional_associations_slug_key;
ALTER TABLE IF EXISTS ONLY public.regional_associations DROP CONSTRAINT IF EXISTS regional_associations_pkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_hash_unique;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_code_key;
ALTER TABLE IF EXISTS ONLY public.media_assets DROP CONSTRAINT IF EXISTS media_assets_pkey;
ALTER TABLE IF EXISTS ONLY public.media_assets DROP CONSTRAINT IF EXISTS media_assets_bucket_object_unique;
ALTER TABLE IF EXISTS ONLY public.institutional_partners DROP CONSTRAINT IF EXISTS institutional_partners_pkey;
ALTER TABLE IF EXISTS ONLY public.institutional_missions DROP CONSTRAINT IF EXISTS institutional_missions_pkey;
ALTER TABLE IF EXISTS ONLY public.institutional_key_figures DROP CONSTRAINT IF EXISTS institutional_key_figures_pkey;
ALTER TABLE IF EXISTS ONLY public.institutional_documents DROP CONSTRAINT IF EXISTS institutional_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.institutional_contents DROP CONSTRAINT IF EXISTS institutional_contents_slug_key;
ALTER TABLE IF EXISTS ONLY public.institutional_contents DROP CONSTRAINT IF EXISTS institutional_contents_pkey;
ALTER TABLE IF EXISTS ONLY public.homepage_hero_slides DROP CONSTRAINT IF EXISTS homepage_hero_slides_pkey;
ALTER TABLE IF EXISTS ONLY public.executive_members DROP CONSTRAINT IF EXISTS executive_members_pkey;
ALTER TABLE IF EXISTS ONLY public.contact_messages DROP CONSTRAINT IF EXISTS contact_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.association_posts DROP CONSTRAINT IF EXISTS association_posts_slug_unique;
ALTER TABLE IF EXISTS ONLY public.association_posts DROP CONSTRAINT IF EXISTS association_posts_pkey;
ALTER TABLE IF EXISTS ONLY public.association_media_items DROP CONSTRAINT IF EXISTS association_media_items_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.regional_associations;
DROP TABLE IF EXISTS public.refresh_tokens;
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.media_assets;
DROP TABLE IF EXISTS public.institutional_partners;
DROP TABLE IF EXISTS public.institutional_missions;
DROP TABLE IF EXISTS public.institutional_key_figures;
DROP TABLE IF EXISTS public.institutional_documents;
DROP TABLE IF EXISTS public.institutional_contents;
DROP TABLE IF EXISTS public.homepage_hero_slides;
DROP TABLE IF EXISTS public.executive_members;
DROP TABLE IF EXISTS public.contact_messages;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.association_posts;
DROP TABLE IF EXISTS public.association_media_items;
DROP EXTENSION IF EXISTS pgcrypto;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: association_media_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.association_media_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    regional_association_id uuid NOT NULL,
    media_asset_id uuid NOT NULL,
    media_type character varying(30) NOT NULL,
    title character varying(255),
    caption text,
    display_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT association_media_items_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['PHOTO'::character varying, 'VIDEO'::character varying])::text[])))
);


--
-- Name: association_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.association_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    regional_association_id uuid NOT NULL,
    content_type character varying(30) NOT NULL,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(180) NOT NULL,
    excerpt text,
    body text,
    cover_media_asset_id uuid,
    event_start_at timestamp with time zone,
    event_end_at timestamp with time zone,
    event_location character varying(255),
    display_order integer DEFAULT 0 NOT NULL,
    seo_title character varying(255),
    seo_description character varying(320),
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT association_posts_content_type_check CHECK (((content_type)::text = ANY ((ARRAY['ACTUALITY'::character varying, 'EVENT'::character varying])::text[]))),
    CONSTRAINT association_posts_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SUBMITTED'::character varying, 'PUBLISHED'::character varying, 'ARCHIVED'::character varying])::text[])))
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id uuid,
    description text,
    metadata jsonb,
    ip_address character varying(64),
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(180) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    subject character varying(255) NOT NULL,
    message text NOT NULL,
    status character varying(30) DEFAULT 'NEW'::character varying NOT NULL,
    processed_by_user_id uuid,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contact_messages_status_check CHECK (((status)::text = ANY ((ARRAY['NEW'::character varying, 'IN_PROGRESS'::character varying, 'PROCESSED'::character varying, 'ARCHIVED'::character varying])::text[])))
);


--
-- Name: executive_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.executive_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(180) NOT NULL,
    "position" character varying(180) NOT NULL,
    biography text,
    image_url text,
    linkedin_url text,
    display_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: homepage_hero_slides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homepage_hero_slides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    media_asset_id uuid NOT NULL,
    title character varying(180),
    alt_text character varying(255) NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT now() NOT NULL,
    CONSTRAINT homepage_hero_slides_display_order_check CHECK ((display_order >= 0))
);


--
-- Name: institutional_contents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institutional_contents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug character varying(100) DEFAULT 'home'::character varying NOT NULL,
    hero_eyebrow character varying(180),
    hero_title character varying(255) NOT NULL,
    hero_subtitle text,
    hero_primary_cta_label character varying(120),
    hero_primary_cta_url character varying(255),
    hero_secondary_cta_label character varying(120),
    hero_secondary_cta_url character varying(255),
    federation_eyebrow character varying(180),
    federation_title character varying(255),
    federation_body text,
    missions_eyebrow character varying(180),
    missions_title character varying(255),
    missions_body text,
    governance_eyebrow character varying(180),
    governance_title character varying(255),
    governance_body text,
    executive_office_eyebrow character varying(180),
    executive_office_title character varying(255),
    executive_office_body text,
    partners_eyebrow character varying(180),
    partners_title character varying(255),
    partners_body text,
    documents_eyebrow character varying(180),
    documents_title character varying(255),
    documents_body text,
    contact_eyebrow character varying(180),
    contact_title character varying(255),
    contact_body text,
    contact_email character varying(255),
    contact_phone character varying(50),
    contact_address text,
    seo_title character varying(255),
    seo_description character varying(320),
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: institutional_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institutional_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    document_type character varying(80),
    file_url text NOT NULL,
    file_size_label character varying(50),
    publication_date date,
    display_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: institutional_key_figures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institutional_key_figures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    value character varying(80) NOT NULL,
    label character varying(180) NOT NULL,
    description text,
    display_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: institutional_missions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institutional_missions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(180) NOT NULL,
    description text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: institutional_partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institutional_partners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(180) NOT NULL,
    description text,
    logo_url text,
    website_url text,
    display_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: media_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    uploaded_by_user_id uuid,
    storage_provider character varying(30) DEFAULT 'S3'::character varying NOT NULL,
    bucket_name character varying(100) NOT NULL,
    object_key text NOT NULL,
    original_filename text NOT NULL,
    stored_filename text NOT NULL,
    file_extension character varying(20),
    mime_type character varying(150) NOT NULL,
    media_type character varying(30) NOT NULL,
    visibility character varying(20) DEFAULT 'PRIVATE'::character varying NOT NULL,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    size_bytes bigint NOT NULL,
    checksum_sha256 character varying(64),
    width integer,
    height integer,
    duration_seconds numeric(12,3),
    title character varying(255),
    alt_text character varying(255),
    caption text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    validated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT media_assets_duration_check CHECK (((duration_seconds IS NULL) OR (duration_seconds >= (0)::numeric))),
    CONSTRAINT media_assets_height_check CHECK (((height IS NULL) OR (height > 0))),
    CONSTRAINT media_assets_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['IMAGE'::character varying, 'VIDEO'::character varying, 'DOCUMENT'::character varying, 'AUDIO'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT media_assets_size_bytes_check CHECK ((size_bytes >= 0)),
    CONSTRAINT media_assets_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'UPLOADED'::character varying, 'VALIDATED'::character varying, 'REJECTED'::character varying, 'PUBLISHED'::character varying, 'ARCHIVED'::character varying, 'DELETED'::character varying])::text[]))),
    CONSTRAINT media_assets_storage_provider_check CHECK (((storage_provider)::text = ANY ((ARRAY['S3'::character varying, 'MINIO'::character varying])::text[]))),
    CONSTRAINT media_assets_visibility_check CHECK (((visibility)::text = ANY ((ARRAY['PUBLIC'::character varying, 'PRIVATE'::character varying])::text[]))),
    CONSTRAINT media_assets_width_check CHECK (((width IS NULL) OR (width > 0)))
);


--
-- Name: TABLE media_assets; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.media_assets IS 'MÃ©tadonnÃ©es des images, vidÃ©os, documents et autres fichiers stockÃ©s dans MinIO ou S3.';


--
-- Name: COLUMN media_assets.object_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media_assets.object_key IS 'Chemin unique de lâ€™objet dans le bucket S3.';


--
-- Name: COLUMN media_assets.checksum_sha256; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media_assets.checksum_sha256 IS 'Empreinte SHA-256 permettant de contrÃ´ler lâ€™intÃ©gritÃ© et les doublons.';


--
-- Name: COLUMN media_assets.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media_assets.metadata IS 'MÃ©tadonnÃ©es complÃ©mentaires propres au type de fichier.';


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    ip_address character varying(64),
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: regional_associations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regional_associations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(180) NOT NULL,
    acronym character varying(40),
    region character varying(180) NOT NULL,
    city character varying(180),
    member_count integer,
    affiliated_since_year integer,
    logo_media_asset_id uuid,
    logo_text character varying(12),
    presentation text,
    address text,
    phone character varying(50),
    email character varying(255),
    website_url text,
    facebook_url text,
    instagram_url text,
    linkedin_url text,
    youtube_url text,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    seo_title character varying(255),
    seo_description character varying(320),
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    cover_image_url text,
    CONSTRAINT regional_associations_affiliated_since_year_check CHECK (((affiliated_since_year IS NULL) OR ((affiliated_since_year >= 1900) AND (affiliated_since_year <= 2100)))),
    CONSTRAINT regional_associations_member_count_check CHECK (((member_count IS NULL) OR (member_count >= 0))),
    CONSTRAINT regional_associations_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SUBMITTED'::character varying, 'PUBLISHED'::character varying, 'ARCHIVED'::character varying])::text[])))
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone character varying(30),
    is_active boolean DEFAULT true NOT NULL,
    is_email_verified boolean DEFAULT false NOT NULL,
    last_login_at timestamp with time zone,
    password_changed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    regional_association_id uuid
);


--
-- Data for Name: association_media_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.association_media_items (id, regional_association_id, media_asset_id, media_type, title, caption, display_order, is_published, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: association_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.association_posts (id, regional_association_id, content_type, status, title, slug, excerpt, body, cover_media_asset_id, event_start_at, event_end_at, event_location, display_order, seo_title, seo_description, published_at, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, description, metadata, ip_address, user_agent, created_at) FROM stdin;
41b17f0b-c748-4a1f-a7fd-b4ddaf0689a0	747a00a5-ead3-44a7-9e29-08fc92495400	AUTH_LOGIN_SUCCESS	USER	747a00a5-ead3-44a7-9e29-08fc92495400	Connexion réussie.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-08 18:26:52.304+01
f7eb2bb4-57bf-44fd-bca3-8b2459647d08	747a00a5-ead3-44a7-9e29-08fc92495400	AUTH_LOGOUT	USER	747a00a5-ead3-44a7-9e29-08fc92495400	Déconnexion.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-08 18:49:12.632+01
286e4c63-d016-4985-be80-4d36c2fea41a	747a00a5-ead3-44a7-9e29-08fc92495400	AUTH_LOGIN_SUCCESS	USER	747a00a5-ead3-44a7-9e29-08fc92495400	Connexion réussie.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-08 18:49:32.038+01
98b0cd3b-e785-4921-84f0-d7c9b645e0d5	747a00a5-ead3-44a7-9e29-08fc92495400	AUTH_LOGIN_SUCCESS	USER	747a00a5-ead3-44a7-9e29-08fc92495400	Connexion réussie.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 16:04:30.519+01
5906e0bf-2418-42d2-a8d2-4743bb072170	747a00a5-ead3-44a7-9e29-08fc92495400	ASSOCIATION_ADMIN_ACCOUNT_CREATED	USER	5f3b3829-26c0-4142-8ea2-668bc12184b7	Création du compte administrateur association.	\N	\N	\N	2026-07-09 17:31:21.907+01
ddca18e7-3d23-4bb0-8970-fceb13492f6a	747a00a5-ead3-44a7-9e29-08fc92495400	ASSOCIATION_CREATED	REGIONAL_ASSOCIATION	8978f6f3-47a6-49e2-b46a-d09e61b5aa2c	Création de l’association asso test.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 17:31:21.91+01
c4cd1b22-a99a-4a11-a658-13c655710692	747a00a5-ead3-44a7-9e29-08fc92495400	ASSOCIATION_STATUS_UPDATED	REGIONAL_ASSOCIATION	8978f6f3-47a6-49e2-b46a-d09e61b5aa2c	Statut association modifié : PUBLISHED.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 17:31:30.665+01
0db1677f-8d05-4537-9505-ec43aba8a6d1	747a00a5-ead3-44a7-9e29-08fc92495400	ASSOCIATION_ADMIN_ACCOUNT_UPDATED	USER	5f3b3829-26c0-4142-8ea2-668bc12184b7	Modification du compte administrateur association.	\N	\N	\N	2026-07-09 17:31:33.113+01
94d60df5-c691-495c-9226-c3b9f31ef9b5	747a00a5-ead3-44a7-9e29-08fc92495400	ASSOCIATION_UPDATED	REGIONAL_ASSOCIATION	8978f6f3-47a6-49e2-b46a-d09e61b5aa2c	Mise à jour de l’association asso test.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 17:31:33.114+01
d0d55a02-5499-479a-bbc9-065b919f65ac	747a00a5-ead3-44a7-9e29-08fc92495400	ASSOCIATION_ADMIN_ACCOUNT_UPDATED	USER	5f3b3829-26c0-4142-8ea2-668bc12184b7	Modification du compte administrateur association.	\N	\N	\N	2026-07-09 17:31:37.094+01
ff4c4165-9258-4ccf-88aa-98ed71cf62e8	747a00a5-ead3-44a7-9e29-08fc92495400	ASSOCIATION_UPDATED	REGIONAL_ASSOCIATION	8978f6f3-47a6-49e2-b46a-d09e61b5aa2c	Mise à jour de l’association asso test.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 17:31:37.096+01
b8e6257f-fe6f-4562-ae43-bacae0fa7d2e	747a00a5-ead3-44a7-9e29-08fc92495400	AUTH_LOGOUT	USER	747a00a5-ead3-44a7-9e29-08fc92495400	Déconnexion.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 17:32:06.569+01
9e5872d2-f4f0-4f03-b6e0-51647116de83	5f3b3829-26c0-4142-8ea2-668bc12184b7	AUTH_LOGIN_SUCCESS	USER	5f3b3829-26c0-4142-8ea2-668bc12184b7	Connexion réussie.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 17:32:15.286+01
2c0146ef-2a6d-4b7c-85cf-51ea0c4a8ac8	5f3b3829-26c0-4142-8ea2-668bc12184b7	AUTH_LOGOUT	USER	5f3b3829-26c0-4142-8ea2-668bc12184b7	Déconnexion.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-11 14:34:02.114+01
c30922db-2715-4142-8934-eb5ebcdcbcd4	747a00a5-ead3-44a7-9e29-08fc92495400	AUTH_LOGIN_SUCCESS	USER	747a00a5-ead3-44a7-9e29-08fc92495400	Connexion réussie.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-11 14:34:20.931+01
56baebf9-9935-463c-bf10-5997e33af3e8	747a00a5-ead3-44a7-9e29-08fc92495400	ASSOCIATION_STATUS_UPDATED	REGIONAL_ASSOCIATION	8978f6f3-47a6-49e2-b46a-d09e61b5aa2c	Statut association modifié : PUBLISHED.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-11 14:34:27.602+01
6b45aa17-f685-4608-8bc3-576e8d69f681	747a00a5-ead3-44a7-9e29-08fc92495400	ASSOCIATION_ADMIN_ACCOUNT_UPDATED	USER	5f3b3829-26c0-4142-8ea2-668bc12184b7	Modification du compte administrateur association.	\N	\N	\N	2026-07-11 14:34:30.521+01
7a3c7af7-52cc-47c3-930f-6930f491665d	747a00a5-ead3-44a7-9e29-08fc92495400	ASSOCIATION_UPDATED	REGIONAL_ASSOCIATION	8978f6f3-47a6-49e2-b46a-d09e61b5aa2c	Mise à jour de l’association asso test.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-11 14:34:30.523+01
e827f135-0ce4-4f3b-af1a-6d35d3e4912c	747a00a5-ead3-44a7-9e29-08fc92495400	ASSOCIATION_ADMIN_ACCOUNT_UPDATED	USER	5f3b3829-26c0-4142-8ea2-668bc12184b7	Modification du compte administrateur association.	\N	\N	\N	2026-07-11 15:01:36.555+01
fffd2b7b-2633-4bb7-a522-6676b2c852e9	747a00a5-ead3-44a7-9e29-08fc92495400	ASSOCIATION_UPDATED	REGIONAL_ASSOCIATION	8978f6f3-47a6-49e2-b46a-d09e61b5aa2c	Mise à jour de l’association asso test.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-11 15:01:36.561+01
a88b0024-a993-4a40-99a8-c0d7a114bcb9	747a00a5-ead3-44a7-9e29-08fc92495400	AUTH_LOGIN_SUCCESS	USER	747a00a5-ead3-44a7-9e29-08fc92495400	Connexion réussie.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-12 09:55:28.758+01
45db1ae2-bb1c-41cf-84a6-32c545dafb01	747a00a5-ead3-44a7-9e29-08fc92495400	AUTH_LOGOUT	USER	747a00a5-ead3-44a7-9e29-08fc92495400	Déconnexion.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-12 12:03:47.733+01
7c299ac8-5a8d-45b3-9703-1fd16fb700cb	5f3b3829-26c0-4142-8ea2-668bc12184b7	AUTH_LOGIN_SUCCESS	USER	5f3b3829-26c0-4142-8ea2-668bc12184b7	Connexion réussie.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-12 12:04:04.305+01
0214d9d5-3266-4b20-a293-b208805c246c	5f3b3829-26c0-4142-8ea2-668bc12184b7	AUTH_LOGOUT	USER	5f3b3829-26c0-4142-8ea2-668bc12184b7	Déconnexion.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-12 12:15:46.465+01
345fa0dc-6a3e-4119-84f3-f9a3827de78f	747a00a5-ead3-44a7-9e29-08fc92495400	AUTH_LOGIN_SUCCESS	USER	747a00a5-ead3-44a7-9e29-08fc92495400	Connexion réussie.	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-12 12:16:02.297+01
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_messages (id, full_name, email, phone, subject, message, status, processed_by_user_id, processed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: executive_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.executive_members (id, full_name, "position", biography, image_url, linkedin_url, display_order, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: homepage_hero_slides; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.homepage_hero_slides (id, media_asset_id, title, alt_text, display_order, is_published, created_at, updated_at) FROM stdin;
341be62d-8cbf-487f-9bf4-3158231cdb96	e9021466-0d10-43eb-8572-b8b5ac797f24	\N	membre asso	0	t	2026-07-12 11:58:24.449+01	2026-07-12 11:59:37.385+01
19081b09-a7b2-405c-972a-c747a4bfb1e2	7556b943-b7d6-43be-8cc2-5f31a5709b2e	\N	Banière 2	1	t	2026-07-12 11:57:42.664+01	2026-07-12 11:59:37.385+01
\.


--
-- Data for Name: institutional_contents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.institutional_contents (id, slug, hero_eyebrow, hero_title, hero_subtitle, hero_primary_cta_label, hero_primary_cta_url, hero_secondary_cta_label, hero_secondary_cta_url, federation_eyebrow, federation_title, federation_body, missions_eyebrow, missions_title, missions_body, governance_eyebrow, governance_title, governance_body, executive_office_eyebrow, executive_office_title, executive_office_body, partners_eyebrow, partners_title, partners_body, documents_eyebrow, documents_title, documents_body, contact_eyebrow, contact_title, contact_body, contact_email, contact_phone, contact_address, seo_title, seo_description, is_published, created_at, updated_at) FROM stdin;
53d8793f-410b-4528-a81f-eab5925b7b96	home	FÃ©dÃ©ration nationale	Structurer, reprÃ©senter et faire progresser la location automobile au Maroc.	La FLASCAM fÃ©dÃ¨re les professionnels de la location automobile sans chauffeur et porte leurs intÃ©rÃªts auprÃ¨s des institutions et partenaires du secteur.	DÃ©couvrir la fÃ©dÃ©ration	#federation	Nous contacter	#contact	La fÃ©dÃ©ration	Une organisation au service des professionnels de la mobilitÃ©	La FLASCAM rassemble les acteurs de la location automobile sans chauffeur au Maroc. Elle agit pour structurer la profession, renforcer sa reprÃ©sentation et accompagner son dÃ©veloppement durable.	Nos missions	DÃ©fendre la profession et accompagner sa transformation	La fÃ©dÃ©ration intervient sur les enjeux rÃ©glementaires, Ã©conomiques, technologiques et organisationnels du secteur.	Gouvernance	Une gouvernance reprÃ©sentative et responsable	La gouvernance de la FLASCAM repose sur une reprÃ©sentation Ã©quilibrÃ©e des professionnels et des associations rÃ©gionales, avec une organisation transparente et orientÃ©e vers lâ€™intÃ©rÃªt collectif.	Bureau exÃ©cutif	Des professionnels engagÃ©s au service de la fÃ©dÃ©ration	Le bureau exÃ©cutif assure le pilotage stratÃ©gique de la FLASCAM et reprÃ©sente ses adhÃ©rents auprÃ¨s de ses diffÃ©rents interlocuteurs.	Partenaires	Un rÃ©seau institutionnel et professionnel	La FLASCAM dÃ©veloppe des partenariats utiles Ã  la profession et Ã  la modernisation du secteur.	Ressources	Documents institutionnels	Consultez les principaux documents, publications et ressources officielles de la fÃ©dÃ©ration.	Contact	Ã‰changeons sur les enjeux de la profession	Vous souhaitez contacter la fÃ©dÃ©ration, proposer un partenariat ou obtenir une information ? Envoyez-nous votre demande.	contact@flascam.ma	+212 5 00 00 00 00	Casablanca, Maroc	FLASCAM â€” FÃ©dÃ©ration des loueurs automobiles sans chauffeur au Maroc	DÃ©couvrez la FLASCAM, ses missions, sa gouvernance, ses partenaires et ses actions en faveur des professionnels de la location automobile au Maroc.	t	2026-07-02 12:58:12.13238+01	2026-07-02 12:58:12.13238+01
\.


--
-- Data for Name: institutional_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.institutional_documents (id, title, description, document_type, file_url, file_size_label, publication_date, display_order, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: institutional_key_figures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.institutional_key_figures (id, value, label, description, display_order, is_published, created_at, updated_at) FROM stdin;
618b1fa0-67fc-4576-a1ea-cba72a8eff61	12	RÃ©gions reprÃ©sentÃ©es	Une prÃ©sence territoriale au plus prÃ¨s des professionnels.	10	t	2026-07-02 12:58:12.13238+01	2026-07-02 12:58:12.13238+01
08c373ab-28f9-4a0c-98af-4e5dc6eec460	+500	Professionnels	Un rÃ©seau fÃ©dÃ©rant les acteurs de la location automobile.	20	t	2026-07-02 12:58:12.13238+01	2026-07-02 12:58:12.13238+01
ac369166-9a8c-4caa-bf79-008b81b77562	1	Voix nationale	Une reprÃ©sentation commune pour dÃ©fendre la profession.	30	t	2026-07-02 12:58:12.13238+01	2026-07-02 12:58:12.13238+01
\.


--
-- Data for Name: institutional_missions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.institutional_missions (id, title, description, display_order, is_published, created_at, updated_at) FROM stdin;
e31cd222-643a-444b-b27c-adfdb4b5f060	ReprÃ©senter la profession	Porter la voix des loueurs automobiles sans chauffeur auprÃ¨s des pouvoirs publics, institutions et partenaires.	10	t	2026-07-02 12:58:12.13238+01	2026-07-02 12:58:12.13238+01
590dd56c-7e0b-402a-b057-08cb8c032e6d	Structurer le secteur	Contribuer Ã  la professionnalisation, Ã  la transparence et Ã  lâ€™amÃ©lioration continue des pratiques.	20	t	2026-07-02 12:58:12.13238+01	2026-07-02 12:58:12.13238+01
d85b8bb4-a179-42e0-9c43-d66b454ab0f0	Accompagner les adhÃ©rents	Informer, conseiller et soutenir les professionnels face aux Ã©volutions rÃ©glementaires et Ã©conomiques.	30	t	2026-07-02 12:58:12.13238+01	2026-07-02 12:58:12.13238+01
bb182336-b428-494f-a29a-1ad93b3e8a99	Favoriser la coopÃ©ration	CrÃ©er des synergies entre la fÃ©dÃ©ration, les associations rÃ©gionales et les acteurs de la mobilitÃ©.	40	t	2026-07-02 12:58:12.13238+01	2026-07-02 12:58:12.13238+01
\.


--
-- Data for Name: institutional_partners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.institutional_partners (id, name, description, logo_url, website_url, display_order, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: media_assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.media_assets (id, uploaded_by_user_id, storage_provider, bucket_name, object_key, original_filename, stored_filename, file_extension, mime_type, media_type, visibility, status, size_bytes, checksum_sha256, width, height, duration_seconds, title, alt_text, caption, metadata, uploaded_at, validated_at, deleted_at, created_at, updated_at) FROM stdin;
0dfc492a-549b-4b58-9234-d36569c52399	5f3b3829-26c0-4142-8ea2-668bc12184b7	MINIO	flascam-public	associations/logos/5b810830-854e-481e-9d35-2f67ff97ab05.png	icon.png	5b810830-854e-481e-9d35-2f67ff97ab05.png	png	image/png	IMAGE	PUBLIC	PUBLISHED	203579	290954d0e5ad9fce6e1adcb4dcd5ef5ea3d23e648d7ba61264b4d88466421a71	\N	\N	\N	icon.png	icon.png	\N	{}	2026-07-11 14:32:07.954+01	\N	\N	2026-07-11 14:32:07.954+01	2026-07-11 14:32:07.954+01
54239455-9fd5-4e4a-9f5a-919fd22f08de	747a00a5-ead3-44a7-9e29-08fc92495400	MINIO	flascam-public	associations/logos/822c859f-6f0f-4864-9b44-6a7e629656b1.jpeg	hiregroupma_cover.jpeg	822c859f-6f0f-4864-9b44-6a7e629656b1.jpeg	jpeg	image/jpeg	IMAGE	PUBLIC	PUBLISHED	2646308	42a18f8c177ed213761f9f4d7fcfdbdc4a4423219140ecc53862f56b8efa32e6	\N	\N	\N	hiregroupma_cover.jpeg	hiregroupma_cover.jpeg	\N	{}	2026-07-11 14:59:33.041+01	\N	\N	2026-07-11 14:59:33.041+01	2026-07-11 14:59:33.041+01
f5acbda7-570b-4b9c-b696-a8562952c095	747a00a5-ead3-44a7-9e29-08fc92495400	MINIO	flascam-public	homepage/hero/66e8e798-f14a-4f32-b749-fee22fa858d3.jpeg	hiregroupma_cover.jpeg	66e8e798-f14a-4f32-b749-fee22fa858d3.jpeg	jpeg	image/jpeg	IMAGE	PUBLIC	PUBLISHED	2646308	42a18f8c177ed213761f9f4d7fcfdbdc4a4423219140ecc53862f56b8efa32e6	\N	\N	\N	hiregroupma_cover.jpeg	hiregroupma_cover.jpeg	\N	{}	2026-07-12 11:03:51.241+01	\N	\N	2026-07-12 11:03:51.241+01	2026-07-12 11:03:51.241+01
7556b943-b7d6-43be-8cc2-5f31a5709b2e	747a00a5-ead3-44a7-9e29-08fc92495400	MINIO	flascam-public	homepage/hero/1b0092fb-4b5e-44cc-9c38-31dcac4aa2c9.jpeg	hiregroupma_cover.jpeg	1b0092fb-4b5e-44cc-9c38-31dcac4aa2c9.jpeg	jpeg	image/jpeg	IMAGE	PUBLIC	PUBLISHED	2646308	42a18f8c177ed213761f9f4d7fcfdbdc4a4423219140ecc53862f56b8efa32e6	\N	\N	\N	hiregroupma_cover.jpeg	hiregroupma_cover.jpeg	\N	{}	2026-07-12 11:57:42.603+01	\N	\N	2026-07-12 11:57:42.603+01	2026-07-12 11:57:42.603+01
e9021466-0d10-43eb-8572-b8b5ac797f24	747a00a5-ead3-44a7-9e29-08fc92495400	MINIO	flascam-public	homepage/hero/78ce196d-1185-47ba-8bb0-f07c9d52d3ba.jpg	membre_asso.jpg	78ce196d-1185-47ba-8bb0-f07c9d52d3ba.jpg	jpg	image/jpeg	IMAGE	PUBLIC	PUBLISHED	129018	ff62369217917edf6f3f5bcd0aea90a0407f854853dc21755b94256fb995ca5c	\N	\N	\N	membre_asso.jpg	membre_asso.jpg	\N	{}	2026-07-12 11:58:24.333+01	\N	\N	2026-07-12 11:58:24.333+01	2026-07-12 11:58:24.333+01
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, code, name, description, created_at, updated_at) FROM stdin;
3420bd93-88dd-4207-89f9-e0971e5e1618	users.read	Consulter les utilisateurs	Consulter la liste et le dÃ©tail des utilisateurs.	2026-07-02 12:30:36.432329+01	2026-07-02 12:33:31.971624+01
86175e49-901a-4bd1-a5b7-3ee62a17e552	users.create	CrÃ©er des utilisateurs	CrÃ©er de nouveaux comptes utilisateurs.	2026-07-02 12:30:36.432329+01	2026-07-02 12:33:31.971624+01
4fa9a1f3-5d49-412f-b9c5-053f9f72cfd2	users.update	Modifier les utilisateurs	Modifier les comptes et leurs statuts.	2026-07-02 12:30:36.432329+01	2026-07-02 12:33:31.971624+01
ac6f15a8-4e41-409f-90b8-cfda4279c684	users.delete	Supprimer des utilisateurs	DÃ©sactiver ou supprimer logiquement un compte.	2026-07-02 12:30:36.432329+01	2026-07-02 12:33:31.971624+01
c7590386-05ea-41ad-9f78-a6c749535fa0	roles.read	Consulter les rÃ´les	Consulter les rÃ´les et permissions.	2026-07-02 12:30:36.432329+01	2026-07-02 12:33:31.971624+01
84a55410-12f2-48b8-a95f-4a670d5382f1	roles.manage	GÃ©rer les rÃ´les	CrÃ©er, modifier et attribuer les rÃ´les.	2026-07-02 12:30:36.432329+01	2026-07-02 12:33:31.971624+01
8a68bebe-ef00-4702-9210-5f3f0a174d47	audit.read	Consulter les journaux	Consulter les connexions et actions sensibles.	2026-07-02 12:30:36.432329+01	2026-07-02 12:33:31.971624+01
6c9d50bf-a18a-4d35-ac7c-a84c0feb0729	content.manage	GÃ©rer les contenus	Administrer les contenus publics FLASCAM.	2026-07-02 12:30:36.432329+01	2026-07-02 12:33:31.971624+01
3264d71b-9855-4716-b760-7c86467b1a74	renters.manage	GÃ©rer les loueurs	Administrer les loueurs affiliÃ©s.	2026-07-02 12:30:36.432329+01	2026-07-02 12:33:31.971624+01
0de46cd8-00b7-4982-adaa-3b23c32585c0	vehicles.manage	GÃ©rer les vÃ©hicules	Administrer les annonces de vÃ©hicules.	2026-07-02 12:30:36.432329+01	2026-07-02 12:33:31.971624+01
683db96a-c7db-44c6-9359-405c5f3e17e6	settings.manage	GÃ©rer les paramÃ¨tres	Administrer les paramÃ¨tres globaux de la plateforme.	2026-07-02 12:30:36.432329+01	2026-07-02 12:33:31.971624+01
ec377ef1-dc35-4516-a66a-02dbf4aa398c	associations.read	Consulter les associations	Consulter les associations rÃ©gionales dans le back-office.	2026-07-09 16:41:11.611944+01	2026-07-09 16:41:11.611944+01
6dbee5ac-eb44-431a-b529-f83651eec4bf	associations.manage	GÃ©rer les associations	CrÃ©er, modifier, publier et administrer les associations rÃ©gionales.	2026-07-02 12:30:36.432329+01	2026-07-09 16:41:11.611944+01
39e5dbd1-1d83-4db6-aed3-f06ec0edf718	association.profile.read	Consulter sa fiche association	Permet Ã  une association de consulter uniquement sa propre fiche.	2026-07-12 11:08:19.840387+01	2026-07-12 11:08:19.840387+01
51b35e29-02ab-4cc2-ae0d-1f6952dad23c	association.profile.update	Modifier sa fiche association	Permet Ã  une association de modifier uniquement les informations autorisÃ©es de sa propre fiche.	2026-07-12 11:08:19.840387+01	2026-07-12 11:08:19.840387+01
b7dbdaa4-7123-44bd-86d6-08e600189bfe	association.media.manage	GÃ©rer les mÃ©dias de son association	Permet Ã  une association dâ€™importer et de gÃ©rer uniquement ses propres images et vidÃ©os.	2026-07-12 11:08:19.840387+01	2026-07-12 11:08:19.840387+01
86d80951-89df-4e89-a2d4-baa1d5452afa	association.content.manage	GÃ©rer les contenus de son association	Permet Ã  une association de gÃ©rer uniquement ses propres actualitÃ©s et Ã©vÃ©nements.	2026-07-12 11:08:19.840387+01	2026-07-12 11:08:19.840387+01
27a38867-33ef-44c1-bee5-2410426abd38	association.account.manage	GÃ©rer les comptes des associations	Permet Ã  lâ€™administration FLASCAM de crÃ©er et modifier les comptes associÃ©s aux associations.	2026-07-12 11:08:19.840387+01	2026-07-12 11:08:19.840387+01
654d6876-6fa4-4d86-9021-2e23604aad3c	homepage.manage	GÃ©rer la page dâ€™accueil	Permet de gÃ©rer les images, leur publication et leur ordre sur la page dâ€™accueil.	2026-07-12 11:08:19.840387+01	2026-07-12 11:08:19.840387+01
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, user_id, token_hash, expires_at, revoked_at, ip_address, user_agent, created_at) FROM stdin;
75c38894-2e51-47ec-8dbf-ede65e1e2565	747a00a5-ead3-44a7-9e29-08fc92495400	56528b3dffbf85b1a01804efe2fe653ae75fecb0ec4f6b0d63aebe8c50fd04b3	2026-07-15 18:26:52+01	2026-07-08 18:43:59.118+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-08 18:26:52.284+01
e8f997b6-e40a-428e-bb31-9e24e29503fd	747a00a5-ead3-44a7-9e29-08fc92495400	204ff8f40d6f8648f475c9686d81b2bdaec4c2a7dc9bd46be980a5aca6899fa8	2026-07-15 18:43:59+01	2026-07-08 18:49:12.625+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-08 18:43:59.122+01
0b18c09a-4fbe-4a00-8438-a6f7fda21ea9	747a00a5-ead3-44a7-9e29-08fc92495400	522620090df1e480074fc2295dc258e3a1554581b6423f836020a89791fccc9f	2026-07-15 18:49:32+01	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-08 18:49:32.022+01
72788c00-9d57-41dc-b172-9d30890cd7ab	747a00a5-ead3-44a7-9e29-08fc92495400	567f094d4b484ffa6e8a46cc9b4eb16a53b5c1fb483f7e76bf54e6a85742515e	2026-07-16 16:04:30+01	2026-07-09 16:23:57.685+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 16:04:30.509+01
f09b757a-57f5-4920-91ce-a012c271e2e6	747a00a5-ead3-44a7-9e29-08fc92495400	59d3588f2715283441785ab0c3485ad29d1e82fe0c5ba4787ce7e1354955d128	2026-07-16 16:23:57+01	2026-07-09 16:51:07.237+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 16:23:57.689+01
ec1bf795-9c25-444f-b45a-724e460e1a91	747a00a5-ead3-44a7-9e29-08fc92495400	0c279d6a238a28a857f7d532327a1b46cecce8ee229aebc65d5c0a524ab47255	2026-07-16 16:51:07+01	2026-07-09 17:12:38.337+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 16:51:07.253+01
89f05e14-6ced-40a4-9435-fee60c011779	747a00a5-ead3-44a7-9e29-08fc92495400	8955e560255fd7b17a963e06f6899b4de77af40d952ce8e10863e8fcedf211cd	2026-07-16 17:12:38+01	2026-07-09 17:31:21.649+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 17:12:38.354+01
adac3586-47b0-4c8d-b7bf-fe6df9cc46cf	747a00a5-ead3-44a7-9e29-08fc92495400	7b12c941121e1afed724c38f25873b27806b4325629f00b67d59a30b2915f5d8	2026-07-16 17:31:21+01	2026-07-09 17:32:06.562+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 17:31:21.663+01
66bc4f1d-d1f0-4cf0-a821-9055b2fcc8dc	5f3b3829-26c0-4142-8ea2-668bc12184b7	0ae0a94753267ec5a1060b098726ff01e701f347524de2151ae02e82374e9b99	2026-07-16 17:32:15+01	2026-07-11 14:31:56.426+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 17:32:15.283+01
5634af39-b71b-46ab-8538-6ac9dcfc73d5	5f3b3829-26c0-4142-8ea2-668bc12184b7	805118cea70fed9d5c1a011db5d0b3141b7cf31b1f023063c6c02e1b86edcb12	2026-07-18 14:31:56+01	2026-07-11 14:34:02.089+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-11 14:31:56.469+01
754b7db3-bee0-4f07-9c27-e7c32896678f	747a00a5-ead3-44a7-9e29-08fc92495400	903bd31e257432427f53fea6b5262b267490a9ab9f3e532417ed3974ecb561cb	2026-07-18 14:34:20+01	2026-07-11 14:53:03.377+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-11 14:34:20.92+01
4fb02ce3-a0d2-4efe-b0f4-060f0708bfff	747a00a5-ead3-44a7-9e29-08fc92495400	f22221ad1a19e16490fd964413f5bb52496147b4981d725affb9d9bce9d0ef81	2026-07-18 14:53:03+01	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-11 14:53:03.399+01
e2fd1650-f331-4495-8c30-901b72300a88	747a00a5-ead3-44a7-9e29-08fc92495400	82e1fb4eb3d24bfe011d97dd06fb07bc7745e6412ca872c5a631f7c09c80f3ce	2026-07-19 09:55:28+01	2026-07-12 10:57:17.492+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-12 09:55:28.74+01
8f12450b-d7bb-4ce3-bb0a-1449e2cd3a83	747a00a5-ead3-44a7-9e29-08fc92495400	6813fe7ef3c7b91324e3b07fc7a36358b57153b3493e02cff48a983e3c42c2b8	2026-07-19 10:57:17+01	2026-07-12 11:49:41.883+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-12 10:57:17.509+01
3f2389a0-b162-4945-b933-10e92415a3cd	747a00a5-ead3-44a7-9e29-08fc92495400	ee6935df1ca8a075b16226fc7f457c9882c1e973944301238edde85cc9b4c9bd	2026-07-19 11:49:41+01	2026-07-12 12:03:47.718+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-12 11:49:41.922+01
7af9f5e0-ebd7-459d-bdb5-48ffc23ef315	5f3b3829-26c0-4142-8ea2-668bc12184b7	2c622db77c9a503bbaf973ea472a2229b8c955997ac1702469b0e4f5dd0ffc13	2026-07-19 12:04:04+01	2026-07-12 12:15:46.45+01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-12 12:04:04.298+01
1c3ea71c-22e9-47c5-aef2-66b1bb2695ff	747a00a5-ead3-44a7-9e29-08fc92495400	0d46ecf2492f498af4c81540ffbc5dced400910e1da7e74b89ae0da313634d8b	2026-07-19 12:16:02+01	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-12 12:16:02.282+01
\.


--
-- Data for Name: regional_associations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.regional_associations (id, name, slug, acronym, region, city, member_count, affiliated_since_year, logo_media_asset_id, logo_text, presentation, address, phone, email, website_url, facebook_url, instagram_url, linkedin_url, youtube_url, status, is_featured, display_order, seo_title, seo_description, published_at, created_at, updated_at, deleted_at, cover_image_url) FROM stdin;
8978f6f3-47a6-49e2-b46a-d09e61b5aa2c	asso test	asso-test	assts	FES MEKNES	MEKNES	80	2025	0dfc492a-549b-4b58-9234-d36569c52399	AST	association de test pour tester la création et modification des associations	el bassatine meknes	06000000	assotest@gmail.com	www.assotest.com	\N	\N	\N	\N	PUBLISHED	t	1	Asso de test	association de test pour tester la création et modification des associations	2026-07-11 14:34:27.594+01	2026-07-09 17:31:21.691+01	2026-07-11 15:01:36.502+01	\N	http://localhost:9000/flascam-public/associations/logos/822c859f-6f0f-4864-9b44-6a7e629656b1.jpeg
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (role_id, permission_id, created_at) FROM stdin;
b5534558-3518-4f6d-963c-59b018786b3c	3420bd93-88dd-4207-89f9-e0971e5e1618	2026-07-02 12:30:36.432329+01
b5534558-3518-4f6d-963c-59b018786b3c	86175e49-901a-4bd1-a5b7-3ee62a17e552	2026-07-02 12:30:36.432329+01
b5534558-3518-4f6d-963c-59b018786b3c	4fa9a1f3-5d49-412f-b9c5-053f9f72cfd2	2026-07-02 12:30:36.432329+01
b5534558-3518-4f6d-963c-59b018786b3c	ac6f15a8-4e41-409f-90b8-cfda4279c684	2026-07-02 12:30:36.432329+01
b5534558-3518-4f6d-963c-59b018786b3c	c7590386-05ea-41ad-9f78-a6c749535fa0	2026-07-02 12:30:36.432329+01
b5534558-3518-4f6d-963c-59b018786b3c	84a55410-12f2-48b8-a95f-4a670d5382f1	2026-07-02 12:30:36.432329+01
b5534558-3518-4f6d-963c-59b018786b3c	8a68bebe-ef00-4702-9210-5f3f0a174d47	2026-07-02 12:30:36.432329+01
b5534558-3518-4f6d-963c-59b018786b3c	6c9d50bf-a18a-4d35-ac7c-a84c0feb0729	2026-07-02 12:30:36.432329+01
b5534558-3518-4f6d-963c-59b018786b3c	6dbee5ac-eb44-431a-b529-f83651eec4bf	2026-07-02 12:30:36.432329+01
b5534558-3518-4f6d-963c-59b018786b3c	3264d71b-9855-4716-b760-7c86467b1a74	2026-07-02 12:30:36.432329+01
b5534558-3518-4f6d-963c-59b018786b3c	0de46cd8-00b7-4982-adaa-3b23c32585c0	2026-07-02 12:30:36.432329+01
b5534558-3518-4f6d-963c-59b018786b3c	683db96a-c7db-44c6-9359-405c5f3e17e6	2026-07-02 12:30:36.432329+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	3420bd93-88dd-4207-89f9-e0971e5e1618	2026-07-02 12:30:36.432329+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	86175e49-901a-4bd1-a5b7-3ee62a17e552	2026-07-02 12:30:36.432329+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	4fa9a1f3-5d49-412f-b9c5-053f9f72cfd2	2026-07-02 12:30:36.432329+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	c7590386-05ea-41ad-9f78-a6c749535fa0	2026-07-02 12:30:36.432329+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	8a68bebe-ef00-4702-9210-5f3f0a174d47	2026-07-02 12:30:36.432329+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	6c9d50bf-a18a-4d35-ac7c-a84c0feb0729	2026-07-02 12:30:36.432329+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	6dbee5ac-eb44-431a-b529-f83651eec4bf	2026-07-02 12:30:36.432329+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	3264d71b-9855-4716-b760-7c86467b1a74	2026-07-02 12:30:36.432329+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	0de46cd8-00b7-4982-adaa-3b23c32585c0	2026-07-02 12:30:36.432329+01
22acb513-5a79-400d-a4a9-e0a6365bfece	0de46cd8-00b7-4982-adaa-3b23c32585c0	2026-07-02 12:30:36.432329+01
706da931-e75e-48cf-ba19-c82afe2c84a7	0de46cd8-00b7-4982-adaa-3b23c32585c0	2026-07-02 12:30:36.432329+01
b5534558-3518-4f6d-963c-59b018786b3c	ec377ef1-dc35-4516-a66a-02dbf4aa398c	2026-07-09 16:41:11.611944+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	ec377ef1-dc35-4516-a66a-02dbf4aa398c	2026-07-09 16:41:11.611944+01
b5534558-3518-4f6d-963c-59b018786b3c	39e5dbd1-1d83-4db6-aed3-f06ec0edf718	2026-07-12 11:08:19.840387+01
b5534558-3518-4f6d-963c-59b018786b3c	51b35e29-02ab-4cc2-ae0d-1f6952dad23c	2026-07-12 11:08:19.840387+01
b5534558-3518-4f6d-963c-59b018786b3c	b7dbdaa4-7123-44bd-86d6-08e600189bfe	2026-07-12 11:08:19.840387+01
b5534558-3518-4f6d-963c-59b018786b3c	86d80951-89df-4e89-a2d4-baa1d5452afa	2026-07-12 11:08:19.840387+01
b5534558-3518-4f6d-963c-59b018786b3c	27a38867-33ef-44c1-bee5-2410426abd38	2026-07-12 11:08:19.840387+01
b5534558-3518-4f6d-963c-59b018786b3c	654d6876-6fa4-4d86-9021-2e23604aad3c	2026-07-12 11:08:19.840387+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	39e5dbd1-1d83-4db6-aed3-f06ec0edf718	2026-07-12 11:08:19.840387+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	51b35e29-02ab-4cc2-ae0d-1f6952dad23c	2026-07-12 11:08:19.840387+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	b7dbdaa4-7123-44bd-86d6-08e600189bfe	2026-07-12 11:08:19.840387+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	86d80951-89df-4e89-a2d4-baa1d5452afa	2026-07-12 11:08:19.840387+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	27a38867-33ef-44c1-bee5-2410426abd38	2026-07-12 11:08:19.840387+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	654d6876-6fa4-4d86-9021-2e23604aad3c	2026-07-12 11:08:19.840387+01
22acb513-5a79-400d-a4a9-e0a6365bfece	39e5dbd1-1d83-4db6-aed3-f06ec0edf718	2026-07-12 11:08:19.840387+01
22acb513-5a79-400d-a4a9-e0a6365bfece	51b35e29-02ab-4cc2-ae0d-1f6952dad23c	2026-07-12 11:08:19.840387+01
22acb513-5a79-400d-a4a9-e0a6365bfece	b7dbdaa4-7123-44bd-86d6-08e600189bfe	2026-07-12 11:08:19.840387+01
22acb513-5a79-400d-a4a9-e0a6365bfece	86d80951-89df-4e89-a2d4-baa1d5452afa	2026-07-12 11:08:19.840387+01
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, code, name, description, is_system, created_at, updated_at) FROM stdin;
b5534558-3518-4f6d-963c-59b018786b3c	SUPER_ADMIN	Super administrateur	AccÃ¨s complet Ã  la plateforme FLASCAM.	t	2026-07-02 11:53:35.96024+01	2026-07-02 11:53:35.96024+01
5fc3ca0c-e585-4a0c-957e-df1da4dfb82f	FLASCAM_ADMIN	Administrateur FLASCAM	Gestion des contenus, utilisateurs, validations et statistiques.	t	2026-07-02 11:53:35.96024+01	2026-07-02 11:53:35.96024+01
22acb513-5a79-400d-a4a9-e0a6365bfece	ASSOCIATION_ADMIN	Administrateur association	Gestion de la page et des contenus de son association.	t	2026-07-02 11:53:35.96024+01	2026-07-02 11:53:35.96024+01
706da931-e75e-48cf-ba19-c82afe2c84a7	RENTER	Loueur affiliÃ©	Gestion du profil loueur, des annonces vÃ©hicules et des leads.	t	2026-07-02 11:53:35.96024+01	2026-07-02 11:53:35.96024+01
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, role_id, email, password_hash, first_name, last_name, phone, is_active, is_email_verified, last_login_at, password_changed_at, created_at, updated_at, deleted_at, regional_association_id) FROM stdin;
5f3b3829-26c0-4142-8ea2-668bc12184b7	22acb513-5a79-400d-a4a9-e0a6365bfece	assotest@gmail.com	$2b$12$pSfHbAkEpRbXXAblriiEe.UzSL685/qS.OTVOb9vh1MmEPRs.EXrO	asso	test	\N	t	t	2026-07-12 12:04:04.302+01	2026-07-09 17:31:21.902+01	2026-07-09 17:31:21.903+01	2026-07-11 15:01:36.539+01	\N	8978f6f3-47a6-49e2-b46a-d09e61b5aa2c
747a00a5-ead3-44a7-9e29-08fc92495400	b5534558-3518-4f6d-963c-59b018786b3c	admin@flascam.ma	$2a$12$evUqpgyAkNRaE/tRPvXls.HlEy.vvmcAfxWvK2CPdjKO3c2soyDiK	Super	Admin	\N	t	t	2026-07-12 12:16:02.294+01	2026-07-02 12:33:31.971624+01	2026-07-02 12:30:36.432329+01	2026-07-02 12:33:31.971624+01	\N	\N
\.


--
-- Name: association_media_items association_media_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.association_media_items
    ADD CONSTRAINT association_media_items_pkey PRIMARY KEY (id);


--
-- Name: association_posts association_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.association_posts
    ADD CONSTRAINT association_posts_pkey PRIMARY KEY (id);


--
-- Name: association_posts association_posts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.association_posts
    ADD CONSTRAINT association_posts_slug_unique UNIQUE (regional_association_id, slug);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: executive_members executive_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.executive_members
    ADD CONSTRAINT executive_members_pkey PRIMARY KEY (id);


--
-- Name: homepage_hero_slides homepage_hero_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_hero_slides
    ADD CONSTRAINT homepage_hero_slides_pkey PRIMARY KEY (id);


--
-- Name: institutional_contents institutional_contents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutional_contents
    ADD CONSTRAINT institutional_contents_pkey PRIMARY KEY (id);


--
-- Name: institutional_contents institutional_contents_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutional_contents
    ADD CONSTRAINT institutional_contents_slug_key UNIQUE (slug);


--
-- Name: institutional_documents institutional_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutional_documents
    ADD CONSTRAINT institutional_documents_pkey PRIMARY KEY (id);


--
-- Name: institutional_key_figures institutional_key_figures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutional_key_figures
    ADD CONSTRAINT institutional_key_figures_pkey PRIMARY KEY (id);


--
-- Name: institutional_missions institutional_missions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutional_missions
    ADD CONSTRAINT institutional_missions_pkey PRIMARY KEY (id);


--
-- Name: institutional_partners institutional_partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutional_partners
    ADD CONSTRAINT institutional_partners_pkey PRIMARY KEY (id);


--
-- Name: media_assets media_assets_bucket_object_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_bucket_object_unique UNIQUE (bucket_name, object_key);


--
-- Name: media_assets media_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_code_key UNIQUE (code);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_unique UNIQUE (token_hash);


--
-- Name: regional_associations regional_associations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regional_associations
    ADD CONSTRAINT regional_associations_pkey PRIMARY KEY (id);


--
-- Name: regional_associations regional_associations_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regional_associations
    ADD CONSTRAINT regional_associations_slug_key UNIQUE (slug);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_code_key UNIQUE (code);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: association_media_items_association_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX association_media_items_association_idx ON public.association_media_items USING btree (regional_association_id);


--
-- Name: association_media_items_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX association_media_items_deleted_at_idx ON public.association_media_items USING btree (deleted_at);


--
-- Name: association_media_items_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX association_media_items_type_idx ON public.association_media_items USING btree (media_type);


--
-- Name: association_posts_association_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX association_posts_association_idx ON public.association_posts USING btree (regional_association_id);


--
-- Name: association_posts_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX association_posts_deleted_at_idx ON public.association_posts USING btree (deleted_at);


--
-- Name: association_posts_event_start_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX association_posts_event_start_idx ON public.association_posts USING btree (event_start_at);


--
-- Name: association_posts_type_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX association_posts_type_status_idx ON public.association_posts USING btree (content_type, status);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at DESC);


--
-- Name: audit_logs_entity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_entity_idx ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: contact_messages_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contact_messages_created_at_idx ON public.contact_messages USING btree (created_at DESC);


--
-- Name: contact_messages_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contact_messages_status_idx ON public.contact_messages USING btree (status);


--
-- Name: executive_members_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX executive_members_order_idx ON public.executive_members USING btree (display_order);


--
-- Name: homepage_hero_slides_media_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX homepage_hero_slides_media_unique ON public.homepage_hero_slides USING btree (media_asset_id);


--
-- Name: homepage_hero_slides_public_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homepage_hero_slides_public_idx ON public.homepage_hero_slides USING btree (is_published, display_order, created_at);


--
-- Name: institutional_documents_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX institutional_documents_order_idx ON public.institutional_documents USING btree (display_order);


--
-- Name: institutional_key_figures_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX institutional_key_figures_order_idx ON public.institutional_key_figures USING btree (display_order);


--
-- Name: institutional_missions_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX institutional_missions_order_idx ON public.institutional_missions USING btree (display_order);


--
-- Name: institutional_partners_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX institutional_partners_order_idx ON public.institutional_partners USING btree (display_order);


--
-- Name: media_assets_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_created_at_idx ON public.media_assets USING btree (created_at DESC);


--
-- Name: media_assets_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_deleted_at_idx ON public.media_assets USING btree (deleted_at);


--
-- Name: media_assets_media_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_media_type_idx ON public.media_assets USING btree (media_type);


--
-- Name: media_assets_metadata_gin_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_metadata_gin_idx ON public.media_assets USING gin (metadata);


--
-- Name: media_assets_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_status_idx ON public.media_assets USING btree (status);


--
-- Name: media_assets_uploaded_by_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_uploaded_by_user_id_idx ON public.media_assets USING btree (uploaded_by_user_id);


--
-- Name: media_assets_visibility_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_visibility_idx ON public.media_assets USING btree (visibility);


--
-- Name: refresh_tokens_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_expires_at_idx ON public.refresh_tokens USING btree (expires_at);


--
-- Name: refresh_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_user_id_idx ON public.refresh_tokens USING btree (user_id);


--
-- Name: regional_associations_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX regional_associations_deleted_at_idx ON public.regional_associations USING btree (deleted_at);


--
-- Name: regional_associations_featured_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX regional_associations_featured_order_idx ON public.regional_associations USING btree (is_featured, display_order);


--
-- Name: regional_associations_region_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX regional_associations_region_idx ON public.regional_associations USING btree (region);


--
-- Name: regional_associations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX regional_associations_status_idx ON public.regional_associations USING btree (status);


--
-- Name: users_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_deleted_at_idx ON public.users USING btree (deleted_at);


--
-- Name: users_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_is_active_idx ON public.users USING btree (is_active);


--
-- Name: users_regional_association_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_regional_association_id_idx ON public.users USING btree (regional_association_id);


--
-- Name: users_role_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_id_idx ON public.users USING btree (role_id);


--
-- Name: association_media_items association_media_items_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.association_media_items
    ADD CONSTRAINT association_media_items_media_asset_id_fkey FOREIGN KEY (media_asset_id) REFERENCES public.media_assets(id) ON DELETE RESTRICT;


--
-- Name: association_media_items association_media_items_regional_association_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.association_media_items
    ADD CONSTRAINT association_media_items_regional_association_id_fkey FOREIGN KEY (regional_association_id) REFERENCES public.regional_associations(id) ON DELETE CASCADE;


--
-- Name: association_posts association_posts_cover_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.association_posts
    ADD CONSTRAINT association_posts_cover_media_asset_id_fkey FOREIGN KEY (cover_media_asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;


--
-- Name: association_posts association_posts_regional_association_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.association_posts
    ADD CONSTRAINT association_posts_regional_association_id_fkey FOREIGN KEY (regional_association_id) REFERENCES public.regional_associations(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: contact_messages contact_messages_processed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_processed_by_user_id_fkey FOREIGN KEY (processed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: homepage_hero_slides homepage_hero_slides_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_hero_slides
    ADD CONSTRAINT homepage_hero_slides_media_asset_id_fkey FOREIGN KEY (media_asset_id) REFERENCES public.media_assets(id) ON DELETE RESTRICT;


--
-- Name: media_assets media_assets_uploaded_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_uploaded_by_user_id_fkey FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: regional_associations regional_associations_logo_media_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regional_associations
    ADD CONSTRAINT regional_associations_logo_media_asset_id_fkey FOREIGN KEY (logo_media_asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: users users_regional_association_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_regional_association_id_fkey FOREIGN KEY (regional_association_id) REFERENCES public.regional_associations(id) ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict wUpBYmSXTex5Txjc7y1fMTCUd35ymevoQOdRgWfKwskcojj2l3nnX1rOrSxK9x6

