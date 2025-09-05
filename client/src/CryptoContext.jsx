import React, { createContext, useEffect, useState } from 'react'
import { useContext } from 'react';
import { api, exchangeApi } from './config/api';
import { useCallback } from 'react';

const Crypto = createContext()
const CryptoContext = ( {children}  ) => {
    const [currency, setCurrency] = useState('USD');
    const [symbol, setSymbol] = useState('$');
    const [exchangeRate, setExchangeRate] = useState(1); // default to 1
    const [error, setError] = useState(null);
    
    // Fetch exchange rate (USD → NGN)
  const fetchExchangeRate = useCallback(async () => {
    try {
    const { data } = await exchangeApi.get('/USD');
      const rate = Number(data?.rates?.NGN);
      if(!rate || isNaN(rate)) {
        throw new Error('Invalid exchange rate');
      }
      setExchangeRate(rate);
      return rate;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      setError('Failed to load exchange rates');
      setExchangeRate(1);
      return 1;
    }
  }, []);

    useEffect(() => {
      console.log('Currency switched to:', currency)
        switch (currency) {
          case 'USD':
            setSymbol('$');
            setExchangeRate(1);
            break;
          case 'NGN':
            setSymbol('₦');
            fetchExchangeRate();
            break;
          default:
              setSymbol('')
              setExchangeRate(1);
        } 
    }, [currency, fetchExchangeRate])


  return (
    <Crypto.Provider value={{currency, symbol, setCurrency, exchangeRate}}>
      {children}
    </Crypto.Provider>
  )
}

export default CryptoContext

export const CryptoState = () => {
     return useContext(Crypto)
}
