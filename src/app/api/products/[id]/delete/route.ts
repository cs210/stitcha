import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";

// Delete a specific product
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {

    const { id } = await params;
    const { userId } = await auth();

    console.log('DELETING PRODUCT (in api)', id);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('USER ID', userId);
  
    const supabase = await createClerkSupabaseClientSsr();

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
  
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
  