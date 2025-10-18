import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';

// Mock axios
jest.mock('axios');
const axios = require('axios');

const MockedLoginPage = () => (
  <BrowserRouter>
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  </BrowserRouter>
);

describe('LoginPage', () => {
  beforeEach(() => {
    axios.post.mockClear();
  });

  test('renders login form', () => {
    render(<MockedLoginPage />);
    
    expect(screen.getByText('智能旅行规划')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('用户名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        access_token: 'test-token',
        user: { id: 1, username: 'testuser' }
      }
    });

    render(<MockedLoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('用户名'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('密码'), {
      target: { value: 'testpass' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: '登录' }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'testuser',
        password: 'testpass'
      });
    });
  });

  test('shows error on login failure', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: '用户名或密码错误' } }
    });

    render(<MockedLoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('用户名'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('密码'), {
      target: { value: 'wrongpass' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: '登录' }));
    
    await waitFor(() => {
      expect(screen.getByText('用户名或密码错误')).toBeInTheDocument();
    });
  });
});
