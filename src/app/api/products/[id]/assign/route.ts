import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { seamstressIds } = await request.json();
    const supabase = await createClerkSupabaseClientSsr();

    // delete any existing assignments that aren't in the new list
    const { error: deleteError } = await supabase
      .from("product_users")
      .delete()
      .eq("product_id", params.id)
      .not("user_id", "in", `(${seamstressIds.join(",")})`);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // create records for new assignments
    const productUserRecords = seamstressIds.map((seamstressId: string) => ({
      product_id: params.id,
      user_id: seamstressId,
      created_at: new Date().toISOString(),
    }));

    // upsert the records (insert if not exists, update if exists)
    const { data, error } = await supabase
      .from("product_users")
      .upsert(productUserRecords, {
        onConflict: "product_id,user_id", // Specify the unique constraint
        ignoreDuplicates: true, // Skip any duplicates
      })
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// add a DELETE endpoint to remove assignments
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { seamstressIds } = await request.json();
  const supabase = await createClerkSupabaseClientSsr();

  try {
    const { error } = await supabase
      .from("product_users")
      .delete()
      .eq("product_id", params.id)
      .in("user_id", seamstressIds);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
