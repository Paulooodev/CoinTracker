import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import bannerImg from '../Banner/banner2.jpg';
import Typed from 'typed.js';
import Carousel from './Carousel'; 


const Banner = () => {
    const typedElement = useRef(null);
    const typedInstance = useRef(null);
  

  useEffect(() => {
    typedInstance.current = new Typed(typedElement.current, {
      strings: [
        'Monitor all your favorite digital assets in one dashboard.',
        'Real-Time Insights. Zero Guesswork.',
        'Markets in Motion. Stay Informed.',
        'One Dashboard. Infinite Possibilities.'
      ],
      typeSpeed: 40,
      backSpeed: 30,
      backDelay: 1500,
      loop: true,
      showCursor: true,
      cursorChar: '|',
      smartBackspace: true,
    });

    return () => {
      typedInstance.current?.destroy()
    }

  }, []);

  return (
    <div>
      <Box
        sx={{
            height: '400px',
            backgroundImage:`url(${bannerImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection:'column',
            gap: 2,
            textAlign: 'center',
            px: 2,
            fontFamily: 'Poppins, sans-serif',
        }}
      >

    <div className="text-center">
        <Typography
            variant='h3'
            className='text-xl font-primary text-background'
            sx={{
              fontFamily:'inherit'
            }} 
        >
           Welcome to CoinTracker
        </Typography>

        <Typography
            variant='subtitle1'
            className='font-tertiary text-background text-sm-custom'
            sx={{
              fontFamily: 'inherit'
            }}
        >
            <span
              ref={typedElement}
            ></span>
        </Typography>
    </div>
      <Carousel/> 
      </Box>
    </div>
  )
}

export default Banner
