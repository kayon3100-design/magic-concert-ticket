-- Move the 3 original GitHub seed tickets into Supabase.
-- Safe to run more than once: each INSERT checks whether the ticket already exists.

insert into public.tickets (title, event_date, location, note, tags, image_url)
select
  'Let''s Never Give A Sh*t',
  date '2026-08-27',
  'Ho Chi Minh City',
  'Một tấm vé màu hồng, được giữ lại như một mảnh ký ức trong bộ sưu tập concert.',
  array['Concert','HCMC','Memory']::text[],
  'https://kayon3100-design.github.io/magic-concert-ticket/ticket-pink.jpg'
where not exists (
  select 1 from public.tickets
  where title = 'Let''s Never Give A Sh*t'
    and image_url = 'https://kayon3100-design.github.io/magic-concert-ticket/ticket-pink.jpg'
);

insert into public.tickets (title, event_date, location, note, tags, image_url)
select
  'Anh Trai Vượt Ngàn Chông Gai 2026',
  date '2026-10-17',
  'The Global City',
  'Day 1 & Day 2 tại khu vực Phú Long – Bình Trưng và The Global City.',
  array['E-ticket','2026','The Global City']::text[],
  'https://kayon3100-design.github.io/magic-concert-ticket/ticket-anh-trai.jpg'
where not exists (
  select 1 from public.tickets
  where title = 'Anh Trai Vượt Ngàn Chông Gai 2026'
    and image_url = 'https://kayon3100-design.github.io/magic-concert-ticket/ticket-anh-trai.jpg'
);

insert into public.tickets (title, event_date, location, note, tags, image_url)
select
  'Giữa Một Vạn Tour · Chapter 5',
  date '2026-10-17',
  'Nhà Thi Đấu Phú Thọ',
  'Live experience của Phùng Khánh Linh tại Nhà Thi Đấu Phú Thọ.',
  array['Phùng Khánh Linh','Live','2026']::text[],
  'https://kayon3100-design.github.io/magic-concert-ticket/ticket-phung-khanh-linh.jpg'
where not exists (
  select 1 from public.tickets
  where title = 'Giữa Một Vạn Tour · Chapter 5'
    and image_url = 'https://kayon3100-design.github.io/magic-concert-ticket/ticket-phung-khanh-linh.jpg'
);
