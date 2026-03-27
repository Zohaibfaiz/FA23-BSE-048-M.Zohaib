-- ============================================================
-- AdFlow Pro — Seed Data Script
-- Inserts: packages, categories, cities, users (all roles),
--          seller profiles, ads (25), payments, learning questions
-- ============================================================

-- ---- PACKAGES ----
INSERT INTO public.packages (id, name, type, price, duration_days, featured_weight, homepage_visibility, category_priority, auto_refresh, refresh_interval_days, description, features) VALUES
  ('pkg-basic-001',   'Basic',    'basic',    999.00,  7,  1, FALSE, FALSE, FALSE, NULL, 'Perfect for quick promotions', '["7 days visibility","Standard listing","Basic support","1 image"]'),
  ('pkg-std-001',     'Standard', 'standard', 2499.00, 15, 2, FALSE, TRUE,  FALSE, NULL, 'Great for growing businesses', '["15 days visibility","Category priority","Manual refresh","3 images","WhatsApp button"]'),
  ('pkg-prem-001',    'Premium',  'premium',  4999.00, 30, 3, TRUE,  TRUE,  TRUE,  3,    'Maximum exposure for your brand', '["30 days visibility","Homepage featured","Auto-refresh every 3 days","5 images","Priority support","Verified badge"]');

-- ---- CATEGORIES ----
INSERT INTO public.categories (id, name, slug, description, icon, color, sort_order) VALUES
  ('cat-001', 'Real Estate',    'real-estate',    'Properties, plots, and rentals',     'Building2',    '#6366f1', 1),
  ('cat-002', 'Vehicles',       'vehicles',        'Cars, bikes, and transport',         'Car',          '#f59e0b', 2),
  ('cat-003', 'Electronics',    'electronics',     'Gadgets, phones, and appliances',    'Smartphone',   '#10b981', 3),
  ('cat-004', 'Services',       'services',        'Professional and personal services', 'Briefcase',    '#3b82f6', 4),
  ('cat-005', 'Fashion',        'fashion',         'Clothing, shoes, and accessories',   'ShoppingBag',  '#ec4899', 5),
  ('cat-006', 'Education',      'education',       'Courses, tutoring, and training',    'GraduationCap','#8b5cf6', 6),
  ('cat-007', 'Food & Dining',  'food-dining',     'Restaurants, catering, and food',    'UtensilsCrossed','#ef4444', 7),
  ('cat-008', 'Health',         'health',          'Clinics, medicines, and wellness',   'HeartPulse',   '#14b8a6', 8);

-- ---- CITIES ----
INSERT INTO public.cities (id, name, slug, province, sort_order) VALUES
  ('city-001', 'Karachi',     'karachi',     'Sindh',          1),
  ('city-002', 'Lahore',      'lahore',      'Punjab',         2),
  ('city-003', 'Islamabad',   'islamabad',   'ICT',            3),
  ('city-004', 'Rawalpindi',  'rawalpindi',  'Punjab',         4),
  ('city-005', 'Faisalabad',  'faisalabad',  'Punjab',         5),
  ('city-006', 'Multan',      'multan',      'Punjab',         6),
  ('city-007', 'Peshawar',    'peshawar',    'KPK',            7),
  ('city-008', 'Quetta',      'quetta',      'Balochistan',    8);

-- ---- LEARNING QUESTIONS ----
INSERT INTO public.learning_questions (question, options, correct_index, explanation, category) VALUES
  ('What is the maximum duration for a Premium package?',
   '["7 days","15 days","30 days","60 days"]', 2,
   'Premium packages last 30 days with auto-refresh every 3 days.', 'packages'),
  ('Which ad status comes after "Payment Verified"?',
   '["Published","Scheduled","Under Review","Draft"]', 1,
   'After payment is verified, an ad moves to Scheduled status before being Published.', 'lifecycle'),
  ('What does the rankScore formula use?',
   '["Only views","Featured status + package weight + freshness","Price only","Category alone"]', 1,
   'rankScore = featured bonus + package weight × 10 + freshness points + admin boost + verified seller points.', 'ranking'),
  ('Which package offers homepage visibility?',
   '["Basic","Standard","Premium","All packages"]', 2,
   'Only the Premium package gets homepage visibility with 3x featured weight.', 'packages'),
  ('What happens to expired ads?',
   '["They stay visible","They are permanently deleted","They are never shown publicly","They auto-renew"]', 2,
   'Expired ads are NEVER shown publicly — they are hidden from all public pages.', 'lifecycle');

-- NOTE: User accounts must be created via Supabase Auth first.
-- Run this after creating users in Supabase Auth:

-- Example user inserts (replace UUIDs with real ones from auth.users)
/*
INSERT INTO public.users (id, email, full_name, role) VALUES
  ('user-client-001',    'client@adflowpro.com',    'Ahmed Khan',      'client'),
  ('user-client-002',    'client2@adflowpro.com',   'Fatima Ali',      'client'),
  ('user-client-003',    'client3@adflowpro.com',   'Bilal Rao',       'client'),
  ('user-mod-001',       'mod@adflowpro.com',       'Sara Moderator',  'moderator'),
  ('user-admin-001',     'admin@adflowpro.com',     'Admin User',      'admin'),
  ('user-super-001',     'super@adflowpro.com',     'Super Admin',     'super_admin');

INSERT INTO public.seller_profiles (user_id, business_name, phone, city, is_verified) VALUES
  ('user-client-001', 'Ahmed Properties',    '+923001234567', 'Karachi',   TRUE),
  ('user-client-002', 'Fatima Electronics',  '+923007654321', 'Lahore',    FALSE),
  ('user-client-003', 'Bilal Motors',        '+923009876543', 'Islamabad', TRUE);

-- Sample ads (25 total)
INSERT INTO public.ads (id, slug, title, description, category_id, city_id, owner_id, package_id, status, is_featured, rank_score, publish_at, expire_at) VALUES
  ('ad-001', '3-bed-dha-karachi',        '3 Bedroom Apartment in DHA Karachi',         'Spacious 3-bed apartment...', 'cat-001', 'city-001', 'user-client-001', 'pkg-prem-001', 'published', TRUE,  90.5, NOW()-INTERVAL '1 day', NOW()+INTERVAL '29 days'),
  ('ad-002', 'honda-civic-2022-lahore',  'Honda Civic 2022 — Excellent Condition',     'Honda Civic oriel...', 'cat-002', 'city-002', 'user-client-001', 'pkg-std-001',  'published', FALSE, 45.0, NOW()-INTERVAL '2 days', NOW()+INTERVAL '13 days'),
  ('ad-003', 'iphone-15-pro-islamabad',  'iPhone 15 Pro Max 256GB',                    'Brand new sealed...', 'cat-003', 'city-003', 'user-client-002', 'pkg-prem-001', 'published', TRUE,  88.0, NOW()-INTERVAL '3 hours', NOW()+INTERVAL '30 days'),
  ('ad-004', 'web-dev-services-karachi', 'Professional Web Development Services',      'Full-stack dev...', 'cat-004', 'city-001', 'user-client-002', 'pkg-std-001',  'published', FALSE, 40.0, NOW()-INTERVAL '5 days', NOW()+INTERVAL '10 days'),
  ('ad-005', 'toyota-corolla-2020',      'Toyota Corolla 2020 Automatic',              'Low mileage...', 'cat-002', 'city-002', 'user-client-003', 'pkg-basic-001', 'published', FALSE, 20.0, NOW()-INTERVAL '1 day', NOW()+INTERVAL '6 days'),
  ('ad-006', 'plot-bahria-islamabad',    'Plot For Sale in Bahria Town Islamabad',     '10 Marla plot...', 'cat-001', 'city-003', 'user-client-001', 'pkg-prem-001', 'published', TRUE,  92.0, NOW()-INTERVAL '6 hours', NOW()+INTERVAL '30 days'),
  ('ad-007', 'graphic-design-lahore',   'Graphic Designer Available Freelance',       'Logo, branding...', 'cat-004', 'city-002', 'user-client-002', 'pkg-basic-001', 'published', FALSE, 15.0, NOW()-INTERVAL '3 days', NOW()+INTERVAL '4 days'),
  ('ad-008', 'samsung-s24-ultra',       'Samsung S24 Ultra 512GB Black',              'Sealed box...', 'cat-003', 'city-001', 'user-client-003', 'pkg-std-001',  'published', FALSE, 42.0, NOW()-INTERVAL '1 day', NOW()+INTERVAL '14 days'),
  ('ad-009', 'catering-multan',         'Catering Services for Events in Multan',     'Weddings, parties...', 'cat-007', 'city-006', 'user-client-001', 'pkg-std-001',  'published', FALSE, 38.0, NOW()-INTERVAL '4 days', NOW()+INTERVAL '11 days'),
  ('ad-010', 'matlab-tutor-islamabad',  'MATLAB & Python Tutor — Online/Onsite',      'Engineering student...', 'cat-006', 'city-003', 'user-client-002', 'pkg-basic-001', 'published', FALSE, 18.0, NOW()-INTERVAL '2 days', NOW()+INTERVAL '5 days'),
  ('ad-011', 'clinic-karachi-dermo',    'Dermatology Clinic — New Branch Karachi',    'Board certified...', 'cat-008', 'city-001', 'user-client-003', 'pkg-prem-001', 'published', FALSE, 65.0, NOW()-INTERVAL '2 days', NOW()+INTERVAL '28 days'),
  ('ad-012', 'suzuki-alto-2021',        'Suzuki Alto VXR 2021 — Low Mileage',         'First owner...', 'cat-002', 'city-005', 'user-client-001', 'pkg-basic-001', 'published', FALSE, 16.0, NOW()-INTERVAL '5 days', NOW()+INTERVAL '2 days'),
  ('ad-013', 'boutique-lahore',         'Designer Boutique — Bridal Collection 2025', 'Latest bridal wear...', 'cat-005', 'city-002', 'user-client-002', 'pkg-std-001',  'published', FALSE, 44.0, NOW()-INTERVAL '3 days', NOW()+INTERVAL '12 days'),
  ('ad-014', 'flat-rent-g11',           '2-Bed Flat for Rent in G-11 Islamabad',      'Ready to move...', 'cat-001', 'city-003', 'user-client-003', 'pkg-std-001',  'published', FALSE, 41.0, NOW()-INTERVAL '1 day', NOW()+INTERVAL '14 days'),
  ('ad-015', 'ac-repair-karachi',       'AC Repair & Service — Karachi',              '24/7 service...', 'cat-004', 'city-001', 'user-client-001', 'pkg-basic-001', 'published', FALSE, 14.0, NOW()-INTERVAL '6 days', NOW()+INTERVAL '1 day'),
  ('ad-016', 'laptop-dell-xps',         'Dell XPS 15 i7 32GB — Like New',             'Used 6 months...', 'cat-003', 'city-002', 'user-client-002', 'pkg-std-001',  'published', TRUE,  60.0, NOW()-INTERVAL '12 hours', NOW()+INTERVAL '15 days'),
  ('ad-017', 'restaurant-rwp',          'Family Restaurant Opening in Rawalpindi',    'Desi cuisine...', 'cat-007', 'city-004', 'user-client-003', 'pkg-prem-001', 'published', FALSE, 63.0, NOW()-INTERVAL '1 day', NOW()+INTERVAL '29 days'),
  ('ad-018', 'gym-membership-lahore',   'Premium Gym Membership — Lahore',            'State of art equipment...', 'cat-008', 'city-002', 'user-client-001', 'pkg-std-001',  'published', FALSE, 37.0, NOW()-INTERVAL '7 days', NOW()+INTERVAL '8 days'),
  ('ad-019', 'honda-125-2023',          'Honda CG125 2023 — Original Paint',          'Company maintained...', 'cat-002', 'city-006', 'user-client-002', 'pkg-basic-001', 'published', FALSE, 13.0, NOW()-INTERVAL '4 days', NOW()+INTERVAL '3 days'),
  ('ad-020', 'online-quran-classes',    'Online Quran Classes — All Ages',            'Certified Qari...', 'cat-006', 'city-003', 'user-client-003', 'pkg-std-001',  'published', FALSE, 39.0, NOW()-INTERVAL '3 days', NOW()+INTERVAL '12 days'),
  ('ad-021', 'plot-dha-lahore',         'Plot for Sale in DHA Phase 6 Lahore',        '1 Kanal prime location...', 'cat-001', 'city-002', 'user-client-001', 'pkg-prem-001', 'published', TRUE,  95.0, NOW()-INTERVAL '2 hours', NOW()+INTERVAL '30 days'),
  ('ad-022', 'skin-clinic-islamabad',   'Advanced Skin Clinic — Islamabad',           'Laser, Botox...', 'cat-008', 'city-003', 'user-client-002', 'pkg-prem-001', 'published', FALSE, 68.0, NOW()-INTERVAL '1 day', NOW()+INTERVAL '29 days'),
  ('ad-023', 'samsung-tv-65',           '65" Samsung QLED 4K Smart TV',               'Brand new boxed...', 'cat-003', 'city-001', 'user-client-003', 'pkg-std-001',  'published', FALSE, 43.0, NOW()-INTERVAL '2 days', NOW()+INTERVAL '13 days'),
  ('ad-024', 'fashion-store-peshawar',  'Trendy Fashion Store — Peshawar',            'Men & women wear...', 'cat-005', 'city-007', 'user-client-001', 'pkg-std-001',  'published', FALSE, 36.0, NOW()-INTERVAL '5 days', NOW()+INTERVAL '10 days'),
  ('ad-025', 'seo-services-pk',         'SEO Services for Pakistani Businesses',      'Top Google rankings...', 'cat-004', 'city-002', 'user-client-002', 'pkg-prem-001', 'published', FALSE, 67.0, NOW()-INTERVAL '1 day', NOW()+INTERVAL '29 days');
*/
