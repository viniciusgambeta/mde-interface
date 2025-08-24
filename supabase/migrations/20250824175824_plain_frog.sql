/*
  # Create video suggestion votes table

  1. New Tables
    - `video_suggestion_votes`
      - `id` (uuid, primary key)
      - `suggestion_id` (uuid, foreign key to video_suggestions)
      - `user_id` (uuid, foreign key to users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `video_suggestion_votes` table
    - Add policies for authenticated users to manage their own votes
    - Add trigger to update vote count in video_suggestions table

  3. Indexes
    - Index on suggestion_id for performance
    - Index on user_id for performance
    - Unique constraint on (suggestion_id, user_id) to prevent duplicate votes
*/

-- Create video suggestion votes table
CREATE TABLE IF NOT EXISTS video_suggestion_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id uuid NOT NULL REFERENCES video_suggestions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(suggestion_id, user_id)
);

-- Enable RLS
ALTER TABLE video_suggestion_votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own votes"
  ON video_suggestion_votes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_video_suggestion_votes_suggestion_id 
  ON video_suggestion_votes(suggestion_id);

CREATE INDEX IF NOT EXISTS idx_video_suggestion_votes_user_id 
  ON video_suggestion_votes(user_id);

-- Create function to update vote count
CREATE OR REPLACE FUNCTION update_suggestion_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE video_suggestions 
    SET votes = votes + 1 
    WHERE id = NEW.suggestion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE video_suggestions 
    SET votes = GREATEST(votes - 1, 0)
    WHERE id = OLD.suggestion_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_suggestion_votes_trigger
  AFTER INSERT OR DELETE ON video_suggestion_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_suggestion_vote_count();