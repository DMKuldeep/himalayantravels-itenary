-- ============================================
-- THE HIMALAYAN TRAVELS - SUPABASE SQL SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DESTINATIONS TABLE
-- ============================================
CREATE TABLE destinations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  state TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  banner_url TEXT,
  featured BOOLEAN DEFAULT false,
  package_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PACKAGES TABLE
-- ============================================
CREATE TABLE packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  destination_name TEXT,
  tour_type TEXT CHECK (tour_type IN ('honeymoon','family','adventure','group','solo','pilgrimage','weekend','long')),
  duration_days INT NOT NULL,
  duration_nights INT NOT NULL,
  price_per_person INT NOT NULL,
  original_price INT,
  max_people INT DEFAULT 20,
  min_people INT DEFAULT 1,
  description TEXT,
  highlights TEXT[] DEFAULT '{}',
  inclusions TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  itinerary JSONB DEFAULT '[]',
  images TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy','moderate','challenging')) DEFAULT 'easy',
  best_season TEXT,
  start_location TEXT,
  end_location TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  badge TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  bookings_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENQUIRIES TABLE
-- ============================================
CREATE TABLE enquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  destination TEXT,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  package_name TEXT,
  travel_date DATE,
  num_people INT DEFAULT 1,
  tour_type TEXT,
  budget TEXT,
  message TEXT,
  status TEXT CHECK (status IN ('new','contacted','converted','closed')) DEFAULT 'new',
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  review_text TEXT,
  travel_date DATE,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BLOG POSTS TABLE
-- ============================================
CREATE TABLE blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author TEXT DEFAULT 'The Himalayan Travels Team',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================
CREATE TABLE site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('contact', '{"phone": "+91 98XXX XXXXX", "email": "info@thehimalayantravels.com", "whatsapp": "919876543210", "address": "Gurugram, Haryana, India"}'),
  ('hero', '{"title": "Discover the Himalayas", "subtitle": "Like Never Before", "description": "Handcrafted tour packages to Himachal Pradesh, Ladakh, Uttarakhand & beyond."}'),
  ('stats', '{"travellers": "5000+", "packages": "120+", "destinations": "25+", "experience": "14"}');

-- ============================================
-- ADMIN PROFILES TABLE
-- ============================================
CREATE TABLE admin_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin','super_admin')) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Public can read active packages
CREATE POLICY "Public read active packages" ON packages
  FOR SELECT USING (is_active = true);

-- Public can read destinations
CREATE POLICY "Public read destinations" ON destinations
  FOR SELECT USING (true);

-- Public can read published blogs
CREATE POLICY "Public read published blogs" ON blog_posts
  FOR SELECT USING (is_published = true);

-- Public can read site settings
CREATE POLICY "Public read settings" ON site_settings
  FOR SELECT USING (true);

-- Public can read approved reviews
CREATE POLICY "Public read approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

-- Public can insert enquiries
CREATE POLICY "Public insert enquiries" ON enquiries
  FOR INSERT WITH CHECK (true);

-- Public can insert reviews
CREATE POLICY "Public insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Admin full access (check admin_profiles)
CREATE POLICY "Admin full access packages" ON packages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin full access destinations" ON destinations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin full access enquiries" ON enquiries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin full access reviews" ON reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin full access blogs" ON blog_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin full access settings" ON site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin read own profile" ON admin_profiles
  FOR SELECT USING (id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_blog_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SAMPLE DATA
-- ============================================

INSERT INTO destinations (name, slug, state, description, featured) VALUES
  ('Leh Ladakh', 'leh-ladakh', 'Jammu & Kashmir', 'Land of high passes and Buddhist monasteries', true),
  ('Manali', 'manali', 'Himachal Pradesh', 'Snow-capped peaks and adventure paradise', true),
  ('Spiti Valley', 'spiti-valley', 'Himachal Pradesh', 'Cold desert mountain valley', true),
  ('Kedarnath', 'kedarnath', 'Uttarakhand', 'Sacred Himalayan pilgrimage', true),
  ('Kasol', 'kasol', 'Himachal Pradesh', 'Trekker''s paradise in Parvati Valley', false),
  ('Rishikesh', 'rishikesh', 'Uttarakhand', 'Yoga and adventure capital', false),
  ('Shimla', 'shimla', 'Himachal Pradesh', 'Queen of Hill Stations', true),
  ('Nainital', 'nainital', 'Uttarakhand', 'City of lakes', false);

INSERT INTO packages (title, slug, destination_name, tour_type, duration_days, duration_nights, price_per_person, original_price, description, highlights, inclusions, exclusions, thumbnail_url, is_featured, badge, rating, review_count, best_season, difficulty) VALUES
  ('Leh Ladakh Road Trip', 'leh-ladakh-road-trip', 'Leh Ladakh', 'adventure', 8, 7, 28500, 34000, 'The ultimate Himalayan road trip from Manali to Leh via some of the world''s highest motorable roads. Experience Pangong Tso, Nubra Valley, and ancient monasteries.', ARRAY['Pangong Tso Lake','Nubra Valley','Khardung La Pass','Ancient Monasteries','Rohtang Pass'], ARRAY['Accommodation (7 nights)','All meals (breakfast & dinner)','Tempo Traveller/SUV transport','Experienced local guide','Inner Line Permits','First Aid kit'], ARRAY['Airfare','Personal expenses','Travel insurance','Anything not mentioned in inclusions'], '/images/ladakh.jpg', true, 'Bestseller', 4.8, 124, 'May - September', 'moderate'),
  ('Shimla Manali Honeymoon', 'shimla-manali-honeymoon', 'Manali', 'honeymoon', 6, 5, 22000, 26000, 'A romantic escape through the misty mountains of Himachal Pradesh. Perfect blend of scenic beauty, cozy hotels, and couple activities.', ARRAY['Rohtang Pass Snow Point','Solang Valley','Mall Road Shimla','Hadimba Temple','Cable Car Ride','Candlelight Dinner'], ARRAY['Deluxe hotel stays (5 nights)','Breakfast & dinner','Private cab','Couple welcome amenities','Sightseeing as per itinerary'], ARRAY['Airfare','Rohtang Pass permit','Personal expenses','Lunch'], '/images/manali.jpg', true, 'Honeymoon', 4.9, 89, 'October - June', 'easy'),
  ('Spiti Valley Expedition', 'spiti-valley-expedition', 'Spiti Valley', 'adventure', 10, 9, 35000, 42000, 'Journey through the cold desert of Spiti, visiting ancient monasteries, camping under starlit skies, and experiencing life at 14,000 feet.', ARRAY['Key Monastery','Chandratal Lake','Kaza Town','Pin Valley','Chicham Bridge','Star Gazing Camp'], ARRAY['Camping & hotel accommodation','All meals','SUV transport','Expert mountaineer guide','Camping gear','Oxygen cylinder (emergency)'], ARRAY['Airfare','Personal trekking gear','Travel insurance','Alcoholic beverages'], '/images/spiti.jpg', true, 'Adventure', 4.7, 67, 'June - October', 'challenging'),
  ('Char Dham Yatra', 'char-dham-yatra', 'Kedarnath', 'pilgrimage', 12, 11, 42000, 50000, 'Complete the sacred circuit of Yamunotri, Gangotri, Kedarnath, and Badrinath — the four most important Hindu pilgrimage sites in Uttarakhand.', ARRAY['Kedarnath Temple','Badrinath Temple','Gangotri Glacier','Yamunotri Kund','Helicopter Option Available','Puja Arrangements'], ARRAY['Hotel & dharamshala stays','All meals','Deluxe bus/tempo traveller','Pooja samagri','Local guide','All permits'], ARRAY['Helicopter charges','Personal expenses','Porter charges','Travel insurance'], '/images/chardham.jpg', true, 'Spiritual', 4.9, 203, 'May - June, September', 'moderate'),
  ('Kasol Kheerganga Trek', 'kasol-kheerganga-trek', 'Kasol', 'adventure', 4, 3, 8500, 11000, 'A short and refreshing trek to the natural hot springs of Kheerganga, through dense forests and Parvati Valley. Perfect for beginners.', ARRAY['Hot Spring Dip','Parvati River Camping','Chalal Village','Manikaran Gurudwara','Bonfires at Night'], ARRAY['Camping accommodation','All meals','Experienced trek guide','Camping equipment','Basic first aid'], ARRAY['Transport to Kasol','Personal expenses','Travel insurance'], '/images/kasol.jpg', false, 'Budget', 4.6, 145, 'March - June, Sept - Nov', 'easy'),
  ('Rishikesh Adventure Package', 'rishikesh-adventure', 'Rishikesh', 'adventure', 3, 2, 9500, 12000, 'Experience the thrill of white-water rafting, bungee jumping, and camping by the holy Ganga in the adventure capital of India.', ARRAY['White Water Rafting (16km)','Bungee Jumping','Flying Fox','Cliff Jumping','Ganga Aarti','Camping by River'], ARRAY['Camp stay (2 nights)','All meals','All adventure activities','Safety equipment','Guide'], ARRAY['Transport','Personal expenses','Any extra activities'], '/images/rishikesh.jpg', false, 'Thrill', 4.5, 98, 'September - June', 'moderate');
