-- Ejecutar únicamente si es necesario retirar por completo la versión 0003.
drop index if exists email_messages_thread;
drop index if exists email_messages_sender_day;
drop index if exists institutions_campaign_eligibility;
drop index if exists campaigns_scheduler;
alter table email_messages drop column if exists thread_id;
alter table campaigns drop column if exists catalog_path;
alter table campaigns drop column if exists estimated_completion;
alter table campaigns drop column if exists timezone;
alter table campaigns drop column if exists send_end;
alter table campaigns drop column if exists send_start;
alter table campaigns drop column if exists allowed_days;
alter table campaigns drop column if exists daily_limit;
alter table campaigns drop column if exists audience_canton;
alter table campaigns drop column if exists audience_province;
alter table campaigns drop column if exists audience_mode;
alter table institutions drop column if exists contact_permission;
