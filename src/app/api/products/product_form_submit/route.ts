import { createClerkSupabaseClientSsr } from "@/lib/supabase/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // Check authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the form data from the request
        const formData = await request.formData();

        // Parse the product data fields from the form
        const name = JSON.parse(formData.get("name") as string);
        const system_code = JSON.parse(formData.get("system_code") as string);
        const inmetro_cert_number = JSON.parse((formData.get("inmetro_cert_number") as string)?.trim() || "null");
        const barcode = JSON.parse((formData.get("barcode") as string)?.trim() || "null");
        const description = JSON.parse((formData.get("description") as string)?.trim() || "null");
        const weight = JSON.parse(formData.get("weight") as string);
        const width = JSON.parse(formData.get("width") as string);
        const height = JSON.parse(formData.get("height") as string);
        const percent_pieces_lost = JSON.parse(formData.get("percent_pieces_lost") as string);
        const product_type = JSON.parse((formData.get("product_type") as string)?.trim() || "null");
        const progress_level = JSON.parse(formData.get("status") as string);

        // Move the Supabase client initialization outside the image upload scope
        const supabase = await createClerkSupabaseClientSsr();

        const image_urls: string[] = [];

        // Helper function to convert empty strings to null
        const emptyToNull = (value: any) => {
            if (value === "") return null;
            return value;
        };

        // Create the product object with empty string handling
        const product = {
            name,
            system_code: emptyToNull(system_code),
            inmetro_cert_number: emptyToNull(inmetro_cert_number),
            barcode: emptyToNull(barcode),
            description: emptyToNull(description),
            weight,
            width,
            height,
            percent_pieces_lost,
            product_type: emptyToNull(product_type),
            progress_level,
            image_urls,
        };

        const { data: insertedProduct, error: insertError } = await supabase
            .from('products')
            .upsert(product, {
                onConflict: 'system_code',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error inserting product:", insertError);
            return NextResponse.json(
                { error: `Failed to insert product: ${insertError.message}` },
                { status: 500 }
            );
        }
        // Extract the product ID (UUID) assigned by Supabase
        const productId = insertedProduct.id;

        const imageFiles = formData.getAll("image_urls") as File[];

        if (imageFiles && imageFiles.length > 0) {
            // Process each file and upload to storage
            for (const file of imageFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
                const filePath = `${productId}/${fileName}`;

                // Convert file to ArrayBuffer for upload
                const arrayBuffer = await file.arrayBuffer();
                const fileBuffer = new Uint8Array(arrayBuffer);

                // Upload to Supabase storage
                const { data, error } = await supabase.storage
                    .from('products')
                    .upload(filePath, fileBuffer, {
                        contentType: file.type,
                        upsert: false
                    });

                if (error) {
                    throw new Error(`Error uploading file: ${error.message}`);
                }

                // Get the public URL for the uploaded file
                const { data: urlData } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);

                // Add the URL to our array
                image_urls.push(urlData.publicUrl);
            }
        }

        // Update the product with the image URLs
        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update({ image_urls })
            .eq('id', productId)
            .select()
            .single();

        if (updateError) {
            console.error("Error updating product:", updateError);
            return NextResponse.json(
                { error: `Failed to update product: ${updateError.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });

    } catch (error) {
        console.error("Error processing product form:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unknown error occurred" },
            { status: 500 }
        );
    }
}
