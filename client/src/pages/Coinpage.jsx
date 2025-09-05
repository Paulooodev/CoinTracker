import React, { useEffect, useState } from 'react';
import { Container, Typography, LinearProgress, Alert, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import parse from 'html-react-parser';
import { CryptoState } from '../CryptoContext';
import { api } from '../config/api';
import CoinInfo from '../components/CoinInfo';
import { formatPrice, formatMarketCap } from '../utils';

const Coinpage = () => {
  const { id } = useParams();
  const { currency, symbol, exchangeRate } = CryptoState();

  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const priceRaw = coin?.market_data?.current_price?.[currency?.toLowerCase?.()];
  const mcRaw = coin?.market_data?.market_cap?.[currency?.toLowerCase?.()];

  const displayPrice =
    priceRaw !== undefined ? `${symbol}${formatPrice(priceRaw, currency, exchangeRate, false)}` : '-';
  const displayMarketCap =
    mcRaw !== undefined ? `${symbol}${formatMarketCap(mcRaw, currency, exchangeRate)}` : '-';

  const fetchCoin = async () => {
    try {
      setErrorMsg('');
      setLoading(true);
      const { data } = await api.get(`/coins/${id}`);
      setCoin(data);
    } catch (err) {
      const msg = err?.response?.data?.error_message || err?.message || 'Failed to fetch coin';
      setErrorMsg(msg);
      console.error('Failed to fetch coin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoin();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" className="min-h-[80vh] flex items-center justify-center px-4">
        <LinearProgress 
          sx={{ 
              backgroundColor: 'var(--primary)',
              fontFamily:'inherit'
              }}/>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="px-4 py-6">
      {errorMsg ? (
        <div className="mb-4">
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={fetchCoin}>
                Retry
              </Button>
            }
          >
            {errorMsg}
          </Alert>
        </div>
      ) : null}

      <div className="flex flex-col lg:flex-row font-tertiary">
        {/* Left block (sidebar-like) */}
        <div className="w-full lg:w-1/3 lg:max-w-[380px] flex flex-col items-center mt-6 lg:mt-0 lg:pr-6 lg:border-r border-gray-200">
          <img
            src={coin?.image?.large}
            alt={coin?.name}
            className="w-[150px] h-[150px] object-contain mb-5"
          />

          <Typography
            variant="h3"
            className="font-bold mb-5 tracking-tight"
            sx={{ fontFamily: 'inherit' }}
          >
            {coin?.name ?? '—'}
          </Typography>

          <Typography
            variant="subtitle1"
            className="w-full px-6 text-justify text-gray-600 mb-6"
            sx={{ fontFamily: 'inherit' }}
          >
            {coin?.description?.en
              ? <>{parse(coin.description.en.split('. ')?.[0] || '')}.</>
              : null}
            
          </Typography>

          <div className="self-start w-full px-6 pt-3 space-y-6">
            <div className="flex items-baseline gap-3">
              <Typography
                variant="h5"
                className="font-bold text-yellow-50"
                sx={{ fontFamily: 'inherit' }}
              >
                Rank: {coin?.market_cap_rank ?? '—'}
              </Typography>
            </div>

            <div className="flex items-baseline gap-3">
              <Typography
                variant="h5"
                className="font-bold mr-3"
                sx={{ fontFamily: 'inherit' }}
              >
                Current Price: {displayPrice}
              </Typography>
              
             
            </div>

            <div className="flex items-baseline gap-3">
              <Typography
                variant="h5"
                className="font-bold "
                sx={{ fontFamily: 'inherit' }}
              >
                Market Cap: {displayMarketCap}
              </Typography>
            </div>
          </div>
        </div>

        {/* Right block (chart/content) */}
        <div className="w-full lg:flex-1 lg:pl-8 mt-8 lg:mt-0">
          <CoinInfo coin={coin} />
        </div>
      </div>
    </Container>
  );
};

export default Coinpage;