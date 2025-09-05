import React, { useEffect } from 'react'
import {api, exchangeApi} from '../config/api';
import { useState } from 'react';
import { CryptoState } from '../CryptoContext';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    TextField, 
    TableContainer, 
    Table, TableHead, 
    TableBody, 
    TableRow, 
    LinearProgress, 
    TableCell, 
    Tooltip,
    Pagination,
    PaginationItem,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


import { 
    formatPrice, 
    getChangeColor, 
    format24hChange, 
    formatMarketCap 
} from '../utils';

const CoinsTable = () => {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const { currency, symbol, exchangeRate } = CryptoState();

    const fetchCoinList = async (currentCurrency) => {
        const apiPerPage = 25;
        const targetTotal = 500;
        const totalPages = Math.ceil(targetTotal / apiPerPage);
        const expected = apiPerPage * totalPages;

        const currencyNorm = (currentCurrency || 'usd').toLowerCase();
        const cacheKey = `coins_${currencyNorm}`;
        const metaKey = `${cacheKey}_meta`;
        const TTL_MS = 60_000;

        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
        const meta = JSON.parse(localStorage.getItem(metaKey) || 'null');
        if(Array.isArray(cached) && cached.length >= expected && meta && Date.now() - meta.ts < TTL_MS) {
            setCoins(cached);
            return;
        }

        try {
            setLoading(true);
            const allCoins = [];
            for (let i = 1; i <= totalPages; i++) {
                let attempts = 0;
                let success = false;
                while(attempts < 3 && !success) {
                    try {
                        // console.log('fetching page:', i, 'for currency:', currentCurrency);
                        const { data } = await api.get(`/coins`, {
                            params: {
                                vs_currency: currencyNorm || 'usd',
                                order: 'market_cap_desc',
                                per_page: apiPerPage,
                                page: i,
                                sparkline: false
                            }
                        });
                        allCoins.push(...data);
                        success = true
                        setCoins([...allCoins]);
                         await new Promise((res) => setTimeout(res, 1000));
                    } catch(err) {
                        attempts++;
                        if (err.response?.status === 429) {
                            // console.warn(`Rate limit hit on page ${i}, attempt ${attempts}. Retrying...`);
                            await new Promise((res) => setTimeout(res, 3000 * attempts));
                        } else {
                            throw err
                        }
                    }
                }
                if(!success) {
                    console.error(`Failed to fetch page ${i} after 3 attempts`)
                }
            }
            localStorage.setItem(cacheKey, JSON.stringify(allCoins));
            localStorage.setItem(metaKey, JSON.stringify({ts: Date.now(), expected }));

            // Final state Update
            setCoins(allCoins);
        } catch(err) {
            console.error("🚨 Error fetching coins:", err.message);
        } finally {
            setLoading(false);
        }
    }

    console.log(coins);


    useEffect(() => {
        fetchCoinList(currency)
    }, [currency])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])


    // Function to handle search for crypto coins
    const filteredCoins = () => {
        if(!searchQuery?.trim()) {
            return coins;
        }
        return coins.filter((coin) => (
            coin.name.toLowerCase().includes(searchQuery?.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchQuery?.toLowerCase())
        ));
    };

    const displayedCoins = filteredCoins();
    const uiPerPage = 10;
    const pageCount =  Math.ceil(displayedCoins.length / uiPerPage);
    const startIndex = (currentPage - 1) * uiPerPage;
    const endIndex = startIndex + uiPerPage;
    const paginatedCoins = displayedCoins.slice(startIndex, endIndex);


  return (
    <div className='font-tertiary'>
      <Box
        className='font-tertiary'
        sx={{
            padding: 4,
            fontFamily: 'inherit'
        }}
      >
        <Typography 
            variant='h5'
            className='font-tertiary font-light text-center'
            sx={{
                fontFamily:'inherit'
            }}
        >
         Cryptocurrency Prices by Market Cap   
        </Typography>
        <TextField
            label="Search for a cryptocurrency coin"
            variant="outlined"
            fullWidth
            sx={{
                marginTop: 2,
                fontFamily:'inherit'
            }}
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                // setCurrentPage(1);
            }}
        />
        <Box
            className='font-tertiary'
            sx={{
                marginTop: 4,
                fontFamily:'inherit'
            }}
        >
        <TableContainer>
            {
            loading ? (
                <LinearProgress sx={{ 
                    backgroundColor: 'var(--primary)',
                    fontFamily:'inherit'
                    }}/>
            ) : filteredCoins().length === 0 && !loading ? (
                <Typography
                    variant='body1' align='center'
                     sx={{
                        fontFamily:'inherit'
                    }}
                        >
                    No coins found matching your search
                </Typography>
            ) : (
                <Table
                    className='font-teriary'
                >
                    <TableHead sx={{
                        backgroundColor: 'var(--accent)',
                        fontFamily: 'inherit'
                    }}>
                        <TableRow>
                            {['Coin', 'Price', '24h Change', 'Market Cap', 'Rank'].map((head) => (
                                <TableCell
                                    sx={{
                                        color: 'black',
                                        fontWeight: '600',
                                        fontFamily: 'inherit'
                                    }}
                                    key={head}
                                    align={head === 'Coin' ? '' : 'right'}
                                > 
                                    {head}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedCoins
                                     .map(row => {
                            const profit = row.price_change_percentage_24h > 0;
                            return (
                                <TableRow 
                                    onClick={() => navigate(`/coins/${row.id}`)}
                                    key={row.name}
                                >
                                    <TableCell
                                        component='th'
                                        scope='row' 
                                        sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        fontFamily:'inherit'
                                        }}
                                    >
                                        <img 
                                            src={row?.image} 
                                            alt={row.name} 
                                            height='40' 
                                            className='mb-2 rounded-full'
                                        />
                                        <div 
                                        className='flex flex-col'
                                        >
                                            <span
                                                className='uppercase text-lg-base leading-none'
                                            >
                                                {row.symbol}
                                            </span>
                                            <span
                                            style={{
                                                color: 'gray',
                                            }}
                                                className='text-sm-custom leading-tight'
                                            >
                                                {row.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        align='right'
                                        sx={{
                                            fontFamily:'inherit'
                                        }}
                                    >
                                    {symbol}{formatPrice(row.current_price, currency, exchangeRate, false)}
                                    </TableCell>
                                    <TableCell
                                        align='right'
                                        sx={{
                                            color: getChangeColor(row.price_change_percentage_24h),
                                            fontFamily:'inherit'
                                        }}
                                    >
                                        {format24hChange(row.price_change_percentage_24h)}
                                    </TableCell>
                                    <Tooltip
                                        title={row.market_cap.toLocaleString()}
                                        arrow
                                        enterDelay={200}
                                        sx={{
                                            fontFamily:'inherit'
                                        }}
                                    >
                                    <TableCell
                                        align='right'
                                        >
                                        {symbol}{formatMarketCap(row.market_cap, currency, exchangeRate)}
                                    </TableCell>
                                    </Tooltip>
                                        <TableCell
                                            align='right'
                                            sx={{
                                                fontFamily:'inherit'
                                            }}
                                            >
                                            {row.market_cap_rank}
                                        </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            )
        } 
        </TableContainer>
       <Pagination
            count={pageCount}
            page={currentPage}
            onChange={(event, value) => {
                setCurrentPage(value);
               }
            }
            renderItem={(item) => (
                <PaginationItem
                    slots={{
                        previous: ArrowBackIcon,
                        next: ArrowForwardIcon
                    }}
                    {...item}
                />
            )}
            sx={{
                marginTop: 2,
                display: 'flex',
                justifyContent: 'center'
            }}
        />
        </Box>
      </Box>
    </div>
  )
}

export default CoinsTable