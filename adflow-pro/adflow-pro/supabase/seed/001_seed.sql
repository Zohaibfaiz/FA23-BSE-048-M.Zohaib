-- ============================================================
-- AdFlow Pro — Seed Script
-- Creates: packages, categories, cities, sample users, 25 ads
-- ============================================================

-- ─── PACKAGES ───────────────────────────────────────────────
INSERT INTO packages (name, slug, price, duration_days, homepage_visibility, featured_weight, refresh_rule, description, features, sort_order) VALUES
('Basic',    'basic',    999,   7,  FALSE, 1, 'none',        'Perfect for quick listings', '["7-day listing","Category visibility","Basic support","1 image URL"]', 1),
('Standard', 'standard', 2499, 15, FALSE, 2, 'manual',       'Great for growing businesses', '["15-day listing","Category priority","Email support","3 image URLs","Manual refresh"]', 2),
('Premium',  'premium',  4999, 30, TRUE,  3, 'auto_3days',   'Maximum exposure & results', '["30-day listing","Homepage visibility","Priority support","5 image URLs","Auto-refresh every 3 days","Featured badge","3x ranking boost"]', 3)
ON CONFLICT DO NOTHING;

-- ─── CATEGORIES ─────────────────────────────────────────────
INSERT INTO categories (name, slug, icon, description) VALUES
('Real Estate',     'real-estate',     'Home',         'Properties, plots & rental listings'),
('Vehicles',        'vehicles',        'Car',          'Cars, bikes, trucks & auto parts'),
('Electronics',     'electronics',     'Laptop',       'Mobile phones, laptops & gadgets'),
('Jobs',            'jobs',            'Briefcase',    'Full-time, part-time & freelance jobs'),
('Services',        'services',        'Wrench',       'Home services, repairs & professional help'),
('Fashion',         'fashion',         'Shirt',        'Clothing, shoes & accessories'),
('Food & Dining',   'food-dining',     'UtensilsCrossed', 'Restaurants, food items & catering'),
('Education',       'education',       'GraduationCap','Tutoring, courses & study material'),
('Sports & Hobbies','sports-hobbies',  'Dumbbell',     'Sports equipment & hobby items'),
('Furniture',       'furniture',       'Sofa',         'Home & office furniture')
ON CONFLICT DO NOTHING;

-- ─── CITIES ─────────────────────────────────────────────────
INSERT INTO cities (name, slug, province) VALUES
('Islamabad',   'islamabad',   'ICT'),
('Karachi',     'karachi',     'Sindh'),
('Lahore',      'lahore',      'Punjab'),
('Rawalpindi',  'rawalpindi',  'Punjab'),
('Peshawar',    'peshawar',    'KPK'),
('Multan',      'multan',      'Punjab'),
('Faisalabad',  'faisalabad',  'Punjab'),
('Quetta',      'quetta',      'Balochistan'),
('Sialkot',     'sialkot',     'Punjab'),
('Hyderabad',   'hyderabad',   'Sindh')
ON CONFLICT DO NOTHING;

-- ─── LEARNING QUESTIONS ─────────────────────────────────────
INSERT INTO learning_questions (question, options, correct_key, explanation, category, difficulty) VALUES
('Which package gives homepage visibility on AdFlow Pro?',
 '[{"label":"Basic","value":"basic"},{"label":"Standard","value":"standard"},{"label":"Premium","value":"premium"},{"label":"All packages","value":"all"}]',
 'premium', 'The Premium package offers homepage visibility along with 3x ranking boost.', 'platform', 'easy'),
('How long does the Standard package last?',
 '[{"label":"7 days","value":"7"},{"label":"15 days","value":"15"},{"label":"30 days","value":"30"},{"label":"60 days","value":"60"}]',
 '15', 'Standard package provides 15 days of listing visibility with category priority.', 'platform', 'easy'),
('What happens to expired ads on AdFlow Pro?',
 '[{"label":"Auto-renew","value":"renew"},{"label":"Never shown publicly","value":"hidden"},{"label":"Move to draft","value":"draft"},{"label":"Deleted","value":"deleted"}]',
 'hidden', 'Expired ads are NEVER shown publicly to protect listing quality.', 'platform', 'medium')
ON CONFLICT DO NOTHING;

-- ─── NOTE: Sample Users ──────────────────────────────────────
-- Create these via Supabase Auth → Email sign-up or use:
-- supabase auth admin create-user --email client@demo.com --password demo1234
-- Then update role in public.users table:
-- UPDATE public.users SET role='moderator' WHERE email='mod@demo.com';

-- ─── SAMPLE ADS (25 ads — status: published for demo) ───────
-- These reference the first available package/category/city
-- In production, link to real user IDs

DO $$
DECLARE
  basic_pkg    UUID;
  std_pkg      UUID;
  prem_pkg     UUID;
  cat_re       UUID;
  cat_veh      UUID;
  cat_elec     UUID;
  cat_jobs     UUID;
  cat_serv     UUID;
  cat_fashion  UUID;
  cat_food     UUID;
  cat_edu      UUID;
  cat_sport    UUID;
  cat_furn     UUID;
  city_isb     UUID;
  city_khi     UUID;
  city_lhr     UUID;
  city_rwp     UUID;
  city_psh     UUID;
  -- Dummy user (you MUST replace this with a real user id from auth.users)
  demo_user    UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  SELECT id INTO basic_pkg FROM packages WHERE slug='basic'    LIMIT 1;
  SELECT id INTO std_pkg   FROM packages WHERE slug='standard' LIMIT 1;
  SELECT id INTO prem_pkg  FROM packages WHERE slug='premium'  LIMIT 1;
  SELECT id INTO cat_re    FROM categories WHERE slug='real-estate'   LIMIT 1;
  SELECT id INTO cat_veh   FROM categories WHERE slug='vehicles'      LIMIT 1;
  SELECT id INTO cat_elec  FROM categories WHERE slug='electronics'   LIMIT 1;
  SELECT id INTO cat_jobs  FROM categories WHERE slug='jobs'          LIMIT 1;
  SELECT id INTO cat_serv  FROM categories WHERE slug='services'      LIMIT 1;
  SELECT id INTO cat_fashion FROM categories WHERE slug='fashion'     LIMIT 1;
  SELECT id INTO cat_food  FROM categories WHERE slug='food-dining'   LIMIT 1;
  SELECT id INTO cat_edu   FROM categories WHERE slug='education'     LIMIT 1;
  SELECT id INTO cat_sport FROM categories WHERE slug='sports-hobbies' LIMIT 1;
  SELECT id INTO cat_furn  FROM categories WHERE slug='furniture'     LIMIT 1;
  SELECT id INTO city_isb  FROM cities WHERE slug='islamabad'   LIMIT 1;
  SELECT id INTO city_khi  FROM cities WHERE slug='karachi'     LIMIT 1;
  SELECT id INTO city_lhr  FROM cities WHERE slug='lahore'      LIMIT 1;
  SELECT id INTO city_rwp  FROM cities WHERE slug='rawalpindi'  LIMIT 1;
  SELECT id INTO city_psh  FROM cities WHERE slug='peshawar'    LIMIT 1;

  -- Insert 25 sample ads (replace demo_user with real UUID after auth setup)
  INSERT INTO ads (slug, title, description, price, price_label, contact_phone, city_id, category_id, package_id, user_id, status, publish_at, expire_at, published_at, is_featured)
  VALUES
  ('luxury-apartment-f7-islamabad','3BHK Luxury Apartment in F-7','Stunning fully furnished apartment in the heart of Islamabad. 3 bedrooms, 2 bathrooms, modern kitchen, 24/7 security.',85000,'PKR 85,000/month','03001234567',city_isb,cat_re,prem_pkg,demo_user,'published',NOW()-interval'2 days',NOW()+interval'28 days',NOW()-interval'2 days',TRUE),
  ('honda-civic-2021-lahore','Honda Civic 2021 — Excellent Condition','Original auction car, single owner, full book. 1600cc, automatic, silver, 58000 km. All Punjab registered.',4200000,'PKR 42 Lakh',   '03111234567',city_lhr,cat_veh,std_pkg,demo_user,'published',NOW()-interval'3 days',NOW()+interval'12 days',NOW()-interval'3 days',FALSE),
  ('iphone-15-pro-karachi',       'iPhone 15 Pro — 256GB Natural Titanium','Brand new, factory sealed, US spec with all accessories. 1 year Apple warranty.',320000,'PKR 3,20,000',   '03211234567',city_khi,cat_elec,prem_pkg,demo_user,'published',NOW()-interval'1 day', NOW()+interval'29 days',NOW()-interval'1 day', TRUE),
  ('graphic-designer-job-isb',    'Senior Graphic Designer Needed','Creative agency in Islamabad seeks talented graphic designer. 3+ years exp, Figma & Adobe Suite required. PKR 80-120k salary.',120000,'PKR 80k–120k/mo','03451234567',city_isb,cat_jobs,std_pkg,demo_user,'published',NOW()-interval'4 days',NOW()+interval'11 days',NOW()-interval'4 days',FALSE),
  ('home-cleaning-service-rawalpindi','Professional Home Cleaning Service','Trained, background-checked cleaners. Deep clean, regular clean, move-in/out packages available. Serving all Rawalpindi sectors.',5000,'PKR 5,000 onwards','03331234567',city_rwp,cat_serv,basic_pkg,demo_user,'published',NOW()-interval'5 days',NOW()+interval'2 days', NOW()-interval'5 days',FALSE),
  ('villa-dha-karachi',           'DHA Phase 6 — 500 Sq Yd Villa','Immaculate 6-bedroom corner villa. Double unit, prime location. Ideal for large families or investment.',95000000,'PKR 9.5 Crore','03021234567',city_khi,cat_re,prem_pkg,demo_user,'published',NOW()-interval'6 days',NOW()+interval'24 days',NOW()-interval'6 days',TRUE),
  ('samsung-galaxy-s24-lahore',   'Samsung Galaxy S24 Ultra — 512GB','Brand new sealed box. Titanium Black. All accessories. Original Samsung warranty.',265000,'PKR 2,65,000','03051234567',city_lhr,cat_elec,std_pkg,demo_user,'published',NOW()-interval'7 days',NOW()+interval'8 days', NOW()-interval'7 days',FALSE),
  ('suzuki-alto-2023-islamabad',  'Suzuki Alto VXR 2023 — Factory Condition','Only 12000 km. Pearl White. AGS auto. Immaculate inside out.',3500000,'PKR 35 Lakh','03011234567',city_isb,cat_veh,std_pkg,demo_user,'published',NOW()-interval'2 days',NOW()+interval'13 days',NOW()-interval'2 days',FALSE),
  ('zara-branded-clothes-karachi','Zara & H&M Original Branded Clothes','Mix lot of branded imported clothing. Men/women both. All sizes available. Wholesale price.',2500,'PKR 2,500/piece','03221234567',city_khi,cat_fashion,basic_pkg,demo_user,'published',NOW()-interval'3 days',NOW()+interval'4 days', NOW()-interval'3 days',FALSE),
  ('nodejs-developer-job-lahore', 'Node.js / React Developer — Remote OK','Tech startup hiring mid-senior full-stack developer. Node.js, React, MongoDB, REST APIs. Fully remote possible.',150000,'PKR 1.5 Lakh/mo','03061234567',city_lhr,cat_jobs,std_pkg,demo_user,'published',NOW()-interval'1 day', NOW()+interval'14 days',NOW()-interval'1 day', TRUE),
  ('tutoring-maths-physics-isb',  'Expert Math & Physics Tutor — O/A Levels','Cambridge qualified tutor with 10+ years exp. O-Level, A-Level, MDCAT prep. Home visits + online sessions.',4000,'PKR 4,000/hr','03421234567',city_isb,cat_edu,basic_pkg,demo_user,'published',NOW()-interval'8 days',NOW()+interval'-1 days',NOW()-interval'8 days',FALSE),
  ('food-catering-service-psh',   'Wedding & Event Catering — Peshawar','Traditional & continental menu. 200–2000+ guests. 15 years experience. Book now for Eid & wedding season.',250000,'PKR 2,50,000 onwards','03091234567',city_psh,cat_food,std_pkg,demo_user,'published',NOW()-interval'4 days',NOW()+interval'11 days',NOW()-interval'4 days',FALSE),
  ('laptop-dell-xps15-rawalpindi','Dell XPS 15 — i9 / RTX 4070 / 32GB RAM','Ultra high-performance laptop. Barely used 3 months. Complete box. Perfect for developers & designers.',350000,'PKR 3,50,000','03311234567',city_rwp,cat_elec,basic_pkg,demo_user,'published',NOW()-interval'9 days',NOW()+interval'-2 days',NOW()-interval'9 days',FALSE),
  ('gym-equipment-set-lahore',    'Complete Home Gym Equipment Set','Dumbbells (5–50kg), barbell, squat rack, bench, pull-up bar. High quality steel. Like new condition.',120000,'PKR 1,20,000','03071234567',city_lhr,cat_sport,basic_pkg,demo_user,'published',NOW()-interval'5 days',NOW()+interval'2 days', NOW()-interval'5 days',FALSE),
  ('sofa-set-7seater-karachi',    'Royal 7-Seater Sofa Set — Solid Wood','Carved solid wood frame, premium velvet upholstery. Almost new condition (3 months old). Moving sale.',85000,'PKR 85,000','03231234567',city_khi,cat_furn,basic_pkg,demo_user,'published',NOW()-interval'2 days',NOW()+interval'5 days', NOW()-interval'2 days',FALSE),
  ('plumber-electrician-isb',     'Emergency Plumber & Electrician Service','24/7 available. All plumbing leaks, electrical faults, water heater, AC installation. Fast response.',2000,'PKR 2,000 onwards','03441234567',city_isb,cat_serv,basic_pkg,demo_user,'published',NOW()-interval'6 days',NOW()+interval'1 day',  NOW()-interval'6 days',FALSE),
  ('commercial-plot-bahria-isb',  'Bahria Town Islamabad — 8 Marla Commercial Plot','Prime location, Main Boulevard facing. Top investment opportunity. All utilities available.',22000000,'PKR 2.2 Crore','03031234567',city_isb,cat_re,prem_pkg,demo_user,'published',NOW()-interval'3 days',NOW()+interval'27 days',NOW()-interval'3 days',TRUE),
  ('kia-sportage-2022-lahore',    'Kia Sportage Alpha 2022 — 1st Owner','FWD Alpha variant. 42000 km. Pearl white. Complete service history. All Punjab registered.',9800000,'PKR 98 Lakh','03081234567',city_lhr,cat_veh,prem_pkg,demo_user,'published',NOW()-interval'4 days',NOW()+interval'26 days',NOW()-interval'4 days',TRUE),
  ('online-python-course-khi',    'Python & Data Science Bootcamp — Batch 12','Live online classes. 3-month program. Projects, certificate, job placement assistance. Beginner-friendly.',35000,'PKR 35,000','03241234567',city_khi,cat_edu,std_pkg,demo_user,'published',NOW()-interval'7 days',NOW()+interval'8 days', NOW()-interval'7 days',FALSE),
  ('nike-adidas-shoes-collection','Nike & Adidas Original Shoes — All Sizes','Imported original sneakers. Air Max, Jordan, Ultraboost. Wholesale & retail. Islamabad pickup or courier.',8000,'PKR 8,000–25,000','03431234567',city_isb,cat_fashion,std_pkg,demo_user,'published',NOW()-interval'1 day', NOW()+interval'14 days',NOW()-interval'1 day', FALSE),
  ('restaurant-for-sale-rwp',     'Running Restaurant For Sale — Rawalpindi','Fully operational fast food restaurant. Prime location, 40-seat capacity. Complete setup with kitchen equipment.',6500000,'PKR 65 Lakh','03321234567',city_rwp,cat_food,prem_pkg,demo_user,'published',NOW()-interval'5 days',NOW()+interval'25 days',NOW()-interval'5 days',TRUE),
  ('macbook-pro-m3-isb',         'MacBook Pro M3 Pro — 18GB/512GB SSD','Space Black. 2 months old. AppleCare valid. All accessories. Perfect condition, no scratches.',450000,'PKR 4,50,000','03451234567',city_isb,cat_elec,prem_pkg,demo_user,'published',NOW()-interval'2 days',NOW()+interval'28 days',NOW()-interval'2 days',TRUE),
  ('toyota-corolla-2020-khi',     'Toyota Corolla Altis 2020 — Grande','1800cc CVT auto. Original paint. 65000 km. Immaculate condition. Sindh number.',5600000,'PKR 56 Lakh','03221234567',city_khi,cat_veh,std_pkg,demo_user,'published',NOW()-interval'3 days',NOW()+interval'12 days',NOW()-interval'3 days',FALSE),
  ('yoga-fitness-classes-lhr',    'Morning Yoga & Zumba Classes — Lahore','Certified instructor. Morning batches 6–8 AM. DHA & Gulberg. Weight loss, flexibility, stress relief.',3000,'PKR 3,000/month','03091234567',city_lhr,cat_sport,basic_pkg,demo_user,'published',NOW()-interval'6 days',NOW()+interval'1 day',  NOW()-interval'6 days',FALSE),
  ('apartment-2bhk-gulshan-khi',  '2BHK Apartment — Gulshan-e-Iqbal Karachi','Modern design, 1200 sqft. Lift, backup generator, CCTV. Ideal for small families.',55000,'PKR 55,000/month','03211234567',city_khi,cat_re,std_pkg,demo_user,'published',NOW()-interval'4 days',NOW()+interval'11 days',NOW()-interval'4 days',FALSE);

  RAISE NOTICE '25 sample ads inserted successfully!';
END $$;
