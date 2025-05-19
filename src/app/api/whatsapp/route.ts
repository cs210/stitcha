import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = 'AC9875879205e879d47b2f3bb1643b9969';
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function POST() {
  try {
    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
      contentVariables: '{"1":"12/1","2":"3pm"}',
      to: 'whatsapp:+16507096642'
    });

    console.log(message.sid);

    return NextResponse.json({ success: true, messageSid: message.sid });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json({ success: false, error: 'Failed to send WhatsApp message' }, { status: 500 });
  }
} 