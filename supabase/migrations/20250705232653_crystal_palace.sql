/*
  # Video Platform Database Schema

  1. New Tables
    - `instructors` - Instructor profiles and information
    - `categories` - Video categories (Programming, Design, etc.)
    - `difficulty_levels` - Skill levels (Beginner, Intermediate, Advanced)
    - `videos` - Main video content table
    - `video_materials` - Downloadable materials and links for videos
    - `video_upvotes` - User upvotes/likes for videos
    - `user_bookmarks` - User saved/bookmarked videos
    - `video_views` - Track video view counts and analytics

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for authenticated users
    - Public read access for video content
    - User-specific access for bookmarks and upvotes

  3. Relationships
    - Videos belong to instructors and categories
    - Videos have difficulty levels
    - Users can bookmark and upvote videos
    - Videos have associated materials and view tracking
*/

-- Create instructors table
CREATE TABLE IF NOT EXISTS instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text,
  avatar_url text,
  social_instagram text,
  social_linkedin text,
  social_github text,
  social_website text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#ff7551',
  created_at timestamptz DEFAULT now()
);

-- Create difficulty levels table
CREATE TABLE IF NOT EXISTS difficulty_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  order_index integer NOT NULL,
  color text DEFAULT '#64748b',
  created_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  summary text,
  description text,
  thumbnail_url text,
  video_url text,
  duration_minutes integer DEFAULT 0,
  instructor_id uuid REFERENCES instructors(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  difficulty_level_id uuid REFERENCES difficulty_levels(id) ON DELETE SET NULL,
  is_featured boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  view_count integer DEFAULT 0,
  upvote_count integer DEFAULT 0,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create video materials table
CREATE TABLE IF NOT EXISTS video_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('download', 'link', 'document')),
  url text NOT NULL,
  file_size_mb numeric,
  icon text DEFAULT 'FileText',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create video upvotes table
CREATE TABLE IF NOT EXISTS video_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Create user bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Create video views table
CREATE TABLE IF NOT EXISTS video_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  watch_duration_seconds integer DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE difficulty_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to core content
CREATE POLICY "Public can read instructors"
  ON instructors FOR SELECT TO public USING (true);

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT TO public USING (true);

CREATE POLICY "Public can read difficulty levels"
  ON difficulty_levels FOR SELECT TO public USING (true);

CREATE POLICY "Public can read videos"
  ON videos FOR SELECT TO public USING (true);

CREATE POLICY "Public can read video materials"
  ON video_materials FOR SELECT TO public USING (true);

-- Create policies for user-specific actions
CREATE POLICY "Users can manage their own upvotes"
  ON video_upvotes FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookmarks"
  ON user_bookmarks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create video views"
  ON video_views FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own video views"
  ON video_views FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_instructor_id ON videos(instructor_id);
CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_difficulty_level_id ON videos(difficulty_level_id);
CREATE INDEX IF NOT EXISTS idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_view_count ON videos(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_videos_upvote_count ON videos(upvote_count DESC);
CREATE INDEX IF NOT EXISTS idx_video_materials_video_id ON video_materials(video_id);
CREATE INDEX IF NOT EXISTS idx_video_upvotes_video_id ON video_upvotes(video_id);
CREATE INDEX IF NOT EXISTS idx_video_upvotes_user_id ON video_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_video_id ON user_bookmarks(video_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON video_views(video_id);

-- Create function to update video counts
CREATE OR REPLACE FUNCTION update_video_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'video_upvotes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE videos SET upvote_count = upvote_count + 1 WHERE id = NEW.video_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE videos SET upvote_count = upvote_count - 1 WHERE id = OLD.video_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'video_views' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE videos SET view_count = view_count + 1 WHERE id = NEW.video_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update counts
CREATE TRIGGER update_video_upvote_count
  AFTER INSERT OR DELETE ON video_upvotes
  FOR EACH ROW EXECUTE FUNCTION update_video_counts();

CREATE TRIGGER update_video_view_count
  AFTER INSERT ON video_views
  FOR EACH ROW EXECUTE FUNCTION update_video_counts();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_instructors_updated_at
  BEFORE UPDATE ON instructors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();