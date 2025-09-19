/*
  # Create video reports table

  1. New Tables
    - `video_reports`
      - `id` (uuid, primary key)
      - `video_id` (uuid, foreign key to videos)
      - `assinatura_id` (text, foreign key to assinaturas)
      - `report_content` (text, the report description)
      - `status` (text, report status: pending, reviewed, resolved)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `video_reports` table
    - Add policy for authenticated users to create their own reports
    - Add policy for authenticated users to read their own reports
    - Add policy for admins to manage all reports

  3. Indexes
    - Index on video_id for performance
    - Index on assinatura_id for performance
    - Index on status for filtering
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS video_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL,
  assinatura_id text NOT NULL,
  report_content text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT video_reports_status_check CHECK (status IN ('pending', 'reviewed', 'resolved'))
);

-- Add foreign key constraints
ALTER TABLE video_reports 
ADD CONSTRAINT video_reports_video_id_fkey 
FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE;

ALTER TABLE video_reports 
ADD CONSTRAINT video_reports_assinatura_id_fkey 
FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id_assinatura) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_reports_video_id ON video_reports(video_id);
CREATE INDEX IF NOT EXISTS idx_video_reports_assinatura_id ON video_reports(assinatura_id);
CREATE INDEX IF NOT EXISTS idx_video_reports_status ON video_reports(status);
CREATE INDEX IF NOT EXISTS idx_video_reports_created_at ON video_reports(created_at DESC);

-- Enable RLS
ALTER TABLE video_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own reports"
  ON video_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assinaturas 
      WHERE assinaturas.id_assinatura = video_reports.assinatura_id 
      AND assinaturas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their own reports"
  ON video_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assinaturas 
      WHERE assinaturas.id_assinatura = video_reports.assinatura_id 
      AND assinaturas.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all reports"
  ON video_reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assinaturas 
      WHERE assinaturas.user_id = auth.uid() 
      AND assinaturas."Status da assinatura" = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_video_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_reports_updated_at_trigger
  BEFORE UPDATE ON video_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_video_reports_updated_at();