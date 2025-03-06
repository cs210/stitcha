import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { seamstressId } = await request.json();
  const supabase = await createClerkSupabaseClientSsr();

  try {
    const { error } = await supabase
      .from("products")
      .update({ seamstress_id: seamstressId })
      .eq("id", params.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
