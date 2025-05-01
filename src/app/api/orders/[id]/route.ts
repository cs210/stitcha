import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Retrieves a specific order by id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	const { userId } = await auth();
	const { id: orderId } = await params;

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	// Get all product IDs associated with this order
	const { data, error } = await supabase
		.from('orders')
		.select('*')
		.eq('id', orderId)
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	return NextResponse.json(data, { status: 200 });
}

// // Updates a specific order's progress level
// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const { userId } = await auth();
//   const { id: orderId } = await params;

//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const body = await request.json();
//     const { progress_level } = body;

//     if (!progress_level) {
//       return NextResponse.json({ error: "Progress level is required" }, { status: 400 });
//     }

//     const supabase = await createClerkSupabaseClientSsr();

//     const { data, error } = await supabase
//       .from("orders")
//       .update({ progress_level })
//       .eq("id", orderId);

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 400 });
//     }

//     return NextResponse.json(data, { status: 200 });
//   } catch (error) {    
//     return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
//   }
// }

// Deletes a specific order by id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { userId } = await auth();
	const { id } = await params;

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	const { data, error } = await supabase.from("orders").delete().eq("id", id);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	return NextResponse.json(data, { status: 200 });
}

// Updates an order (progress level and/or products)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    const { id: orderId } = await params;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = await createClerkSupabaseClientSsr();
        const body = await request.json();
        let updateData = {};

        // Handle progress level update
        if (body.progress_level !== undefined) {
            const validProgressLevels = ['Not Started', 'In Progress', 'Done'];
            if (!validProgressLevels.includes(body.progress_level)) {
                return NextResponse.json({ 
                    error: `Invalid progress level. Must be one of: ${validProgressLevels.join(', ')}` 
                }, { status: 400 });
            }
            updateData = { ...updateData, progress_level: body.progress_level };
        }

        // Handle product removal
        if (body.productId) {
            // Get current order data
            const { data: currentOrder, error: fetchError } = await supabase
                .from("orders")
                .select("product_ids")
                .eq("id", orderId)
                .single();

            if (fetchError) {
                return NextResponse.json({ 
                    error: `Failed to fetch order data: ${fetchError.message}` 
                }, { status: 400 });
            }

            if (!currentOrder) {
                return NextResponse.json({ 
                    error: `Order with ID ${orderId} not found` 
                }, { status: 404 });
            }

            const currentProductIds = currentOrder.product_ids || [];
            if (!currentProductIds.includes(body.productId)) {
                return NextResponse.json({ 
                    error: `Product ${body.productId} is not associated with this order` 
                }, { status: 400 });
            }

            const updatedProductIds = currentProductIds.filter(id => id !== body.productId);
            updateData = { ...updateData, product_ids: updatedProductIds };
        }

        // If no valid update data provided
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ 
                error: "Request must include either progress_level or productId" 
            }, { status: 400 });
        }

        // Update the order
        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ 
                error: `Failed to update order: ${error.message}` 
            }, { status: 400 });
        }

        if (!data) {
            return NextResponse.json({ 
                error: `Order with ID ${orderId} not found` 
            }, { status: 404 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ 
            error: "Internal server error while updating order" 
        }, { status: 500 });
    }
}
