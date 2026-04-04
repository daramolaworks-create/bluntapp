// Blunt App - Edge Function: send-blunt
// Unified delivery via Brevo (Email, SMS, WhatsApp)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const { blunt } = await req.json();
        if (!blunt || !blunt.recipientNumber) throw new Error("Missing recipient details");

        const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
        if (!BREVO_API_KEY) throw new Error("Missing Brevo API key.");

        const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:3000';
        const viewUrl = `${APP_URL}/#/view/${blunt.id}`;

        const headers = {
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY,
            'accept': 'application/json',
        };

        // --- EMAIL ---
        const SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL') || 'noreply@bluntapp.com';
        const SENDER_NAME = Deno.env.get('BREVO_SENDER_NAME') || 'Blunt';

        if (blunt.deliveryMode === 'EMAIL') {
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    sender: { email: SENDER_EMAIL, name: SENDER_NAME },
                    to: [{ email: blunt.recipientNumber }],
                    subject: 'Someone sent you a Blunt Truth',
                    htmlContent: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; text-align: center;">
                            <div style="width: 60px; height: 60px; background: #0067f5; border-radius: 16px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 28px;">🔒</span>
                            </div>
                            <h1 style="font-size: 24px; font-weight: 800; color: #0a1128; margin-bottom: 8px;">You have a new message</h1>
                            <p style="font-size: 14px; color: #666; margin-bottom: 32px;">An anonymous source has sent you a blunt truth.</p>
                            <a href="${viewUrl}" style="display: inline-block; padding: 14px 32px; background: #0a1128; color: #fff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">Read Message</a>
                            <p style="font-size: 11px; color: #aaa; margin-top: 32px;">Sent securely via Blunt</p>
                        </div>
                    `
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(`Brevo Email Error: ${data.message || JSON.stringify(data)}`);

            return new Response(JSON.stringify({ success: true, messageId: data.messageId }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // --- SMS ---
        if (blunt.deliveryMode === 'SMS') {
            const messageBody = `You have received a Blunt Truth from an anonymous source.\n\nRead it here: ${viewUrl}`;

            const res = await fetch('https://api.brevo.com/v3/transactionalSMS/send', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    sender: 'Blunt',
                    recipient: blunt.recipientNumber,
                    content: messageBody,
                    type: 'transactional',
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(`Brevo SMS Error: ${data.message || JSON.stringify(data)}`);

            return new Response(JSON.stringify({ success: true, reference: data.reference }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // --- WHATSAPP ---
        if (blunt.deliveryMode === 'WHATSAPP') {
            // WhatsApp via Brevo requires a pre-approved template for the first message.
            // You must create a template in Brevo dashboard first, then use its ID here.
            const WHATSAPP_TEMPLATE_ID = Deno.env.get('BREVO_WHATSAPP_TEMPLATE_ID');

            if (!WHATSAPP_TEMPLATE_ID) {
                // Fallback: send as SMS instead if no WhatsApp template configured
                console.warn('[send-blunt] No WhatsApp template configured. Falling back to SMS.');
                const fallbackBody = `You have received a Blunt Truth from an anonymous source.\n\nRead it here: ${viewUrl}`;

                const res = await fetch('https://api.brevo.com/v3/transactionalSMS/send', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        sender: 'Blunt',
                        recipient: blunt.recipientNumber,
                        content: fallbackBody,
                        type: 'transactional',
                    })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(`Brevo SMS Fallback Error: ${data.message || JSON.stringify(data)}`);

                return new Response(JSON.stringify({ success: true, reference: data.reference, fallback: 'sms' }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }

            const res = await fetch('https://api.brevo.com/v3/whatsapp/sendMessage', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    templateId: Number(WHATSAPP_TEMPLATE_ID),
                    contactNumbers: [blunt.recipientNumber],
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(`Brevo WhatsApp Error: ${data.message || JSON.stringify(data)}`);

            return new Response(JSON.stringify({ success: true, messageId: data.messageId }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // --- REPLY NOTIFICATION ---
        // Sent when the sender replies back in a chat thread
        if (blunt.deliveryMode === 'REPLY_NOTIFICATION') {
            const recipientEmail = blunt.recipientNumber; // the recipient's email
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    sender: { email: SENDER_EMAIL, name: SENDER_NAME },
                    to: [{ email: recipientEmail }],
                    subject: 'New reply on your Blunt conversation',
                    htmlContent: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; text-align: center;">
                            <div style="width: 60px; height: 60px; background: #0a1128; border-radius: 16px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 28px;">💬</span>
                            </div>
                            <h1 style="font-size: 24px; font-weight: 800; color: #0a1128; margin-bottom: 8px;">New reply in your conversation</h1>
                            <p style="font-size: 14px; color: #666; margin-bottom: 32px;">Someone replied to your blunt conversation. Tap below to continue the chat.</p>
                            <a href="${viewUrl}" style="display: inline-block; padding: 14px 32px; background: #0067f5; color: #fff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">Continue Chat</a>
                            <p style="font-size: 11px; color: #aaa; margin-top: 32px;">Sent securely via Blunt</p>
                        </div>
                    `
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(`Brevo Reply Notification Error: ${data.message || JSON.stringify(data)}`);

            return new Response(JSON.stringify({ success: true, messageId: data.messageId }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        throw new Error("Invalid Delivery Mode");

    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400
        });
    }
});
