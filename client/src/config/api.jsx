import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    // headers: {
    //     'User-Agent': 'Cointracker v1.0'
    // }
});

const exchangeApi = axios.create({
    baseURL: 'https://open.er-api.com/v6/latest'
})

export { api, exchangeApi };