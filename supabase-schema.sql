-- ============================================
-- CROSSTRAIN FIGHT CLUB — DATABASE SCHEMA
-- Paste this entire file into Supabase SQL Editor
-- ============================================

-- CENTERS
create table centers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  city text,
  created_at timestamp default now()
);

insert into centers (name, location, city) values
  ('CFC Delhi', 'Lajpat Nagar', 'Delhi'),
  ('CFC Noida', 'Sector 18', 'Noida'),
  ('CFC Faridabad', 'Sector 21', 'Faridabad'),
  ('CFC Gurgaon', 'DLF Phase 2', 'Gurgaon'),
  ('CFC Punjabi Bagh', 'Punjabi Bagh West', 'Delhi');

-- DISCIPLINES
create table disciplines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  levels jsonb
);

insert into disciplines (name, levels) values
  ('BJJ', '["White Belt","Blue Belt","Purple Belt","Brown Belt","Black Belt"]'),
  ('Boxing', '["Beginner","Amateur","Intermediate","Advanced","Pro"]'),
  ('MMA', '["Beginner","Intermediate","Advanced","Pro"]'),
  ('Muay Thai', '["Beginner","Intermediate","Advanced","Fighter"]'),
  ('Kickboxing', '["Beginner","Yellow","Orange","Green","Blue","Red","Black"]'),
  ('Wrestling', '["Beginner","Intermediate","Advanced","Elite"]'),
  ('Hybrid', '["Level 1","Level 2","Level 3","Level 4"]');

-- MEMBERS
create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text unique,
  email text,
  home_center_id uuid references centers(id),
  plan text default '1-Month',
  plan_price integer default 3500,
  joined_date date default current_date,
  expiry_date date,
  status text default 'active', -- active, inactive, trial, churned
  created_at timestamp default now()
);

-- MEMBER DISCIPLINES (which disciplines a member trains)
create table member_disciplines (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  discipline_id uuid references disciplines(id),
  current_level text default 'Beginner',
  points integer default 0
);

-- CLASSES (recurring schedule)
create table classes (
  id uuid primary key default gen_random_uuid(),
  center_id uuid references centers(id),
  discipline_id uuid references disciplines(id),
  trainer text,
  day_of_week text, -- Monday, Tuesday etc
  time_slot text, -- '06:00 AM'
  capacity integer default 20,
  created_at timestamp default now()
);

-- BOOKINGS
create table bookings (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  class_id uuid references classes(id),
  booking_date date default current_date,
  status text default 'booked', -- booked, attended, cancelled
  created_at timestamp default now()
);

-- ATTENDANCE
create table attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  class_id uuid references classes(id),
  attended_at timestamp default now(),
  center_id uuid references centers(id)
);

-- LEADS
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  source text, -- Instagram, Google, Friend, Facebook, YouTube, Walk-in
  center_id uuid references centers(id),
  discipline_interest text,
  status text default 'new', -- new, called, trial_booked, attended, converted, lost
  assigned_to text,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- FOLLOW UPS
create table follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  type text, -- call, pre_trial, post_trial, renewal, reengage
  due_date date default current_date,
  done boolean default false,
  notes text,
  created_at timestamp default now()
);

-- BADGES
create table badges (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  badge_type text, -- first_class, streak_7, sessions_10, sessions_50, blue_belt etc
  unlocked_at timestamp default now()
);

-- COMMUNITY POSTS
create table posts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  content text,
  discipline_tag text,
  likes integer default 0,
  created_at timestamp default now()
);

-- ============================================
-- SAMPLE DATA — MEMBERS
-- ============================================
insert into members (name, phone, email, home_center_id, plan, plan_price, joined_date, expiry_date, status)
select
  name, phone, email,
  (select id from centers where name = center_name),
  plan, plan_price, joined_date::date, expiry_date::date, status
from (values
  ('Vikram Kumar','9810001001','vikram@email.com','CFC Delhi','3-Month',9000,'2025-02-01','2025-05-01','active'),
  ('Priya Joshi','9810001002','priya@email.com','CFC Delhi','3-Month',9000,'2025-01-15','2025-04-15','active'),
  ('Rohit Singh','9810001003','rohit@email.com','CFC Noida','1-Month',3500,'2025-03-01','2025-04-01','active'),
  ('Sneha Rao','9810001004','sneha@email.com','CFC Noida','3-Month',9000,'2025-02-15','2025-05-15','active'),
  ('Amit Mehta','9810001005','amit@email.com','CFC Faridabad','1-Month',3500,'2025-03-10','2025-04-10','inactive'),
  ('Rahul Sharma','9810001006','rahul@email.com','CFC Delhi','3-Month',9000,'2025-01-01','2025-04-01','inactive'),
  ('Arjun Kumar','9810001007','arjun@email.com','CFC Noida','1-Month',3500,'2025-03-05','2025-04-05','inactive'),
  ('Tanvi Nair','9810001008','tanvi@email.com','CFC Delhi','Trial',0,'2025-04-26','2025-04-27','trial'),
  ('Karan Shah','9810001009','karan@email.com','CFC Gurgaon','3-Month',9000,'2025-02-01','2025-05-01','active'),
  ('Meera Singh','9810001010','meera@email.com','CFC Punjabi Bagh','1-Month',3500,'2025-03-20','2025-04-20','active')
) as t(name, phone, email, center_name, plan, plan_price, joined_date, expiry_date, status);

-- SAMPLE LEADS
insert into leads (name, phone, source, center_id, discipline_interest, status)
select name, phone, source, (select id from centers where name = center_name), discipline, status
from (values
  ('Vikash Patel','9900001001','Instagram','CFC Delhi','MMA','new'),
  ('Sneha Roy','9900001002','Google','CFC Noida','BJJ','new'),
  ('Amit Sharma','9900001003','Friend','CFC Delhi','Boxing','called'),
  ('Ritika Mehta','9900001004','YouTube','CFC Faridabad','Muay Thai','called'),
  ('Karan Bhatia','9900001005','Instagram','CFC Delhi','Muay Thai','trial_booked'),
  ('Isha Nair','9900001006','Google','CFC Noida','BJJ','trial_booked'),
  ('Nitin Lal','9900001007','Friend','CFC Delhi','Boxing','attended'),
  ('Meera Gupta','9900001008','Instagram','CFC Noida','BJJ','attended'),
  ('Arun Chopra','9900001009','Google','CFC Delhi','MMA','converted'),
  ('Riya Fernandes','9900001010','YouTube','CFC Faridabad','Muay Thai','converted'),
  ('Suresh Pillai','9900001011','Facebook','CFC Noida','Kickboxing','lost')
) as t(name, phone, source, center_name, discipline, status);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (basic - open for now)
-- ============================================
alter table members enable row level security;
alter table leads enable row level security;
alter table attendance enable row level security;
alter table bookings enable row level security;
alter table follow_ups enable row level security;
alter table posts enable row level security;

-- Allow all operations for now (tighten later with auth)
create policy "Allow all" on members for all using (true) with check (true);
create policy "Allow all" on leads for all using (true) with check (true);
create policy "Allow all" on attendance for all using (true) with check (true);
create policy "Allow all" on bookings for all using (true) with check (true);
create policy "Allow all" on follow_ups for all using (true) with check (true);
create policy "Allow all" on posts for all using (true) with check (true);
create policy "Allow all" on centers for all using (true) with check (true);
create policy "Allow all" on disciplines for all using (true) with check (true);
create policy "Allow all" on classes for all using (true) with check (true);
create policy "Allow all" on badges for all using (true) with check (true);
create policy "Allow all" on member_disciplines for all using (true) with check (true);
