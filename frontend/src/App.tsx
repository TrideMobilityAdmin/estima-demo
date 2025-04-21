import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import MainRoutes from './routes/routes';
import { useNavigate } from './constants/GlobalImports';

function App() {

  return (

    <MantineProvider
      theme={{
        fontFamily: "Poppins, sans-serif",
        shadows: {
          md: "1px 1px 3px rgba(0,0,0,.25)",
          xl: "5px 5px 3px rgba(0,0,0,.25)",
        },
        headings: {
          fontFamily: "Open Sans, sans-serif",
        },
      }}
    >
      <Notifications />
      <MainRoutes />
    </MantineProvider>
  )
}

export default App
