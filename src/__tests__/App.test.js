// Save at: src/__tests__/App.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

test('renders App', () => {
  render(<App />);
  expect(screen.getByText(/Welcome to KalKode/i)).toBeInTheDocument();
});
