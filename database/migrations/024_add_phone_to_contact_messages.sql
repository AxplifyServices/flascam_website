BEGIN;

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

ALTER TABLE public.contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_phone_format_check;

ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_phone_format_check
  CHECK (
    phone IS NULL
    OR (
      length(trim(phone)) BETWEEN 8 AND 30
      AND trim(phone) ~ '^\+?[0-9][0-9\s().-]*$'
    )
  );

CREATE INDEX IF NOT EXISTS contact_messages_phone_idx
  ON public.contact_messages(phone);

COMMIT;