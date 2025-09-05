import React from 'react'
import { AppBar, Container, Toolbar, Select, MenuItem } from '@mui/material';
import{ FormControl } from '@mui/material'
import logo from '../assets/Cointracker-logo-transparent.png';
import { Link } from 'react-router-dom';
import { CryptoState } from '../CryptoContext';

const Header = () => {
  const { currency, setCurrency } = CryptoState();
    const handleChange = (event) => {
      setCurrency(event.target.value);
    };
    console.log(currency);

    
  return (
    <AppBar
     color='transparent' 
     position='static'
     >
      <Container>
      <Toolbar 
        sx={{ 
          height: 64,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <Link
            to='/'
          >
            <img 
              src={logo} 
              alt="logo" 
                style={{ 
                  height: '200px', 
                  objectFit:'contain',
                  cursor: 'pointer',
                  }} 
              />
          </Link>

       <FormControl
        sx={{ 
          minWidth: 120,
        }} 
       >
          <Select
            labelId='currency-label'
            id='currency'
            value={currency}
            onChange={handleChange}
            variant='outlined'
            size='small'
            sx={{
              width: 100,
            }}
        >
          <MenuItem
            value={'USD'}
            className='font-primary'
          >
          USD
          </MenuItem>
          <MenuItem
            value={'NGN'}
            className='font-primary'
          >
          NGN
          </MenuItem>
          
        </Select>
       </FormControl>


        
      </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header
