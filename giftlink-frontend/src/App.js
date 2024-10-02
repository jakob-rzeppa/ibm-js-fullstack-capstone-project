import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainPage from './components/MainPage/MainPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import DetailsPage from './components/DetailsPage/DetailsPage';
import SearchPage from './components/SearchPage/SearchPage';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';

function App() {

  return (
    <>
        <Navbar/>
        <Routes>
          {/* the final code will not pass the products to every page, but each page will call the server API */}
          <Route path="/" element={<MainPage />} />
          <Route path="/app" element={<MainPage />} />
          <Route path="/app/product/:productId" element={<DetailsPage/>} />
          <Route path="/app/search" element={<SearchPage/>} />          
          <Route path="/app/login" element={<LoginPage />} />
          <Route path="/app/register" element={<RegisterPage />} />
        </Routes>
        </>
  );
}

export default App;
