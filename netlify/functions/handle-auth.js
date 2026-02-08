// netlify/functions/handle-auth.js
// Fungsi ini berjalan di server Netlify yang aman, BUKAN di browser.

exports.handler = async (event, context) => {
    // 1. Ambil 'code' dari parameter URL yang dikirim browser
    const { code } = event.queryStringParameters;

    if (!code) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing code parameter' }),
        };
    }

    // 2. Akses Environment Variables yang disimpan di Dashboard Netlify
    const client_id = process.env.DISCORD_CLIENT_ID;
    const client_secret = process.env.DISCORD_CLIENT_SECRET;
    const redirect_uri = process.env.DISCORD_REDIRECT_URI;
    const scope = 'identify'; // Scope ini harus sama dengan yang diminta di frontend

    // Pastikan semua variabel penting tersedia
    if (!client_id || !client_secret || !redirect_uri) {
        console.error("Missing required environment variables!");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error' }),
        };
    }
    
    try {
        // 3. Lakukan pertukaran kode dengan token akses secara aman di server
        const tokenResponse = await fetch('https://discord.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id,
                client_secret, // Rahasia Anda aman di sini
                code,
                grant_type: 'authorization_code',
                redirect_uri,
                scope,
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Discord API Error:', errorText);
            return {
                statusCode: tokenResponse.status,
                body: JSON.stringify({ error: 'Failed to exchange code for token' }),
            };
        }

        const data = await tokenResponse.json();
        const accessToken = data.access_token;

        // 4. Gunakan token akses untuk mengambil data user
        const userResponse = await fetch('https://discord.com', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!userResponse.ok) {
            return {
                statusCode: userResponse.status,
                body: JSON.stringify({ error: 'Failed to fetch user data' }),
            };
        }

        const userData = await userResponse.json();
        
        // 5. Kembalikan data user ke browser
        return {
            statusCode: 200,
            body: JSON.stringify(userData),
        };

    } catch (error) {
        console.error('OAuth process error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
