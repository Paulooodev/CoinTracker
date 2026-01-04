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
    const [totalPages, setTotalPages] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();
    const { currency, symbol, exchangeRate } = CryptoState();


    const perPage = 25; // API fetch size (matches CoinGecko max = 250)

    const fetchCoinList = async (currentCurrency, page) => {
            try {
                setLoading(true);
                const { data } = await api.get(`/coins`, {
                    params: {
                        vs_currency: currentCurrency || 'usd',
                        order: 'market_cap_desc',
                        per_page: perPage,
                        page,
                        sparkline: false
                    }
                        });
                        setCoins(data);
                        setTotalPages(20)
                         await new Promise((res) => setTimeout(res, 1000));
                    } catch(err) {
                        console.error("🚨 Error fetching coins:", err.message);
                    } finally {
                        setLoading(false);
                    }
                }

    const fetchSearchResults = async (query, currentCurrency) => {
            try {
                setLoading(true);
                setIsSearching(true);
                const { data } = await api.get(`/coins`, {
                    params: {
                        vs_currency: currentCurrency || 'usd',
                        order: 'market_cap_desc',
                        per_page: 250, // Get more coins for search
                        page: 1,
                        sparkline: false
                    }
                });
                    const filteredResults = data.filter((coin) => (
                        coin.name.toLowerCase().includes(query?.toLowerCase()) ||
                        coin.symbol.toLowerCase().includes(query?.toLowerCase())
                ));
                    setCoins(filteredResults);             
                    setTotalPages(1)
                         await new Promise((res) => setTimeout(res, 1000));
                    } catch(err) {
                        console.error("🚨 Error searching coins:", err.message);
                        setCoins([])
                    } finally {
                        setLoading(false);
                    }
                }


    useEffect(() => {
        if(searchQuery.trim()) {
            const timeoutId = setTimeout(() => {
                fetchSearchResults(searchQuery, currency)
            }, 500);
            return () => clearTimeout(timeoutId)
        } else {
            setIsSearching(false);
            fetchCoinList(currency, currentPage)
        }
    }, [currency, currentPage, searchQuery])

    useEffect(() => {
        if(!searchQuery.trim()){
            setCurrentPage(1)
        }
    }, [searchQuery])


    // Function to handle search for crypto coins
    const filteredCoins = () => {
        if(!searchQuery?.trim()) {
            return coins || [];
        }
        // return coins.filter((coin) => (
        //     coin.name.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        //     coin.symbol.toLowerCase().includes(searchQuery?.toLowerCase())
        // ));
        return coins || [];
    };

    // Paginate the filtered coins
    const paginatedCoins = filteredCoins()


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
                setCurrentPage(1);
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
            ) : (filteredCoins().length === 0 && !loading) ? (
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
       {!isSearching && (
            <Pagination
                count={totalPages}
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
        )}
        </Box>
      </Box>
    </div>
  )
}

export default CoinsTable



