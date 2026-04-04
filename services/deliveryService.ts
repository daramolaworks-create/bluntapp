import { supabase } from './supabaseClient';
import { BluntMessage } from '../types';

// In development, we hit the local Deno server directly.
// In production, we use the Supabase Edge Function.
const EDGE_FUNCTION_URL = import.meta.env.DEV
    ? 'http://localhost:8000'
    : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-blunt`;

export const sendAnonymousBlunt = async (blunt: BluntMessage): Promise<{ success: boolean; message: string }> => {
    try {
        console.log(`[DeliveryService] Sending via ${blunt.deliveryMode} to ${blunt.recipientNumber}...`);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // In production, attach the Supabase auth token for the Edge Function
        if (!import.meta.env.DEV) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
            }
            headers['apikey'] = import.meta.env.VITE_SUPABASE_ANON_KEY;
        }

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({ blunt }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error('[DeliveryService] Failed:', data);
            return { success: false, message: data.message || 'Delivery failed.' };
        }

        console.log('[DeliveryService] Success:', data);
        return { success: true, message: 'Successfully dispatched via Secure Server.' };

    } catch (e) {
        console.error('[DeliveryService] Error:', e);
        return { success: false, message: 'System error during transmission.' };
    }
};

// Send email notification when someone replies in a chat thread
export const sendReplyNotification = async (bluntId: string, recipientEmail: string): Promise<void> => {
    try {
        console.log(`[DeliveryService] Sending reply notification to ${recipientEmail}...`);

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                blunt: {
                    id: bluntId,
                    recipientNumber: recipientEmail,
                    deliveryMode: 'REPLY_NOTIFICATION'
                }
            }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            console.warn('[DeliveryService] Reply notification failed:', data);
        }
    } catch (e) {
        // Non-blocking — don't break the chat flow if notification fails
        console.warn('[DeliveryService] Reply notification error:', e);
    }
};
