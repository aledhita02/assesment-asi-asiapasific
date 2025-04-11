import React from 'react';
import { createRoot } from 'react-dom/client';
import Clients from './components/Clients';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<Clients />);
