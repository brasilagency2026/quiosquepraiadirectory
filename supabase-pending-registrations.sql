-- Table for pending registrations (admin approval flow)
CREATE TABLE pending_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT NOT NULL,
  verification_code TEXT,
  code_sent_at TIMESTAMPTZ,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approval_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;
-- No RLS policies: only accessible via service role (server-side API routes)
