import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';

dotenv.config()
const app = express();

app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(cookieParser());


app.get('/', (req, res) => {
    res.send('Coin Tracker Backend running');
});

// Proxy for CoinGecko coins endpoint
app.get('/api/coins', async (req, res) => {
    try{
        const {
            vs_currency = 'usd',
            order = 'market_cap_desc',
            per_page = 25,
            page = 1,
            sparkline = false
         } = req.query;

        const response = await axios.get(
            'https://api.coingecko.com/api/v3/coins/markets', 
            {
            params: { vs_currency, order, per_page, page, sparkline},
            timeout: 10000
        });
        res.json(response.data);
    } catch(error) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: error.message };
        console.error('CoinGecko proxy error:', status, data);
        res.status(status).json(data);
    }
});


// Proxy for CoinGecko trending endpoint
app.get('/api/search/trending', async (req, res) => {
    try{
        const response = await axios.get('https://api.coingecko.com/api/v3/search/trending');   
        res.json(response.data);
    } catch(error) {
        console.error('Error fetching trending coins', error.message);
        res.status(500).json({ error: 'Failed to fetch trending coins' });
    }
});

// Proxy for Coingecko single coin endpoint
app.get('/api/coins/:id', async (req, res) => {
    try {
        const { id } = req.params
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`);
        res.json(response.data);
    } catch(error) {
        console.error(`Error fetching coin with id:${req.params.id}`, error.message);
        res.status(500).json({ error: `Failed to fetch coin with id:${req.params.id}`})
    }
});

// Proxy for Coingecko search endpoint
app.get('/api/search', async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json(({ error: 'Missing query parameter' }));
        }

        const response = await axios.get('https://api.coingecko.com/api/v3/search', {
            params: { query },
        });
        
        res.json(response.data);
    } catch(error){
        console.error('Errror fetching search results:', error.message)
        res.status(500).json({ error: 'Failed to fetch search results' })
    }
})


// Proxy for Coingecko Historical chart data endpoint
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 2;
app.get('/api/coins/:id/market_chart', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            vs_currency = 'usd',
            days = '30',
            interval = 'daily',
        } = req.query;
 
        const cacheKey = `${id}-${vs_currency}-${days}-${interval}`

        if(cache.has(cacheKey)) {
            const { data, expiry } = cache.get(cacheKey);
            if( Date.now() < expiry ) {
                return res.json(data);
            } else {
                cache.delete(cacheKey);
            }
        }

        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
            {
                params: { vs_currency, days, interval },
                timeout: 10000,
            }
        );
        // Store in cache
        cache.set(cacheKey, {
            data: response.data,
            expiry: Date.now() + CACHE_DURATION
        })
        
        res.json(response.data);
    } catch(error) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: error.message };
        console.error(`Error fetching market chart for ${req.params.id}:`, status, data);
        res.status(status).json(data);
    }
})


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})