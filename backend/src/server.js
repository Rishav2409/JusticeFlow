const express = require('express');
const cors = require('cors');
const offencesRouter = require('./routes/offences');
const casesRouter = require('./routes/cases');
const eligibilityRouter = require('./routes/eligibility');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/offences', offencesRouter);
app.use('/api/cases', casesRouter);
app.use('/api/eligibility', eligibilityRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'NyayaFlow Backend' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`NyayaFlow backend running on port ${PORT}`);
});
