require('dotenv').config();

const express = require('express');
const cors = require('cors');
const offencesRouter = require('./routes/offences');
const casesRouter = require('./routes/cases');
const eligibilityRouter = require('./routes/eligibility');
const authRouter = require('./routes/auth');
const familyRouter = require('./routes/family');
const lawyersRouter = require('./routes/lawyers');
const legalAidRouter = require('./routes/legalAid');
const policeRouter = require('./routes/police');
const { authenticateToken, requireRole } = require('./middleware/auth');
const { initReview2 } = require('./database/initReview2');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Review 2 schema and seeds
initReview2().catch(err => {
  console.error('Error during Review 2 DB init:', err);
});

// =====================================================
// PUBLIC ROUTES
// =====================================================

// Auth (login, etc.)
app.use('/api/auth', authRouter);

// Offences (reference data, non-sensitive)
app.use('/api/offences', offencesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'JusticeFlow Legal-Aid Assistant' });
});

// =====================================================
// REVIEW 1 PRESERVED ROUTES (LAWYER / CASES)
// =====================================================

// Cases — POLICE creates cases, LAWYER & POLICE can view/screen cases
app.use(
  '/api/cases',
  authenticateToken,
  (req, res, next) => {
    if (req.method === 'GET') {
      return requireRole('LAWYER', 'POLICE')(req, res, next);
    }
    // Only POLICE can create/register new cases
    return requireRole('POLICE')(req, res, next);
  },
  casesRouter
);

// Eligibility — LAWYER only (existing deterministic eligibility engine)
app.use('/api/eligibility', authenticateToken, requireRole('LAWYER'), eligibilityRouter);

// =====================================================
// REVIEW 2 WORKSPACE ROUTES
// =====================================================

// Family Member portal
app.use('/api/family', familyRouter);

// Lawyer requests & priority queue
app.use('/api/lawyers', lawyersRouter);

// Factual Legal-Aid Lawyer Directory
app.use('/api/legal-aid', legalAidRouter);

// Police portal
app.use('/api/police', policeRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`JusticeFlow backend running on port ${PORT}`);
});
