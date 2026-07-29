BEGIN;

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS city VARCHAR(180),
  ADD COLUMN IF NOT EXISTS requester_type VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL',
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS business_sector VARCHAR(255),
  ADD COLUMN IF NOT EXISTS years_in_business INTEGER,
  ADD COLUMN IF NOT EXISTS regional_association_id UUID;

UPDATE public.contact_messages
SET
  first_name = COALESCE(
    first_name,
    NULLIF(
      split_part(trim(full_name), ' ', 1),
      ''
    )
  ),
  last_name = COALESCE(
    last_name,
    NULLIF(
      trim(
        regexp_replace(
          trim(full_name),
          '^[^ ]+\s*',
          ''
        )
      ),
      ''
    )
  )
WHERE first_name IS NULL
   OR last_name IS NULL;

ALTER TABLE public.contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_requester_type_check;

ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_requester_type_check
  CHECK (
    requester_type IN (
      'INDIVIDUAL',
      'PROFESSIONAL'
    )
  );

ALTER TABLE public.contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_status_check;

UPDATE public.contact_messages
SET status = CASE
  WHEN status = 'PROCESSED' THEN 'COMPLETED'
  WHEN status = 'ARCHIVED' THEN 'CANCELLED'
  ELSE status
END;

ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_status_check
  CHECK (
    status IN (
      'NEW',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED'
    )
  );

ALTER TABLE public.contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_years_in_business_check;

ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_years_in_business_check
  CHECK (
    years_in_business IS NULL
    OR (
      years_in_business >= 0
      AND years_in_business <= 200
    )
  );

ALTER TABLE public.contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_professional_fields_check;

ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_professional_fields_check
  CHECK (
    requester_type = 'INDIVIDUAL'
    OR (
      requester_type = 'PROFESSIONAL'
      AND company_name IS NOT NULL
      AND length(trim(company_name)) >= 2
      AND business_sector IS NOT NULL
      AND length(trim(business_sector)) >= 2
      AND years_in_business IS NOT NULL
    )
  );

ALTER TABLE public.contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_regional_association_id_fkey;

ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_regional_association_id_fkey
  FOREIGN KEY (regional_association_id)
  REFERENCES public.regional_associations(id)
  ON UPDATE NO ACTION
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS contact_messages_association_idx
  ON public.contact_messages(regional_association_id);

CREATE INDEX IF NOT EXISTS contact_messages_association_status_idx
  ON public.contact_messages(
    regional_association_id,
    status
  );

CREATE INDEX IF NOT EXISTS contact_messages_requester_type_idx
  ON public.contact_messages(requester_type);

COMMIT;