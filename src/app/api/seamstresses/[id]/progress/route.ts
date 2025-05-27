import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { checkAuth } from '@/lib/utils/auth';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Create a new progress update for a seamstress
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	await checkAuth();

	const { id: seamstressId } = await params;

	const supabase = await createClerkSupabaseClientSsr();

	try {
		const formData = await req.formData();
	
		const imageFiles = formData.getAll('image_urls') as File[];
		const imageUrls: string[] = [];

		if (imageFiles && imageFiles.length > 0) {
			for (const file of imageFiles) {
				const fileExt = file.name.split('.').pop();
				const fileName = `${uuidv4()}.${fileExt}`;
				const filePath = `${formData.get('product')}/progress/${seamstressId}/${fileName}`;

				const arrayBuffer = await file.arrayBuffer();
				const fileBuffer = new Uint8Array(arrayBuffer);

				const { error } = await supabase.storage.from('products').upload(filePath, fileBuffer, {
					contentType: file.type,
					upsert: false,
				});

				console.log(error);

				if (error) {
					throw new Error(`Error uploading file: ${error.message}`);
				}

				const { data } = await supabase.storage.from('products').createSignedUrl(filePath, 60 * 60 * 24 * 365);

				console.log(data);

				imageUrls.push(data?.signedUrl || '');

				console.log(imageUrls);
			}
		}

		const { data, error } = await supabase.from('progress').insert({
			user_id: seamstressId,
			product_id: formData.get('product'),
			description: formData.get('description'),
			emotion: formData.get('emotion'),
			units_completed: formData.get('units_completed'),
			image_urls: imageUrls,
		});

		if (error) {
			throw new Error(error.message);
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
