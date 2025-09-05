const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors())

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

// Proxy for Coingecko Historical chart data endpoint
app.get('/api/coins/:id/market_chart', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            vs_currency = 'usd',
            days = '30',
            interval = 'daily',
        } = req.query;

        const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
            {
                params: { vs_currency, days, interval },
                timeout: 10000,
            }
        );
        res.json(response.data);
    } catch(error) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { error: error.message };
        console.error(`Error fetching market chart for ${req.params.id}:`, status, data);
        res.status(status).json(data);
    }
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})