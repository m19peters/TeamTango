-- TeamTango Storage Setup Script
-- Create storage bucket for team logos and set up security policies
-- Run this in your Supabase SQL Editor

-- Create storage bucket for team logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('team-logos', 'team-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for team logos
-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload team logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-logos');

-- Allow users to update their own team logos
CREATE POLICY "Users can update own team logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'team-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own team logos
CREATE POLICY "Users can delete own team logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'team-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow everyone to view team logos (public bucket)
CREATE POLICY "Anyone can view team logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'team-logos');

-- Verify storage setup
SELECT 'Team logos storage bucket created successfully!' as status;
SELECT name, public FROM storage.buckets WHERE id = 'team-logos'; 