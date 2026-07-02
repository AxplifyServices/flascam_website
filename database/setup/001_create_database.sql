\set ON_ERROR_STOP on

SELECT
  'CREATE ROLE flascam_user WITH LOGIN PASSWORD ''flascam_local_password'''
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_roles
  WHERE rolname = 'flascam_user'
)
\gexec

ALTER ROLE flascam_user
WITH LOGIN
PASSWORD 'flascam_local_password';

SELECT
  'CREATE DATABASE flascam_db OWNER flascam_user'
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_database
  WHERE datname = 'flascam_db'
)
\gexec