# WeatherXM Insurance Platform

A comprehensive blockchain-powered crop insurance platform that integrates with WeatherXM weather data and smart contracts for automated payouts.

## Features

### 🌦️ Weather Risk Monitoring
- Real-time weather data from WeatherXM API
- Risk assessment for flood, wind, and drought conditions
- Automated alerts for extreme weather events
- Historical trend analysis

### 🛡️ Insurance Management
- Easy policy creation with customizable coverage
- Multiple crop types and coverage options
- Automated premium calculations based on risk factors
- Smart contract integration for automated payouts

### 💳 Payment System
- Cryptocurrency and traditional payment methods
- Automated monthly premium collection
- Payment history and tracking
- Overdue payment alerts

### 🔗 Chainlink Integration
- APIs designed for Chainlink automation
- Real-time weather data feeds for smart contracts
- Automated payout triggers based on weather conditions
- Transparent and trustless insurance execution

## API Endpoints

### Chainlink Automation APIs

#### Get Weather Alerts
\`\`\`
GET /api/chainlink/weather-alerts
\`\`\`
Returns current weather alerts for all monitored stations, formatted for smart contract consumption.

#### Get Station Risk Data
\`\`\`
GET /api/chainlink/station-risk/[stationId]
\`\`\`
Returns detailed risk assessment for a specific station, including payout triggers.

### Insurance Management APIs

#### Create Policy
\`\`\`
POST /api/insurance/policies
\`\`\`

#### Get Policies
\`\`\`
GET /api/insurance/policies?farmerId=[id]
\`\`\`

## Smart Contract Integration

The platform is designed to work with smart contracts that:

1. **Monitor Weather Conditions**: Automatically check weather data via Chainlink oracles
2. **Calculate Risk Levels**: Use our risk assessment algorithms
3. **Trigger Payouts**: Automatically pay farmers when conditions meet payout criteria
4. **Collect Premiums**: Handle monthly premium collection

### Example Smart Contract Flow

1. Chainlink automation calls `/api/chainlink/weather-alerts` every hour
2. If extreme weather is detected, the contract checks affected policies
3. For policies in the affected area, automatic payouts are triggered
4. Farmers receive compensation without manual claims processing

## Weather Risk Assessment

### Risk Calculation Factors

**Flood Risk:**
- Precipitation rate > 10mm/h: +40 points
- Precipitation rate > 20mm/h: +30 points
- Humidity > 90%: +20 points
- Pressure < 1000 hPa: +10 points

**Wind Risk:**
- Wind speed > 15 m/s: +30 points
- Wind speed > 25 m/s: +40 points
- Wind gusts > 30 m/s: +30 points
- Pressure < 990 hPa: +20 points

**Drought Risk:**
- Humidity < 30%: +30 points
- Temperature > 35°C: +25 points
- No precipitation: +20 points
- Extreme conditions (humidity < 20% + temp > 40°C): +25 points

### Payout Triggers

- **High Risk**: 70-79% → Partial payout (50% of coverage)
- **Extreme Risk**: 80%+ → Full payout (100% of coverage)

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Framer Motion
- **Charts**: Recharts
- **Weather Data**: WeatherXM Pro API
- **Blockchain**: Ethereum, Chainlink Automation
- **Payments**: Cryptocurrency (ETH/USDC), Traditional methods

## Getting Started

1. **Install Dependencies**
\`\`\`bash
npm install
\`\`\`

2. **Set Environment Variables**
\`\`\`bash
WEATHERXM_API_KEY=your_api_key_here
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
\`\`\`

3. **Run Development Server**
\`\`\`bash
npm run dev
\`\`\`

4. **Access the Platform**
- Weather Dashboard: `http://localhost:3000/insurance`
- Buy Insurance: `http://localhost:3000/insurance` (Buy Insurance tab)
- Premium Payments: `http://localhost:3000/insurance` (Premium Payments tab)

## API Documentation

### Weather Alerts Response Format
\`\`\`json
{
  "timestamp": "2024-01-17T15:30:00Z",
  "alertCount": 2,
  "alerts": [
    {
      "stationId": "station-123",
      "alertType": "flood",
      "severity": "extreme",
      "value": 25.5,
      "threshold": 10,
      "location": { "lat": 40.7128, "lon": -74.0060 },
      "affectedRadius": 5000,
      "shouldTriggerPayout": true
    }
  ]
}
\`\`\`

### Station Risk Response Format
\`\`\`json
{
  "stationId": "station-123",
  "timestamp": "2024-01-17T15:30:00Z",
  "risks": {
    "flood": 85,
    "wind": 45,
    "drought": 20
  },
  "shouldTriggerPayout": {
    "flood": true,
    "wind": false,
    "drought": false
  },
  "weatherData": {
    "temperature": 23.5,
    "precipitation_rate": 25.2,
    "wind_speed": 12.3,
    "humidity": 85.4,
    "pressure": 995.2
  }
}
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Open an issue on GitHub
- Contact: support@weatherxm-insurance.com
- Documentation: [docs.weatherxm-insurance.com](https://docs.weatherxm-insurance.com)
