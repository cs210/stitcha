import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Database } from '@/lib/types/supabase';

export async function GET() {
    try {
        // Get the user ID from Clerk auth
        const { userId } = await auth();

        // Optional: Check authentication if needed
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Create Supabase client using the helper
        const supabase = await createClerkSupabaseClientSsr();

        // Fetch all raw materials
        const { data, error } = await supabase
            .from("raw_materials")
            .select("*");

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: { message: 'Failed to fetch materials', details: error.message } },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { data, message: 'Materials retrieved successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            {
                error: {
                    message: 'An unexpected error occurred',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
  ) {
    const { userId } = await auth();
  
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const supabase = await createClerkSupabaseClientSsr();
  
    try {
      const body = await request.json();
      const { materialId, validate_status } = body;

      console.log("materialId", materialId);
  
      if (!materialId) {
        return NextResponse.json(
          { error: "Material ID is required" },
          { status: 400 }
        );
      }
  
      const { data, error } = await supabase
        .from("raw_materials")
        .update({ validated: validate_status })
        .eq('material_id', materialId)
        .select();
  
      if (error) {
        throw new Error(error.message);
      }
  
      return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
        { status: 500 }
      );
    }
  }