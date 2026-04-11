-- Patch: Add 'biweekly' to frequency CHECK constraints
-- Run this in the Supabase SQL Editor.
--
-- The app now creates built-in tasks with 'biweekly' frequency
-- (tire pressure, lights, washer fluid). Without this patch,
-- cloud users will get constraint violations on task creation
-- and migration.

-- maintenance_tasks: drop old constraint, add new one with biweekly
alter table public.maintenance_tasks
  drop constraint if exists maintenance_tasks_frequency_check;

alter table public.maintenance_tasks
  add constraint maintenance_tasks_frequency_check
  check (frequency in ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'biannual', 'annual'));

-- maintenance_logs: drop old constraint, add new one with biweekly
alter table public.maintenance_logs
  drop constraint if exists maintenance_logs_frequency_check;

alter table public.maintenance_logs
  add constraint maintenance_logs_frequency_check
  check (frequency in ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'biannual', 'annual'));
