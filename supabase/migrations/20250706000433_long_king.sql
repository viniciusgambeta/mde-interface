/*
  # Bookmark System Enhancement

  1. Functions
    - Function to check if video is bookmarked by user
    - Function to get user's bookmarked videos with full details

  2. Security
    - Ensure RLS policies are properly configured
    - Add indexes for better performance
*/

-- Function to check if a video is bookmarked by a user
CREATE OR REPLACE FUNCTION is_video_bookmarked(video_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_bookmarks 
    WHERE video_id = video_id_param AND user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get bookmarked videos count for a user
CREATE OR REPLACE FUNCTION get_user_bookmarks_count(user_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM user_bookmarks 
    WHERE user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add composite index for better bookmark queries performance
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_video 
ON user_bookmarks(user_id, video_id);

-- Add index for bookmark creation time queries
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at 
ON user_bookmarks(user_id, created_at DESC);

-- Ensure RLS policies are optimal for bookmark operations
DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON user_bookmarks;

CREATE POLICY "Users can view their own bookmarks"
  ON user_bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON user_bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON user_bookmarks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);