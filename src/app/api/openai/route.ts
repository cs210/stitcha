import { createClerkSupabaseClientSsr } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

// Pushes all of our information to OpenAI
export async function POST() {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = await createClerkSupabaseClientSsr();

	const { data: productData, error: productError } = await supabase.from('products').select('*');

	if (productError) {
		return NextResponse.json({ error: productError }, { status: 400 });
	}

	// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

	// Convert data to CSV strings
	const productCsv = productData?.map((product) => Object.values(product).join(',')).join('\n') || '';

	// Upload CSV strings directly to OpenAI
	try {
		const productPath = path.join('/tmp', 'products.csv');

		fs.writeFileSync(productPath, productCsv);

		// const productFile = await openai.files.create({
		// 	file: fs.createReadStream(productPath),
		// 	purpose: 'assistants',
		// });

		// Upload files to vector store
		// const productVectorStore = await openai.vectorStores.files.create(
		// 	"products",
		// 	{
		// 		file_id: productFile.id
		// 	}
		// );

		// Clean up temporary files
		fs.unlinkSync(productPath);

		return NextResponse.json({ data: productData }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
