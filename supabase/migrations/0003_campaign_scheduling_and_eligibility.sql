alter table institutions
  add column if not exists contact_permission text not null default 'Pendiente'
    check (contact_permission in ('Pendiente','Autorizado','No autorizado'));

alter table campaigns
  add column if not exists audience_mode text not null default 'all',
  add column if not exists audience_province text,
  add column if not exists audience_canton text,
  add column if not exists daily_limit integer not null default 20 check (daily_limit between 1 and 500),
  add column if not exists allowed_days integer[] not null default array[1,2,3,4,5],
  add column if not exists send_start time not null default '08:00',
  add column if not exists send_end time not null default '16:00',
  add column if not exists timezone text not null default 'America/Costa_Rica',
  add column if not exists estimated_completion date,
  add column if not exists catalog_path text not null default '/catalogo-navideno.pdf';

alter table campaigns drop constraint if exists campaigns_status_check;
alter table campaigns add constraint campaigns_status_check
  check(status in('Preparada','Borrador','Programada','En ejecución','Pausada','Completada','Con errores','Cancelada'));

create index if not exists campaigns_scheduler
  on campaigns(status,scheduled_at);
create index if not exists institutions_campaign_eligibility
  on institutions(type,contact_permission,province,canton)
  where deleted_at is null;
create index if not exists email_messages_sender_day
  on email_messages(sent_at) where status='sent';

alter table email_messages add column if not exists thread_id text;
create index if not exists email_messages_thread on email_messages(thread_id) where thread_id is not null;

insert into app_settings(key,value) values
  ('timezone','America/Costa_Rica'),
  ('send_start','08:00'),
  ('send_end','16:00'),
  ('allowed_days','1,2,3,4,5')
on conflict(key) do nothing;

insert into email_templates(name,kind,subject,html,is_default)
select 'Celebraciones infantiles','children','Una celebración inolvidable para {{institucion}}','<div style="font-family:Arial,sans-serif;color:#342a43;line-height:1.65;max-width:640px;margin:auto"><h1 style="color:#e66da9">Alegría para toda la comunidad</h1><p>Hola, {{institucion}}:</p><p>En <strong>Inflables Shayth</strong> creamos celebraciones infantiles seguras, alegres y adaptadas a cada espacio.</p><p><a href="https://wa.me/50664043069" style="display:inline-block;background:#9256d9;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none">Solicitar información</a></p><p>Equipo de Inflables Shayth · +506 6404-3069</p><p style="font-size:11px;color:#777">Si no desea recibir más información, responda NO a este correo.</p></div>',false
where not exists(select 1 from email_templates where kind='children');

insert into email_templates(name,kind,subject,html,is_default)
select 'Plantilla personalizada','custom','Información para {{institucion}}','<div style="font-family:Arial,sans-serif;color:#342a43;line-height:1.65;max-width:640px;margin:auto"><h1 style="color:#9256d9">Hola, {{institucion}}</h1><p>Escribe aquí el mensaje de tu campaña.</p><p><a href="https://wa.me/50664043069" style="display:inline-block;background:#9256d9;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none">Contactar a Inflables Shayth</a></p><p>Equipo de Inflables Shayth · +506 6404-3069</p><p style="font-size:11px;color:#777">Si no desea recibir más información, responda NO a este correo.</p></div>',false
where not exists(select 1 from email_templates where kind='custom');
