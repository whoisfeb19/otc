// netlify/functions/send-webhook.js
// Fungsi ini berjalan di server Netlify yang aman.

exports.handler = async (event, context) => {
    // Pastikan ini adalah permintaan POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // Ambil data yang dikirim dari frontend (browser)
    const { userId, username, namaLengkap, file, harga, info } = JSON.parse(event.body);
    
    // Akses Webhook URL rahasia dari Environment Variables Netlify
    const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

    if (!DISCORD_WEBHOOK) {
        console.error("Missing DISCORD_WEBHOOK environment variable!");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error' }),
        };
    }

    try {
        const embed = {
            title: '💰 PURCHASE VERIFIED (VIA SERVERLESS FUNCTION)',
            description: `User baru ingin membeli: **${file}**`,
            color: 2969626,
            fields: [
                { name: '👤 Nama', value: namaLengkap, inline: true },
                { name: '🎮 Discord', value: `<@${userId}> (${username})`, inline: true },
                { name: '📦 File', value: file, inline: false },
                { name: '💵 Harga', value: harga, inline: true },
                { name: '⏰ Waktu', value: new Date().toLocaleString('id-ID'), inline: false },
                { name: '✅ Status', value: '**VERIFIED & JOINED**', inline: false },
                { name: '📝 Info', value: info || 'Tidak ada', inline: false }
            ],
            footer: { text: 'OTC MOD HUB - USER SUDAH DI-SERVER' }
        };

        // Kirim payload ke Discord Webhook
        const response = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });

        if (response.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, message: 'Webhook sent successfully' }),
            };
        } else {
            const errorText = await response.text();
            console.error('Discord Webhook API Error:', errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Failed to send webhook' }),
            };
        }

    } catch (e) {
        console.error('Webhook function error:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
