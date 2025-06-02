import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// TODO: Use other supabase client once we set up RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Webhook for Clerk events
export async function POST(req: NextRequest) {	
	try {
		const evt = await verifyWebhook(req)

		const { id } = evt.data
		const eventType = evt.type

		if (evt.data) {
			const { id, email_addresses, first_name, last_name, image_url, username, phone_numbers } = evt.data;
			
			const userData = {
				id: id,
				email: email_addresses[0]?.email_address,
				first_name: first_name,
				last_name: last_name,
				image_url: image_url,
				username: username,
				phone_number: phone_numbers[0]?.phone_number
			}

			if (eventType === 'user.created') {
				const { error } = await supabase
						.from('users')
						.insert([userData]);

				if (error) {
					throw new Error(error.message);
				}
			} else if (eventType === 'user.updated') {
				const { error } = await supabase
						.from('users')
						.upsert(userData, {
							onConflict: 'id'
						});

				if (error) {
					throw new Error(error.message);
				}
			}
		}

		if (eventType === 'user.deleted') {
			const { error } = await supabase
					.from('users')
					.delete()
					.eq('id', id);

			if (error) {
				throw new Error(error.message);
			}
		}

		return NextResponse.json({ data: 'Webhook received' }, { status: 200 })
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 })
	}
}
