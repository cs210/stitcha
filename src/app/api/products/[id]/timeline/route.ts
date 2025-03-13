import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClerkSupabaseClientSsr();

  try {
    console.log("Fetching timeline for product:", params.id);

    // Fetch assignments with user details
    const { data, error } = await supabase
      .from("product_users")
      .select(
        `
        created_at,
        user_id,
        users!inner (
          first_name,
          last_name
        )
      `
      )
      .eq("product_id", params.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(error.message);
    }

    console.log("Raw data from Supabase:", data);

    if (!data) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // Transform the data into progress events
    const progressEvents = data.map((record) => ({
      id: `assigned-${record.user_id}`,
      created_at: record.created_at,
      description: `Product assigned to ${record.users.first_name} ${record.users.last_name}`,
      emotion: "assigned",
      user_id: record.user_id,
      image_urls: [],
    }));

    console.log("Transformed timeline events:", progressEvents);

    return NextResponse.json({ data: progressEvents }, { status: 200 });
  } catch (error) {
    console.error("Error in timeline GET handler:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
