// Production-ready Google Ads API Server
const express = require('express');
const cors = require('cors');
const { GoogleAdsApi } = require('google-ads-api');
const dotenv = require('dotenv');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration for production
app.use(cors({
  // Allow all production and development domains
  origin: [
    'https://aqassvhw.manus.space',
    'https://nszrknkg.manus.space',
    'https://ctiqwrin.manus.space',
    'https://5180-ib7eoxy941w126b5aomry-07af5fe8.manusvm.computer',
    'https://5173-iu13e8wey282ke9jnfhby-07af5fe8.manusvm.computer',
    'http://localhost:5180',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(bodyParser.json());

// Secure storage for API credentials (in production, use a database)
const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
// Fix encryption key length to be exactly 32 bytes (256 bits) for AES-256-CBC
const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY || 'secure-production-encryption-key-for-google-ads-api').slice(0, 32).padEnd(32, '0');

// Encryption utilities
const encryptData = (data) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), data: encrypted.toString('hex') };
};

const decryptData = (encryptedData) => {
  try {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const encryptedText = Buffer.from(encryptedData.data, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Save credentials securely
const saveCredentials = (credentials) => {
  try {
    const encrypted = encryptData(credentials);
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(encrypted));
    return true;
  } catch (error) {
    console.error('Error saving credentials:', error);
    return false;
  }
};

// Load credentials securely
const loadCredentials = () => {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const encrypted = JSON.parse(fs.readFileSync(CREDENTIALS_FILE));
      return decryptData(encrypted);
    }
    return null;
  } catch (error) {
    console.error('Error loading credentials:', error);
    return null;
  }
};

// Initialize Google Ads API client
const initializeGoogleAdsClient = (credentials) => {
  try {
    return new GoogleAdsApi({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      developer_token: credentials.developerToken
    });
  } catch (error) {
    console.error('Error initializing Google Ads client:', error);
    return null;
  }
};

// Get customer instance with refresh token
const getCustomer = (client, credentials) => {
  try {
    return client.Customer({
      customer_id: credentials.managerId || '',
      refresh_token: credentials.refreshToken,
      login_customer_id: credentials.managerId || ''
    });
  } catch (error) {
    console.error('Error getting customer instance:', error);
    return null;
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

// API Routes

// Save API credentials
app.post('/api/credentials', async (req, res) => {
  try {
    const credentials = req.body;
    
    // Validate required fields
    if (!credentials.clientId || !credentials.clientSecret || 
        !credentials.developerToken || !credentials.refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required credentials' 
      });
    }
    
    // Save credentials
    const saved = saveCredentials(credentials);
    if (!saved) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save credentials' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'API credentials saved successfully' 
    });
  } catch (error) {
    console.error('Error saving credentials:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: error.message 
    });
  }
});

// Test API connection
app.post('/api/test-connection', async (req, res) => {
  try {
    const credentials = req.body;
    
    // Validate required fields
    if (!credentials.clientId || !credentials.clientSecret || 
        !credentials.developerToken || !credentials.refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required credentials' 
      });
    }
    
    // Initialize client
    const client = initializeGoogleAdsClient(credentials);
    if (!client) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to initialize Google Ads client' 
      });
    }
    
    // Get customer instance
    const customer = getCustomer(client, credentials);
    if (!customer) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get customer instance' 
      });
    }
    
    // Test connection by listing accessible accounts
    const accounts = await customer.listAccessibleCustomers();
    
    // Save credentials if connection is successful
    saveCredentials(credentials);
    
    res.json({
      success: true,
      message: 'Successfully connected to Google Ads API',
      accounts: accounts.resource_names.map(name => {
        const id = name.split('/')[1];
        return { id, name: `Account ${id}` };
      }),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect to Google Ads API', 
      error: error.message 
    });
  }
});

// Get Google Ads accounts
app.get('/api/accounts', async (req, res) => {
  try {
    // Load saved credentials
    const credentials = loadCredentials();
    if (!credentials) {
      return res.status(400).json({ 
        success: false, 
        message: 'No API credentials found' 
      });
    }
    
    // Initialize client
    const client = initializeGoogleAdsClient(credentials);
    if (!client) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to initialize Google Ads client' 
      });
    }
    
    // Get customer instance
    const customer = getCustomer(client, credentials);
    if (!customer) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get customer instance' 
      });
    }
    
    // List accessible accounts
    const accounts = await customer.listAccessibleCustomers();
    
    res.json({
      success: true,
      accounts: accounts.resource_names.map(name => {
        const id = name.split('/')[1];
        return {
          id,
          name: `Account ${id}`,
          type: 'google_ads',
          status: 'active'
        };
      })
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch Google Ads accounts', 
      error: error.message 
    });
  }
});

// Get account metrics
app.get('/api/metrics/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { period } = req.query;
    
    // Load saved credentials
    const credentials = loadCredentials();
    if (!credentials) {
      return res.status(400).json({ 
        success: false, 
        message: 'No API credentials found' 
      });
    }
    
    // Initialize client
    const client = initializeGoogleAdsClient(credentials);
    if (!client) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to initialize Google Ads client' 
      });
    }
    
    // Get customer instance
    const customer = getCustomer(client, credentials);
    if (!customer) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get customer instance' 
      });
    }
    
    // Determine date range based on period
    let dateRange;
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    
    switch (period) {
      case '7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        dateRange = `date_range: { start_date: "${sevenDaysAgo.toISOString().split('T')[0]}", end_date: "${endDate}" }`;
        break;
      case '30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        dateRange = `date_range: { start_date: "${thirtyDaysAgo.toISOString().split('T')[0]}", end_date: "${endDate}" }`;
        break;
      case 'month':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        dateRange = `date_range: { start_date: "${firstDayOfMonth.toISOString().split('T')[0]}", end_date: "${endDate}" }`;
        break;
      default:
        const defaultDaysAgo = new Date(today);
        defaultDaysAgo.setDate(today.getDate() - 30);
        dateRange = `date_range: { start_date: "${defaultDaysAgo.toISOString().split('T')[0]}", end_date: "${endDate}" }`;
    }
    
    // Query for metrics
    const query = `
      SELECT
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.all_conversions
      FROM customer
      WHERE ${dateRange}
    `;
    
    const response = await customer.query(query);
    
    // Process and format the metrics
    const metrics = response[0] || {};
    const costMicros = parseInt(metrics.metrics?.cost_micros || 0);
    const conversions = parseFloat(metrics.metrics?.conversions || 0);
    const costPerConversion = conversions > 0 ? (costMicros / 1000000) / conversions : 0;
    
    res.json({
      success: true,
      metrics: {
        impressions: parseInt(metrics.metrics?.impressions || 0),
        clicks: parseInt(metrics.metrics?.clicks || 0),
        cost: costMicros / 1000000, // Convert micros to standard currency
        conversions: conversions,
        costPerLead: costPerConversion,
        period
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch account metrics', 
      error: error.message 
    });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
