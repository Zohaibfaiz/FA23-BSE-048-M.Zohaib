-- ============================================================
-- AdFlow Pro - Sample Data Seed Script
-- ⚠️ IMPORTANT: Run this AFTER creating auth users in Supabase Dashboard
-- See SEED_INSTRUCTIONS.md for complete setup steps
-- ============================================================

-- ============================================================
-- 1. ADD PAKISTANI CITIES
-- ============================================================
INSERT INTO public.cities (name, slug, state, country) VALUES
('Karachi', 'karachi', 'Sindh', 'Pakistan'),
('Lahore', 'lahore', 'Punjab', 'Pakistan'),
('Islamabad', 'islamabad', 'ICT', 'Pakistan'),
('Rawalpindi', 'rawalpindi', 'Punjab', 'Pakistan'),
('Faisalabad', 'faisalabad', 'Punjab', 'Pakistan'),
('Multan', 'multan', 'Punjab', 'Pakistan'),
('Peshawar', 'peshawar', 'KPK', 'Pakistan'),
('Quetta', 'quetta', 'Balochistan', 'Pakistan')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 2. SAMPLE ADS (Using existing auth users)
-- ============================================================

-- Get user IDs from auth.users
DO $$
DECLARE
  client_user_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get client user ID
  SELECT id INTO client_user_id FROM auth.users WHERE email = 'client@test.com' LIMIT 1;
  -- Get admin user ID  
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@adflow.com' LIMIT 1;

  -- Only insert if users exist
  IF client_user_id IS NOT NULL THEN
    
    -- Ad 1: iPhone (Premium Package)
    INSERT INTO public.ads (
      id, slug, title, description, user_id, package_id, category_id, city_id,
      status, contact_email, contact_phone, is_featured, rank_score,
      publish_at, expire_at
    ) VALUES (
      '10000000-0000-0000-0000-000000000001',
      'iphone-15-pro-max-' || EXTRACT(EPOCH FROM NOW())::bigint,
      'iPhone 15 Pro Max - 256GB - Brand New',
      'Brand new iPhone 15 Pro Max with 256GB storage. Complete box with all accessories. 1 year Apple warranty. Serious buyers only. Price: Rs 450,000',
      client_user_id,
      (SELECT id FROM public.packages WHERE tier = 'premium' LIMIT 1),
      (SELECT id FROM public.categories WHERE slug = 'technology' LIMIT 1),
      (SELECT id FROM public.cities WHERE slug = 'karachi' LIMIT 1),
      'published',
      'seller@example.com',
      '+92-300-1234567',
      true,
      85,
      NOW() - INTERVAL '2 days',
      NOW() + INTERVAL '28 days'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Ad 2: Apartment (Standard Package)
    INSERT INTO public.ads (
      id, slug, title, description, user_id, package_id, category_id, city_id,
      status, contact_email, contact_phone, is_featured, rank_score,
      publish_at, expire_at
    ) VALUES (
      '10000000-0000-0000-0000-000000000002',
      '3-bed-apartment-dha-' || EXTRACT(EPOCH FROM NOW())::bigint,
      '3 Bedroom Apartment in DHA - For Rent',
      'Spacious 3 bedroom apartment in DHA Phase 5. Modern amenities, parking, security. Rent: Rs 80,000/month. Available immediately.',
      client_user_id,
      (SELECT id FROM public.packages WHERE tier = 'standard' LIMIT 1),
      (SELECT id FROM public.categories WHERE slug = 'real-estate' LIMIT 1),
      (SELECT id FROM public.cities WHERE slug = 'lahore' LIMIT 1),
      'published',
      'property@example.com',
      '+92-321-9876543',
      false,
      65,
      NOW() - INTERVAL '5 days',
      NOW() + INTERVAL '10 days'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Ad 3: Car (Basic Package)
    INSERT INTO public.ads (
      id, slug, title, description, user_id, package_id, category_id, city_id,
      status, contact_email, contact_phone, is_featured, rank_score,
      publish_at, expire_at
    ) VALUES (
      '10000000-0000-0000-0000-000000000003',
      'honda-civic-2020-' || EXTRACT(EPOCH FROM NOW())::bigint,
      'Honda Civic 2020 - Excellent Condition',
      'Honda Civic 2020 model in excellent condition. Only 25,000 km driven. First owner. All service records available. Price: Rs 5,500,000',
      client_user_id,
      (SELECT id FROM public.packages WHERE tier = 'basic' LIMIT 1),
      (SELECT id FROM public.categories WHERE slug = 'vehicles' LIMIT 1),
      (SELECT id FROM public.cities WHERE slug = 'islamabad' LIMIT 1),
      'published',
      'cars@example.com',
      '+92-333-5555555',
      false,
      45,
      NOW() - INTERVAL '1 day',
      NOW() + INTERVAL '6 days'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Sample Payments (if admin exists)
    IF admin_user_id IS NOT NULL THEN
      INSERT INTO public.payments (
        ad_id, user_id, package_id, amount, currency, 
        transaction_ref, status, verified_at, verified_by
      ) VALUES
      (
        '10000000-0000-0000-0000-000000000001',
        client_user_id,
        (SELECT id FROM public.packages WHERE tier = 'premium' LIMIT 1),
        14999,
        'PKR',
        'TXN-PREMIUM-001',
        'verified',
        NOW() - INTERVAL '3 days',
        admin_user_id
      ),
      (
        '10000000-0000-0000-0000-000000000002',
        client_user_id,
        (SELECT id FROM public.packages WHERE tier = 'standard' LIMIT 1),
        6999,
        'PKR',
        'TXN-STANDARD-001',
        'verified',
        NOW() - INTERVAL '6 days',
        admin_user_id
      ),
      (
        '10000000-0000-0000-0000-000000000003',
        client_user_id,
        (SELECT id FROM public.packages WHERE tier = 'basic' LIMIT 1),
        2999,
        'PKR',
        'TXN-BASIC-001',
        'verified',
        NOW() - INTERVAL '2 days',
        admin_user_id
      )
      ON CONFLICT (transaction_ref) DO NOTHING;
    END IF;

    -- Sample Media
    INSERT INTO public.ad_media (ad_id, source_type, original_url, normalized_thumbnail_url, is_validated, display_order) VALUES
    ('10000000-0000-0000-0000-000000000001', 'direct_image', 'https://placehold.co/800x600/3b82f6/ffffff?text=iPhone+15+Pro', 'https://placehold.co/800x600/3b82f6/ffffff?text=iPhone+15+Pro', true, 0),
    ('10000000-0000-0000-0000-000000000002', 'direct_image', 'https://placehold.co/800x600/10b981/ffffff?text=Apartment+DHA', 'https://placehold.co/800x600/10b981/ffffff?text=Apartment+DHA', true, 0),
    ('10000000-0000-0000-0000-000000000003', 'direct_image', 'https://placehold.co/800x600/ef4444/ffffff?text=Honda+Civic', 'https://placehold.co/800x600/ef4444/ffffff?text=Honda+Civic', true, 0)
    ON CONFLICT DO NOTHING;

  END IF;
END $$;

-- ============================================================
-- VERIFICATION - Check what was inserted
-- ============================================================
SELECT 'Cities' as table_name, COUNT(*) as count FROM public.cities WHERE country = 'Pakistan'
UNION ALL
SELECT 'Ads', COUNT(*) FROM public.ads
UNION ALL
SELECT 'Payments', COUNT(*) FROM public.payments
UNION ALL
SELECT 'Ad Media', COUNT(*) FROM public.ad_media;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
-- If you see counts above, seed data was inserted successfully!
-- 
-- NEXT STEPS:
-- 1. Update .env.local with Supabase credentials
-- 2. Restart dev server: npm run dev
-- 3. Visit http://localhost:3000
-- 4. Login with: client@test.com / Client@123
-- ============================================================
