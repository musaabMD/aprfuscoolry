/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// A simple button to sign in with our providers (Google & Magic Links).
// It automatically redirects user to callbackUrl (config.auth.callbackUrl) after login, which is normally a private page for users to manage their accounts.
// If the user is already logged in, it will show their profile picture & redirect them to callbackUrl immediately.
export default function ButtonSignin({ extraStyle }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const [session, setSession] = useState(null);

  // Check if user is signed in
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/signin">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm" className={extraStyle}>
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={loading}
      className={extraStyle}
      size="sm"
    >
      {loading ? 'Loading...' : 'Sign Out'}
    </Button>
  );
}
