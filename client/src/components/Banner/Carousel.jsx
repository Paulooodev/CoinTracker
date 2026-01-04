import React, { useCallback, useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { api, exchangeApi } from '../../config/api';
import { CryptoState } from '../../CryptoContext';
import AliceCarousel from 'react-alice-carousel';
import { Link } from 'react-router-dom';
import 'react-alice-carousel/lib/alice-carousel.css';
import { formatPrice } from '../../utils';

const Carousel = () => {
  const { currency, symbol, exchangeRate } = CryptoState();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrendingCoins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.get('/search/trending');
      setTrending(data.coins);
      console.log('Trending Data:', data.coins); 
    } catch (error) {
      console.error('Error fetching trending coins:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingCoins();
  }, [currency]);
  

  const items = trending.map(({ item }) => {
    const currencySymbol = currency === 'NGN' ? '₦' : '$';
    const displayPrice = `${currencySymbol}${formatPrice(item.data.price, currency, exchangeRate)}`;


    return (
      <Link
        to={`/coins/${item.id}`}
        key={item.id}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div className="flex flex-col items-center p-x-2 py-3 w-[120px] sm:w-[140px] md:w-[160px]">
          <img 
            src={item.small} 
            alt={item.name} 
            height="50" 
            width="50"
            className="mb-3" 
          />
          <Typography 
            variant="subtitle2" 
            className="font-medium text-background"
            sx={{
              fontFamily:'inherit'
            }}
            >
            {item.name} (${item.symbol?.toUpperCase()})
          </Typography>

          <Typography
            variant='subtitle1' 
            className='font-medium text-center text-background'
            sx={{
              fontFamily:'inherit'
            }}
          > 
              Global Rank: {item.market_cap_rank || 'N/A'}
          </Typography>

          <Typography 
            variant="body2" 
            className="text-background text-center"
            sx={{
              fontFamily:'inherit'
            }}
            >
            Price: {displayPrice}
          </Typography>
        </div>
      </Link>
    );
  });

  if (loading) return <div className='loading-spinner'>Loading...</div>;

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <AliceCarousel
        mouseTracking
        infinite
        autoPlay
        autoPlayInterval={3000}
        animationDuration={800}
        disableDotsControls
        disableButtonsControls
        keyboardNavigation
        touchTracking
        responsive={{
          0: { items: 2 },
          600: { items: 4 },
          1024: { items: 6 },
        }}
        items={items}
      />
    </div>
  );
};

export default Carousel;