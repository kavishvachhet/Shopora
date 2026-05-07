const redis = require('redis');

// Create Redis Client
const client = redis.createClient({
    url: 'redis://127.0.0.1:6379' // Default local Redis port
});

client.on('error', (err) => console.log('❌ Redis Client Error', err));
client.on('connect', () => console.log('✅ Redis Connected Successfully'));

// Connect to Redis
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.log("❌ Could not connect to Redis. Make sure your Redis server is running!");
    }
})();

module.exports = client;
