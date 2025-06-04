const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const oauth2Helper = require('./oauth2Helper');

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:5180'];

app.use(cors({
  origin: function(origin, callback ) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Encryption setup
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; // Must be 32 bytes for aes-256-cbc
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// Credential storage
const DS_STORE_PATH = path.join(__dirname, '.DS_Store');

function saveCredentials(credentials) {
  try {
    const encryptedData = encrypt(JSON.stringify(credentials));
    fs.writeFileSync(DS_STORE_PATH, encryptedData);
    return true;
  } catch (error) {
    console.error('Error saving credentials:', error);
    return false;
  }
}

function getCredentials() {
  try {
    if (!fs.existsSync(DS_STORE_PATH)) {
      return null;
    }
    const encryptedData = fs.readFileSync(DS_STORE_PATH, 'utf8');
    const decryptedData = decrypt(encryptedData);
    if (!decryptedData) return null;
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error reading credentials:', error);
    return null;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API endpoints
app.post('/api/credentials', (req, res) => {
  const { developerToken, clientId, clientSecret, refreshToken } = req.body;
  
  if (!developerToken || !clientId || !clientSecret || !refreshToken) {
    return res.status(400).json({ error: 'Missing required credentials' });
  }
  
  const credentials = { developerToken, clientId, clientSecret, refreshToken };
  const saved = saveCredentials(credentials);
  
  if (saved) {
    res.json({ success: true, message: 'Credentials saved successfully' });
  } else {
    res.status(500).json({ error: 'Failed to save credentials' });
  }
});

app.get('/api/credentials', (req, res) => {
  const credentials = getCredentials();
  if (credentials) {
    // Don't send the actual credentials, just confirmation they exist
    res.json({ 
      exists: true, 
      hasRefreshToken: !!credentials.refreshToken,
      hasDeveloperToken: !!credentials.developerToken,
      hasClientId: !!credentials.clientId,
      hasClientSecret: !!credentials.clientSecret
    });
  } else {
    res.json({ exists: false });
  }
});

app.delete('/api/credentials', (req, res) => {
  try {
    if (fs.existsSync(DS_STORE_PATH)) {
      fs.unlinkSync(DS_STORE_PATH);
    }
    res.json({ success: true, message: 'Credentials deleted successfully' });
  } catch (error) {
    console.error('Error deleting credentials:', error);
    res.status(500).json({ error: 'Failed to delete credentials' });
  }
});

app.post('/api/test-connection', async (req, res) => {
  try {
    const credentials = getCredentials();
    if (!credentials) {
      return res.status(400).json({ error: 'No credentials found' });
    }

    const { developerToken, clientId, clientSecret, refreshToken } = credentials;
    
    // Create OAuth2 client
    const oAuth2Client = new OAuth2Client(
      clientId,
      clientSecret,
      'urn:ietf:wg:oauth:2.0:oob'
    );
    
    // Set refresh token
    oAuth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    // Get a valid access token
    const tokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = tokenResponse.token;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Failed to get access token' });
    }
    
    // Test the connection to Google Ads API
    const accounts = await oauth2Helper.getAccountList(accessToken, developerToken);
    
    res.json({ 
      success: true, 
      message: 'Connection successful', 
      accounts: accounts
    });
  } catch (error) {
    console.error('API connection test error:', error);
    res.status(500).json({ 
      error: 'Connection test failed', 
      message: error.message || 'Unknown error',
      details: error.response?.data || {}
    });
  }
});

app.get('/api/accounts', async (req, res) => {
  try {
    const credentials = getCredentials();
    if (!credentials) {
      return res.status(400).json({ error: 'No credentials found' });
    }

    const { developerToken, clientId, clientSecret, refreshToken } = credentials;
    
    // Create OAuth2 client
    const oAuth2Client = new OAuth2Client(
      clientId,
      clientSecret,
      'urn:ietf:wg:oauth:2.0:oob'
    );
    
    // Set refresh token
    oAuth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    // Get a valid access token
    const tokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = tokenResponse.token;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Failed to get access token' });
    }
    
    // Get accounts from Google Ads API
    const accounts = await oauth2Helper.getAccountList(accessToken, developerToken);
    
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch accounts', 
      message: error.message || 'Unknown error',
      details: error.response?.data || {}
    });
  }
});

app.get('/api/metrics/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const credentials = getCredentials();
    
    if (!credentials) {
      return res.status(400).json({ error: 'No credentials found' });
    }

    const { developerToken, clientId, clientSecret, refreshToken } = credentials;
    
    // Create OAuth2 client
    const oAuth2Client = new OAuth2Client(
      clientId,
      clientSecret,
      'urn:ietf:wg:oauth:2.0:oob'
    );
    
    // Set refresh token
    oAuth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    // Get a valid access token
    const tokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = tokenResponse.token;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Failed to get access token' });
    }
    
    // Get metrics from Google Ads API
    const metrics = await oauth2Helper.getAccountMetrics(
      accessToken, 
      developerToken,
      accountId
    );
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch metrics', 
      message: error.message || 'Unknown error',
      details: error.response?.data || {}
    });
  }
});

app.get('/api/conversions/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const credentials = getCredentials();
    
    if (!credentials) {
      return res.status(400).json({ error: 'No credentials found' });
    }

    const { developerToken, clientId, clientSecret, refreshToken } = credentials;
    
    // Create OAuth2 client
    const oAuth2Client = new OAuth2Client(
      clientId,
      clientSecret,
      'urn:ietf:wg:oauth:2.0:oob'
    );
    
    // Set refresh token
    oAuth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    // Get a valid access token
    const tokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = tokenResponse.token;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Failed to get access token' });
    }
    
    // Get conversion data from Google Ads API
    const conversions = await oauth2Helper.getConversionData(
      accessToken, 
      developerToken,
      accountId
    );
    
    res.json(conversions);
  } catch (error) {
    console.error('Error fetching conversions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversions', 
      message: error.message || 'Unknown error',
      details: error.response?.data || {}
    });
  }
});

// Use Heroku's dynamic port or fallback to 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
