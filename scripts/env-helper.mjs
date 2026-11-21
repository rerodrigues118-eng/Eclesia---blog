import fs from 'fs';

export function loadEnv(name) {
  if (process.env[name]) return process.env[name];
  try {
    if (fs.existsSync('.env')) {
      const text = fs.readFileSync('.env', 'utf8');
      const lines = text.split('\n');
      for (const line of lines) {
        const parts = line.split('=');
        if (parts[0] && parts[0].trim() === name) {
          return parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        }
      }
    }
  } catch {}
  return '';
}

export const SUPABASE_URL = loadEnv('VITE_SUPABASE_URL') || 'https://sdyytxnmdquriqsxuvhd.supabase.co';

export const ANON_KEY = loadEnv('VITE_SUPABASE_ANON_KEY') || loadEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeXl0eG5tZHF1cmlxc3h1dmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTQ4NDQsImV4cCI6MjEwMjEzMDg0NH0.5yJkOv41YkLvCc8goBjrHJZdzW_c8mUBlZ6gb9HvduI';

export const SERVICE_ROLE_KEY = loadEnv('SUPABASE_SERVICE_ROLE_KEY') || loadEnv('SERVICE_ROLE_KEY') || ANON_KEY;

export const SUPABASE_PAT = loadEnv('SUPABASE_ACCESS_TOKEN') || loadEnv('SUPABASE_PAT');
export const GROQ_API_KEY = loadEnv('GROQ_API_KEY') || loadEnv('GROK_API_KEY');
export const GEMINI_API_KEY = loadEnv('GEMINI_API_KEY');
