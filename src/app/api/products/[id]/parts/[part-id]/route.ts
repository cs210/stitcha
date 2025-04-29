import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string, "part-id": string }> }
) {
    try {
        const supabase = await createClerkSupabaseClientSsr();
        const { "part-id": partId } = await params;
        const { units_completed, seamstress_id, total_units } = await request.json();

        console.log("WITHIN API");
        console.log("PART ID", partId);
        console.log("UNITS COMPLETED", units_completed);
        console.log("TOTAL UNITS", total_units);
        console.log("SEAMSTRESS ID", seamstress_id);
        
        // Update the part
        const { data: updatedPart, error: updateError } = await supabase
            .from("product_parts")
            .update({
                units_completed,
                total_units,
                seamstress_id
            })
            .eq("part_id", partId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 400 });
        }

        return NextResponse.json({ data: updatedPart }, { status: 200 });

    } catch (error) {
        console.error("Error updating part:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string, "part-id": string }> }
) {
    const supabase = await createClerkSupabaseClientSsr();
    const { "part-id": partId } = await params;

    console.log("WITHIN DELETE API");
    console.log("PART ID", partId);

    // Delete the part
    const { error: deleteError } = await supabase
        .from("product_parts")
        .delete()
        .eq("part_id", partId);

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Part deleted successfully" }, { status: 200 });
}
