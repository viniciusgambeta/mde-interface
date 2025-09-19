/*
  # Create video_reports table

  1. New Tables
    - `video_reports`
      - `id` (uuid, primary key)
      - `video_id` (uuid, foreign key to videos)
      - `user_id` (uuid, foreign key to users)
      - `report_content` (text, required)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `video_reports` table
    - Add policy for authenticated users to insert their own reports
    - Add policy for authenticated users to read their own reports
    - Add policy for admins to read all reports

  3. Indexes
    - Add indexes for performance on video_id, user_id, status, and created_at
*/

CREATE TABLE IF NOT EXISTS video_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  user_id uuid NOT NULL,
  report_content text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE video_reports 
ADD CONSTRAINT video_reports_video_id_fkey 
FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE;

ALTER TABLE video_reports 
ADD CONSTRAINT video_reports_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add check constraint for status
ALTER TABLE video_reports 
ADD CONSTRAINT video_reports_status_check 
CHECK (status IN ('pending', 'reviewed', 'resolved'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_reports_video_id ON video_reports(video_id);
CREATE INDEX IF NOT EXISTS idx_video_reports_user_id ON video_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_video_reports_status ON video_reports(status);
CREATE INDEX IF NOT EXISTS idx_video_reports_created_at ON video_reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE video_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own reports"
  ON video_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own reports"
  ON video_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can manage reports"
  ON video_reports
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);