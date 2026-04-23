import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BreakingTicker from './components/BreakingTicker';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import RegionPage from './pages/RegionPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import SourcePage from './pages/SourcePage';
import AdminPage from './pages/AdminPage';
import ArticlePage from './pages/ArticlePage';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <BreakingTicker />
        <div className="main-content">
          <Sidebar />
          <main style={{ flex: 1, padding: '2rem' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:id" element={<ArticlePage />} />
              <Route path="/region/:regionName" element={<RegionPage />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/source/:sourceName" element={<SourcePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
