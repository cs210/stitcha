import { createClient } from '@supabase/supabase-js';
import { verifyWebhook } from '@clerk/nextjs/webhooks'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req)

    const { id } = evt.data
    const eventType = evt.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Webhook payload:', evt.data)

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url, username, phone_numbers } = evt.data;

      console.log("USER CREATED OR UPDATED", evt.data);

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
        console.log("USERDATA", userData);
    
      }

      if (eventType === 'user.created') {
        console.log("USERDATA", userData);

        const { error } = await supabase
            .from('users')
            .insert([userData]);

        if (error) console.error('Error inserting user:', error);

      } else {
        const { error } = await supabase
            .from('users')
            .update(userData)
            .eq('clerk_id', id);

        if (error) console.error('Error updating user:', error);
     }
    }

    // if (eventType === 'user.deleted') {
    //     const { id } = evt.data;
    //     const { error } = await supabase
    //     .from('users')
    //     .delete()
    //     .eq('clerk_id', id);

    //     if (error) console.error('Error deleting user:', error);
    // }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}