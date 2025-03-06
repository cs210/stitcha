import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// get a specific product by id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClerkSupabaseClientSsr();
  const { id: productId } = await params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId) // Fetch the specific product by ID
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Return the data directly without wrapping it
  return NextResponse.json(data, { status: 200 });
}

// update the progress_level of a specific product (dragged in kanban)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const { id: productId } = await params;

  // Check if the user is authenticated
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClerkSupabaseClientSsr();

  const body = await request.json();

  const { data, error } = await supabase
    .from("products")
    .update({ progress_level: body.progress_level })
    .eq("id", productId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return NextResponse.json({ data }, { status: 200 });
}

// Delete a specific product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  // Check if the user is authenticated
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClerkSupabaseClientSsr();

  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
