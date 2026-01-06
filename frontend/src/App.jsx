import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePostPage from './pages/CreatePostPage';
import CategoryPage from './pages/CategoryPage';
import LatestPage from './pages/LatestPage';
import PostDetailPage from './pages/PostDetailPage';
import DashboardPage from './pages/DashboardPage';
import EditPostPage from './pages/EditPostPage';
import CommunitiesPage from './pages/CommunitiesPage';
import VlogPage from './pages/VlogPage';
import VlogDetailPage from './pages/VlogDetailPage';
import HelpPage from './pages/HelpPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected/Layout Routes */}
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route path="/submit" element={
          <Layout>
            <CreatePostPage />
          </Layout>
        } />
        <Route path="/latest" element={
          <Layout>
            <LatestPage />
          </Layout>
        } />
        <Route path="/r/:slug" element={
          <Layout>
            <CategoryPage />
          </Layout>
        } />
        <Route path="/post/:id" element={
          <Layout>
            <PostDetailPage />
          </Layout>
        } />
        <Route path="/dashboard" element={
          <Layout>
            <DashboardPage />
          </Layout>
        } />
        <Route path="/post/edit/:id" element={
          <Layout>
            <EditPostPage />
          </Layout>
        } />
        <Route path="/communities" element={
          <Layout>
            <CommunitiesPage />
          </Layout>
        } />
        <Route path="/vlog" element={
          <Layout>
            <VlogPage />
          </Layout>
        } />
        <Route path="/vlog/:id" element={
          <Layout>
            <VlogDetailPage />
          </Layout>
        } />
        <Route path="/help" element={
          <Layout>
            <HelpPage />
          </Layout>
        } />
        {/* Add more routes wrapped in Layout here */}
      </Routes>
    </Router>
  );
}

export default App;
