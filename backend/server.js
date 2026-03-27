const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const riskData = [
  { city: 'Chennai', latitude: 13.0827, longitude: 80.2707, risk: 'High' },
  { city: 'Mumbai', latitude: 19.076, longitude: 72.8777, risk: 'High' },
  { city: 'New York', latitude: 40.7128, longitude: -74.006, risk: 'Medium' },
  { city: 'Tokyo', latitude: 35.6762, longitude: 139.6503, risk: 'Medium' },
  { city: 'Jakarta', latitude: -6.2088, longitude: 106.8456, risk: 'High' }
];

const reports = [];

app.get('/api/risk-data', (req, res) => {
  res.json(riskData);
});

app.post('/api/report', (req, res) => {
  const { location, risk } = req.body;
  const report = { location, risk };

  reports.push(report);
  res.status(201).json({ message: 'Report stored successfully', report });
});

app.get('/api/reports', (req, res) => {
  res.json(reports);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
