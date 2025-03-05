import { createClerkSupabaseClientSsr } from "@/utils/supabase/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { userId } = await auth();

  // Check if the user is authenticated
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClerkSupabaseClientSsr();

  try {
    // Fetch users with role 'seamstress'
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, phone_number, image_url")
      .eq("role", "seamstress");

    if (error) {
      throw new Error(error.message);
    }

    // Transform the data to match the expected format
    const formattedData = data.map((seamstress) => ({
      id: seamstress.id,
      name: `${seamstress.first_name} ${seamstress.last_name}`,
      email: seamstress.email,
      phone_number: seamstress.phone_number,
      image_url: seamstress.image_url,
    }));

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error("Error fetching seamstresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch seamstresses" },
      { status: 500 }
    );
  }
}
