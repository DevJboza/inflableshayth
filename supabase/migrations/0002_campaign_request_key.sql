alter table campaigns add column if not exists request_key uuid;
create unique index if not exists campaigns_request_key_unique on campaigns(request_key) where request_key is not null;
