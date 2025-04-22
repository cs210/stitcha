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
            .from("product_costs")
            .select("*");

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: { message: 'Failed to fetch product costs', details: error.message } },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { data, message: 'Product costs retrieved successfully' },
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