import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClerkSupabaseClientSsr();
        const { id } = await params;

        // First get the parts array from the product
        const { data: product, error: productError } = await supabase
            .from("products")
            .select("parts")
            .eq("id", id)
            .single();

        if (productError) {
            return NextResponse.json({ error: productError.message }, { status: 400 });
        }

        if (!product?.parts || product.parts.length === 0) {
            return NextResponse.json({ data: [] }, { status: 200 });
        }

        // Then fetch all parts referenced by the UUIDs
        const { data: parts, error: partsError } = await supabase
            .from("product_parts")
            .select("*")
            .in("part_id", product.parts);

        if (partsError) {
            return NextResponse.json({ error: partsError.message }, { status: 400 });
        }

        return NextResponse.json({ data: parts }, { status: 200 });

    } catch (error) {
        console.error("Error fetching parts:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClerkSupabaseClientSsr();
    const { id } = await params;
    const { name, seamstress_id, total_units } = await request.json();

    // First create the new part
    const { data: newPart, error: createError } = await supabase
        .from("product_parts")
        .insert({
            part_name: name,
            seamstress_id: seamstress_id,
            units_completed: 0,
            total_units: total_units
        })
        .select()
        .single();

    if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Then get the current parts array from the product
    const { data: product, error: productError } = await supabase
        .from("products")
        .select("parts")
        .eq("id", id)
        .single();

    if (productError) {
        return NextResponse.json({ error: productError.message }, { status: 400 });
    }

    // Update the product with the new part ID added to parts array
    const updatedParts = product.parts ? [...product.parts, newPart.part_id] : [newPart.part_id];
    
    const { error: updateError } = await supabase
        .from("products")
        .update({ parts: updatedParts })
        .eq("id", id);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ data: newPart }, { status: 201 });
}
