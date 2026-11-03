-- ====================================================================
-- MISTRI Database Seed Data
-- Initial Locations (Thakurgaon, Panchagarh, Dinajpur) & 12 Categories
-- ====================================================================

-- 1. Districts
INSERT INTO public.districts (id, name_bn, name_en, is_active) VALUES
('11111111-1111-1111-1111-111111111101', 'ঠাকুরগাঁও', 'Thakurgaon', true),
('11111111-1111-1111-1111-111111111102', 'পঞ্চগড়', 'Panchagarh', true),
('11111111-1111-1111-1111-111111111103', 'দিনাজপুর', 'Dinajpur', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Upazilas for Thakurgaon
INSERT INTO public.upazilas (district_id, name_bn, name_en) VALUES
('11111111-1111-1111-1111-111111111101', 'ঠাকুরগাঁও সদর', 'Thakurgaon Sadar'),
('11111111-1111-1111-1111-111111111101', 'পীরগঞ্জ', 'Pirganj'),
('11111111-1111-1111-1111-111111111101', 'রাণীশংকৈল', 'Ranisankail'),
('11111111-1111-1111-1111-111111111101', 'হরিপুর', 'Haripur'),
('11111111-1111-1111-1111-111111111101', 'বালিয়াডাঙ্গী', 'Baliadangi');

-- 3. Upazilas for Panchagarh
INSERT INTO public.upazilas (district_id, name_bn, name_en) VALUES
('11111111-1111-1111-1111-111111111102', 'পঞ্চগড় সদর', 'Panchagarh Sadar'),
('11111111-1111-1111-1111-111111111102', 'বোদা', 'Boda'),
('11111111-1111-1111-1111-111111111102', 'দেবীগঞ্জ', 'Debiganj'),
('11111111-1111-1111-1111-111111111102', 'আটোয়ারী', 'Atwari'),
('11111111-1111-1111-1111-111111111102', 'তেঁতুলিয়া', 'Tetulia');

-- 4. Upazilas for Dinajpur
INSERT INTO public.upazilas (district_id, name_bn, name_en) VALUES
('11111111-1111-1111-1111-111111111103', 'দিনাজপুর সদর', 'Dinajpur Sadar'),
('11111111-1111-1111-1111-111111111103', 'বীরগঞ্জ', 'Birganj'),
('11111111-1111-1111-1111-111111111103', 'কাহারোল', 'Kaharole'),
('11111111-1111-1111-1111-111111111103', 'বোচাগঞ্জ', 'Bochaganj'),
('11111111-1111-1111-1111-111111111103', 'বিরল', 'Birol'),
('11111111-1111-1111-1111-111111111103', 'চিরিরবন্দর', 'Chirirbandar'),
('11111111-1111-1111-1111-111111111103', 'পার্বতীপুর', 'Parbatipur'),
('11111111-1111-1111-1111-111111111103', 'ফুলবাড়ী', 'Fulbari'),
('11111111-1111-1111-1111-111111111103', 'নবাবগঞ্জ', 'Nawabganj'),
('11111111-1111-1111-1111-111111111103', 'বিরামপুর', 'Birampur'),
('11111111-1111-1111-1111-111111111103', 'হাকিমপুর', 'Hakimpur'),
('11111111-1111-1111-1111-111111111103', 'ঘোড়াঘাট', 'Ghoraghat'),
('11111111-1111-1111-1111-111111111103', 'খানসামা', 'Khansama');

-- 5. 12 Service Categories
INSERT INTO public.categories (id, name_bn, name_en, slug, display_order, icon_url) VALUES
('22222222-2222-2222-2222-222222222201', 'ইলেকট্রিক্যাল কাজ', 'Electrical Services', 'electrical-services', 1, 'Zap'),
('22222222-2222-2222-2222-222222222202', 'প্লাম্বিং সার্ভিস', 'Plumbing Services', 'plumbing-services', 2, 'Wrench'),
('22222222-2222-2222-2222-222222222203', 'রং করার কাজ', 'Painting Services', 'painting-services', 3, 'Paintbrush'),
('22222222-2222-2222-2222-222222222204', 'রাজমিস্ত্রীর কাজ', 'Masonry Services', 'masonry-services', 4, 'Hammer'),
('22222222-2222-2222-2222-222222222205', 'ঘরের টিনের কাজ', 'Tin Roofing Services', 'tin-roofing-services', 5, 'Home'),
('22222222-2222-2222-2222-222222222206', 'কাঠের কাজ', 'Carpentry Services', 'carpentry-services', 6, 'Axe'),
('22222222-2222-2222-2222-222222222207', 'ফার্নিচারের কাজ', 'Furniture Services', 'furniture-services', 7, 'Armchair'),
('22222222-2222-2222-2222-222222222208', 'এঙ্গেল মিস্ত্রী ও গ্রিল', 'Angle Iron & Metal Fabrication', 'metal-fabrication', 8, 'ShieldAlert'),
('22222222-2222-2222-2222-222222222209', 'থাই গ্লাস ও অ্যালুমিনিয়াম', 'Thai Glass & Aluminium Services', 'thai-glass-aluminium', 9, 'Layers'),
('22222222-2222-2222-2222-222222222210', 'ঘরের সিলিং কাজ', 'Ceiling Services', 'ceiling-services', 10, 'Maximize'),
('22222222-2222-2222-2222-222222222211', 'দৈনিক লেবার', 'Daily Labour Services', 'daily-labour', 11, 'Users'),
('22222222-2222-2222-2222-222222222212', 'অন্যান্য সেবা', 'Other Services', 'other-services', 12, 'MoreHorizontal')
ON CONFLICT (id) DO NOTHING;

-- 6. Subcategories
-- Electrical Subcategories
INSERT INTO public.subcategories (category_id, name_bn, name_en, slug, display_order) VALUES
('22222222-2222-2222-2222-222222222201', 'বাসা-বাড়ির ওয়্যারিং', 'House Wiring', 'house-wiring', 1),
('22222222-2222-2222-2222-222222222201', 'সুইচ ও সকেট মেরামত', 'Switch & Socket Repair', 'switch-socket-repair', 2),
('22222222-2222-2222-2222-222222222201', 'সিলিং ফ্যান ও লাইটিং ফিটিং', 'Fan & Lighting Fitting', 'fan-lighting-fitting', 3),
('22222222-2222-2222-2222-222222222201', 'সার্কিট ব্রেকার ও ডিবি বোর্ড', 'Distribution Board & Breaker', 'db-breaker', 4),
('22222222-2222-2222-2222-222222222201', 'আইপিএস ও জেনারেটর সংযোগ', 'IPS & Generator Setup', 'ips-generator', 5);

-- Plumbing Subcategories
INSERT INTO public.subcategories (category_id, name_bn, name_en, slug, display_order) VALUES
('22222222-2222-2222-2222-222222222202', 'পাইপ ফিটিং ও মেরামত', 'Pipe Fitting & Repair', 'pipe-fitting', 1),
('22222222-2222-2222-2222-222222222202', 'পানির মোটর ও পাম্প মেরামত', 'Water Pump Repair', 'water-pump-repair', 2),
('22222222-2222-2222-2222-222222222202', 'স্যানিটারি ও বাথরুম ফিটিংস', 'Sanitary & Bathroom Fitting', 'sanitary-fitting', 3),
('22222222-2222-2222-2222-222222222202', 'পানির ট্যাংক পরিষ্কার', 'Water Tank Cleaning', 'tank-cleaning', 4),
('22222222-2222-2222-2222-222222222202', 'পাইপলাইন লিকেজ সমাধান', 'Leakage Detection & Fix', 'leak-fix', 5);

-- Painting Subcategories
INSERT INTO public.subcategories (category_id, name_bn, name_en, slug, display_order) VALUES
('22222222-2222-2222-2222-222222222203', 'ঘরের ভেতরের দেয়াল রং', 'Interior Wall Painting', 'interior-paint', 1),
('22222222-2222-2222-2222-222222222203', 'বাইরের দেয়াল ও ওয়েদারকোট', 'Exterior Weathercoat', 'exterior-paint', 2),
('22222222-2222-2222-2222-222222222203', 'পুটিং ও প্রাইমার কাজ', 'Putty & Primer Work', 'putty-primer', 3),
('22222222-2222-2222-2222-222222222203', 'কাঠের বার্নিশ ও পলিশ', 'Wood Varnish & Polish', 'wood-varnish', 4);

-- Masonry Subcategories
INSERT INTO public.subcategories (category_id, name_bn, name_en, slug, display_order) VALUES
('22222222-2222-2222-2222-222222222204', 'ইট গাঁথুনি ও প্লাস্টার', 'Brick Laying & Plastering', 'brick-laying-plaster', 1),
('22222222-2222-2222-2222-222222222204', 'টাইলস ও মার্বেল ফিটিংস', 'Tiles & Marble Fitting', 'tiles-fitting', 2),
('22222222-2222-2222-2222-222222222204', 'ছাদ ঢালাই ও কংক্রিট কাজ', 'Roof Casting & Concrete', 'roof-casting', 3),
('22222222-2222-2222-2222-222222222204', 'বাউন্ডারি ওয়াল নির্মাণ', 'Boundary Wall Construction', 'boundary-wall', 4);

