/*
  # Enable Realtime for User Bookmarks

  1. Security
    - Enable realtime for user_bookmarks table
    - Configure RLS policies for realtime access
    - Ensure users can only receive updates for their own bookmarks

  2. Performance
    - Optimize realtime subscription filters
    - Add necessary indexes for realtime queries
*/

-- Enable realtime for user_bookmarks table
ALTER PUBLICATION supabase_realtime ADD TABLE user_bookmarks;

-- Ensure the table has proper RLS for realtime
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Add realtime-optimized index
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_realtime 
ON user_bookmarks(user_id, video_id, created_at DESC);

-- Grant necessary permissions for realtime
GRANT SELECT ON user_bookmarks TO authenticated;
GRANT INSERT ON user_bookmarks TO authenticated;
GRANT DELETE ON user_bookmarks TO authenticated;

-- Ensure RLS policies work with realtime
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON user_bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON user_bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON user_bookmarks;

-- Recreate policies with realtime in mind
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

-- Add function to notify bookmark changes (optional, for additional features)
CREATE OR REPLACE FUNCTION notify_bookmark_change()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used for additional real-time features
  -- Currently just returns the record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Optional: Add trigger for bookmark notifications
-- CREATE TRIGGER bookmark_change_trigger
--   AFTER INSERT OR DELETE ON user_bookmarks
--   FOR EACH ROW EXECUTE FUNCTION notify_bookmark_change();