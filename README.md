# CSMS Frontend

Frontend interface for the **Coop Security & Monitoring System (CSMS)** - a comprehensive poultry security and monitoring solution.

This is a Svelte-based single-page application that provides real-time monitoring and control of your coop's security infrastructure. It communicates with the FastAPI backend running on a Raspberry Pi gateway.

## Related Repository

**Backend/Gateway API:** https://github.com/PauWol/CSMS-Gateway-API

The backend serves this frontend and handles communication with the ESP32 gateway and distributed security nodes via ESP-NOW mesh network.

## Features

- **Real-time Monitoring**: Check device liveness, status, and sensor data
- **Threat Assessment**: View threat scores and security alerts
- **Sensor Data Visualization**: Access temperature, humidity, and other sensor readings
- **Configuration Management**: Update device settings and wake cycles
- **Data Export**: Retrieve and convert binary logs to CSV or JSON formats
- **Responsive UI**: Works on desktop and mobile devices
- **Interactive Guided Tour**: Onboard new users with system features

## Tech Stack

- **Svelte 5** - Reactive frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **Flowbite Svelte** - Component library
- **REST API** - Communication with FastAPI backend

## Prerequisites

- Node.js 18+ and npm/pnpm
- Access to CSMS Gateway API backend (see [related repository](https://github.com/PauWol/CSMS-Gateway-API))

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default. The frontend automatically uses dynamic API URLs to communicate with the backend, ensuring compatibility across local network configurations.

## Building

Build for production:

```bash
npm run build
```

The build output is generated in the `dist` directory.

## Deployment

This frontend is automatically served by the CSMS Gateway API backend. Build the frontend and follow the deployment instructions in the [backend repository](https://github.com/PauWol/CSMS-Gateway-API).

## Architecture

The frontend communicates with the Gateway API via REST endpoints to:
- Retrieve real-time status and sensor data
- Request device logs and historical data
- Send configuration updates to devices
- Monitor mesh network health

## Development Setup

**Recommended IDE:** [VS Code](https://code.visualstudio.com/) + [Svelte extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)

## License

Licensed under AGPL-3.0-or-later © 2026 PauWol