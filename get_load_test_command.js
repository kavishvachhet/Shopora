const http = require('http');

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log("Usage: node get_load_test_command.js <email> <password>");
    process.exit(1);
}

const data = JSON.stringify({ email, password });

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    
    res.on('end', () => {
        const cookies = res.headers['set-cookie'];
        if (cookies) {
            const tokenCookie = cookies.find(c => c.startsWith('token='));
            if (tokenCookie) {
                const cookieValue = tokenCookie.split(';')[0];
                console.log("\n✅ Login Successful!");
                console.log("\n--- COPY AND PASTE THIS COMMAND ---");
                console.log(`autocannon -c 100 -d 10 -H "Cookie: ${cookieValue}" http://localhost:3000/api/products`);
                console.log("-----------------------------------\n");
            } else {
                console.log("❌ Could not find token in cookies.");
            }
        } else {
            console.log("❌ Login failed: No cookies returned. Check your credentials.");
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Connection Error: ${e.message}. Is your server running on port 3000?`);
});

req.write(data);
req.end();
