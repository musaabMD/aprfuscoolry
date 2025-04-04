// f2/app/api/exams/route.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the request body
    const body = await request.json();
    const { id, name, purchaseType } = body;
    
    // Create a Supabase client with server-side auth
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set(name, value, options);
          },
          remove(name, options) {
            cookieStore.delete(name);
          },
        },
      }
    );
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: ' + (userError?.message || 'No user found') }, 
        { status: 401 }
      );
    }

    // Check if exam exists using the provided ID
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .single();

    if (examError || !examData) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      );
    }

    // Check if user already has access to this exam
    const { data: existingAccess, error: accessCheckError } = await supabase
      .from('user_exam_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('exam_id', examData.id)
      .single();

    if (existingAccess) {
      return NextResponse.json(
        { error: 'You already have access to this exam' },
        { status: 400 }
      );
    }
    
    // Grant user access to exam
    const { data: accessData, error: accessError } = await supabase
      .from('user_exam_access')
      .insert({
        user_id: user.id,
        exam_id: examData.id,
        access_type: purchaseType || 'free'
      })
      .select()
      .single();
      
    if (accessError) {
      return NextResponse.json(
        { error: 'Failed to grant access: ' + accessError.message }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      exam: examData,
      access: accessData
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') }, 
      { status: 500 }
    );
  }
}

// Add GET endpoint to fetch available exams
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set(name, value, options);
          },
          remove(name, options) {
            cookieStore.delete(name);
          },
        },
      }
    );

    const { data: exams, error } = await supabase
      .from('exams')
      .select(`
        id,
        name,
        description,
        is_active,
        subjects (
          id,
          name
        )
      `)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw error;
    }

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}