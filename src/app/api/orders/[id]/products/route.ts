import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Retrieves all products associated with a specific order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    const { id: orderId } = await params;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClerkSupabaseClientSsr();

    // Get all product IDs associated with this order
    const { data, error } = await supabase
        .from('orders')
        .select('product_ids')
        .eq('id', orderId)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
        return NextResponse.json({ data: [] }, { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
} 

// Updates the products associated with a specific order
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    const { id: orderId } = await params;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get product IDs from request body
    const { product_ids } = await request.json();

    if (!Array.isArray(product_ids)) {
        return NextResponse.json(
            { error: "product_ids must be an array" },
            { status: 400 }
        );
    }

    const supabase = await createClerkSupabaseClientSsr();

    // Update the order with new product IDs
    const { data, error } = await supabase
        .from('orders')
        .update({ product_ids })
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 200 });
}
