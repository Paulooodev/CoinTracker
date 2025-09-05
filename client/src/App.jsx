import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion';
import './App.css';
import Header from './components/Header';
import Homepage from './pages/Homepage';
import Coinpage from './pages/Coinpage';





function App() {
  return (
    <BrowserRouter>
        < Header/>
        <Routes>
        < Route path='/' element={<Homepage/>}/>
        < Route path='/coins/:id'  element={<Coinpage/>}/>
        </Routes>
    </BrowserRouter>
  )
}

export default App
