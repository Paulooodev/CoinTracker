import React, { useEffect, useState } from 'react';
import { Container, Typography, LinearProgress, Alert, Button, Card, CardContent, Divider, Chip } from '@mui/material';
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
    const t = setTimeout(fetchCoin, 200);
    return () => clearTimeout(t)
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" className="min-h-[60vh] flex items-center justify-center px-4">
        <LinearProgress sx={{ backgroundColor: 'var(--primary)', width: '100%' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="px-4 py-10">
      {errorMsg ? (
        <div className="mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-tertiary mt-6 lg:mt-8">
        {/* Left panel */}
        <div className="lg:col-span-1">
          <Card variant="outlined" className="rounded-xl">
            <CardContent className="p-6">
              <div className="flex justify-center mb-6">
                <img
                  src={coin?.image?.large}
                  alt={coin?.name}
                  className="w-28 h-28 object-contain"
                />
              </div>

              <Typography
                variant="body1"
                className="text-gray-600 leading-relaxed mb-6"
                sx={{ fontFamily: 'inherit' }}
              >
                {coin?.description?.en
                  ? <>{parse(coin.description.en.split('. ')?.[0] || '')}.</>
                  : 'No description available.'}
              </Typography>

              <Divider className="my-4" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography variant="body2" className="text-gray-600" sx={{ fontFamily: 'inherit' }}>
                    Current Price
                  </Typography>
                  <Typography variant="h6" className="font-bold" sx={{ fontFamily: 'inherit' }}>
                    {displayPrice}
                  </Typography>
                </div>

                <div className="flex items-center justify-between">
                  <Typography variant="body2" className="text-gray-600" sx={{ fontFamily: 'inherit' }}>
                    Market Cap
                  </Typography>
                  <Typography variant="h6" className="font-bold" sx={{ fontFamily: 'inherit' }}>
                    {displayMarketCap}
                  </Typography>
                </div>

                {coin?.market_data?.price_change_percentage_24h !== undefined ? (
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" className="text-gray-600" sx={{ fontFamily: 'inherit' }}>
                      24h Change
                    </Typography>
                    <Typography
                      variant="h6"
                      className={coin.market_data.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}
                      sx={{ fontFamily: 'inherit' }}
                    >
                      {coin.market_data.price_change_percentage_24h.toFixed(2)}%
                    </Typography>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2">
          <Card variant="outlined" className="rounded-xl">
            <CardContent className="p-4 lg:p-6">
              <CoinInfo coin={coin} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Coinpage;