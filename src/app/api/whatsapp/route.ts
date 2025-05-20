import { checkAuth } from '@/lib/utils/auth';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Send a WhatsApp message to a seamstress
export async function POST(req: NextRequest) {
	await checkAuth();
	
	const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
	
  try {
		const { seamstress: seamstressPhoneNumber, message: whatsappMessage } = await req.json();

		const message = await client.messages.create({
			from: 'whatsapp:+14155238886',
			contentSid: whatsappMessage,
			contentVariables: '{"1":"12/1","2":"3pm"}',
			to: `whatsapp:${seamstressPhoneNumber}`
    });	

    return NextResponse.json({ data: message }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
} 