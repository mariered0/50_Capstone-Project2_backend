\echo 'Delete and recreate NoodleHut db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE NoodleHut;
CREATE DATABASE NoodleHut;
\connect noodlehut

\i NoodleHut-schema.sql
\i NoodleHut-seed.sql

\echo 'Delete and recreate NoodleHut db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE NoodleHut_test;
CREATE DATABASE NoodleHut_test;
\connect noodlehut_test

\i NoodleHut-schema.sql

