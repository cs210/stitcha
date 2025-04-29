import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

// get a specific row in product_costs by id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClerkSupabaseClientSsr();
  const { id: productId } = await params;

  const { data, error } = await supabase
    .from("product_costs")
    .select("*")
    .eq("product_id", productId) // Fetch the specific product by ID
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Return the data directly without wrapping it
  return NextResponse.json(data, { status: 200 });
}
