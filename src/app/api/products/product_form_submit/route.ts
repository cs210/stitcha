import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { handleProductTableInsert, updateLaborFromProduct, updatePackagingMaterialFromProduct, updateRawMaterialFromProduct, updateTechnicalSheetFromProduct, handleProductCostsInsert } from "@/lib/supabase/supabase_utils";

export async function POST(request: Request) {
    let productId: string | undefined;

    try {
        // Check authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the form data from the request
        const formData = await request.formData();

        // Initialize Supabase client
        const supabase = await createClerkSupabaseClientSsr();

        // Handle the product submission
        const updatedProduct = await handleProductTableInsert(formData, supabase, userId);
        productId = updatedProduct.id;

        if (!productId) {
            throw new Error("Failed to get product ID after insertion");
        }

        await updateRawMaterialFromProduct(productId, supabase, formData);
        await updatePackagingMaterialFromProduct(productId, supabase, formData);
        await updateLaborFromProduct(productId, supabase, formData);
        await updateTechnicalSheetFromProduct(productId, supabase, formData);
        await handleProductCostsInsert(productId, supabase, formData);
        return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });

    } catch (error) {
        console.error("Error processing product form:", error);
        // If an error occurred after product creation, clean up by deleting the product
        // TODO: also delete files from storage
        if (productId) {  // This checks for both null and undefined
            try {
                const supabase = await createClerkSupabaseClientSsr();
                await supabase
                    .from('products')
                    .delete()
                    .eq('id', productId);

                console.log(`Cleaned up product with ID ${productId} due to error during processing`);
            } catch (cleanupError) {
                console.error("Error cleaning up product after failure:", cleanupError);
                // Continue with the original error even if cleanup fails
            }
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unknown error occurred" },
            { status: 500 }
        );
    }
}