import { createClerkSupabaseClientSsr } from '@/utils/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// update the progress_level of a specific product (dragged in kanban)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
	const { userId } = await auth();

	// Check if the user is authenticated
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

    const body = await request.json();

    console.log("body.progress_level", body.progress_level);
    console.log("params.id", params.id);

    const { data, error } = await supabase
        .from('products')
        .update({ progress_level: body.progress_level })
        .eq('id', params.id)
        .select();

    if (error) {
        console.log("error", error);
        throw new Error(error.message);
    }

    return NextResponse.json({ data }, { status: 200 });
}

// get a specific product by id
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const supabase = await createClerkSupabaseClientSsr();
    const productId = params.id; // Get the product ID from the URL

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId) // Fetch the specific product by ID
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
}