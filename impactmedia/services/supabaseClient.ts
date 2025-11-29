import { createClient } from '@supabase/supabase-js';

// Safely access environment variables if available
const env = (import.meta as any).env || {};

// Configuration using provided credentials as defaults
// In a local development environment, these can be overridden by .env files
const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://cikvnixjqoocktepzlhk.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpa3ZuaXhqcW9vY2t0ZXB6bGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjE4MjgsImV4cCI6MjA3OTk5NzgyOH0.-faw-vB3xoi1NY3W5KbZxGrLplKivZFf8DFuTTt3y14';

if (!SUPABASE_URL.startsWith('http')) {
  console.error('Invalid Supabase URL configuration');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);