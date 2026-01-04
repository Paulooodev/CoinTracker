import React, { useEffect, useState } from 'react';
import { CryptoState } from '../CryptoContext';
import { Box, CircularProgress } from '@mui/material';
import { api } from '../config/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import { Line } from "react-chartjs-2";
import SelectButton from './SelectButton';


const CoinInfo = ({ coin }) => {
  const [historicData, setHistoricData] = useState();
  const [days, setDays] = useState(1);
  const { currency } = CryptoState();

  const fetchHistoricData = async () => {
    if(!coin?.id) return;
    try {
      setHistoricData(null);
      const { data } = await api.get(`/coins/${coin.id}/market_chart`, {
        params: {
          vs_currency: currency.toLowerCase(),
          days,
          // interval: days === 1 ? 'hourly' : days === 7 ? 'hourly' : 'daily',
        }
      });
      if(data?.prices?.length > 0) {
        setHistoricData(data.prices)
      } else {
        setHistoricData([])
      }
    } catch(e) {
      console.error('Error fetching historic data:', e);
      setHistoricData([]);
    }
  };

  console.log('data', historicData)

  useEffect(() => {
    if(!coin?.id) return;
    fetchHistoricData()
  }, [coin?.id, currency, days])

  const ranges = [1, 7, 30, 90, 180, 365];
  const label = (d) => (
    d === 1 ? '1D' : d === 7 ? '7D' : d === 30 ? '1M' :  d === 90 ? '3M' : d === 180 ? '6M' : '1Y'
  )



  return (
    <div className='w-full h-full'>
      {!historicData ? (
        <Box className="w-full h-full flex items-center justify-center">
          <CircularProgress
            sx={{
              fontFamily:'inherit'
            }}
          />
        </Box>
      ) : (
          <div className="w-full h-full">
            {/* Charts */}
          <Line
            data={{
              labels: historicData.map((coin) => {
                let date = new Date(coin[0]);
                if(days <= 90) {
                  let hours = date.getHours();
                  const minutes = date.getMinutes().toString().padStart(2, '0');
                  const suffix = hours >= 12 ? 'PM' : 'AM';
                  hours = hours % 12 || 12;
                  return `${hours}:${minutes}:${suffix}`
                }

                  return date.toLocaleDateString();
              }),
              datasets: [
                {
                  data: historicData.map((coin) => coin[1]),
                  label: `Price (Past ${days} Days) in ${currency}`,
                  borderColor: '#3B82F6',
                  fill: false,
                  tension: 0.25,
                },
              ],
            }}
            options={{
              responsive: true,
              elements:{
                point: { radius: 1 },
              },
               plugins: {
                legend: { display: true, 
                          position: 'top' 
                        },
              },
            }}
          />
          </div>
      )}
    
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {ranges.map(d => (
          <SelectButton
            key={d}
            selected={days === d}
            onClick={() => setDays(d)}
          >
            {label(d)}
          </SelectButton>
        ))}
      </div>
    </div>
  )
}


export default CoinInfo


