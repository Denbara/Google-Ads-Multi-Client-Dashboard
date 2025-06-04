/**
 * Google Ads API OAuth2 Helper
 * 
 * This module provides utilities for handling OAuth2 authentication with Google Ads API
 */

const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Token storage file
const TOKEN_FILE = path.join(__dirname, 'tokens.json');

/**
 * Create OAuth2 client for Google Ads API authentication
 * @param {Object} credentials - OAuth credentials
 * @returns {OAuth2Client} - Google OAuth2 client
 */
const createOAuth2Client = (credentials) => {
  return new OAuth2Client(
    credentials.clientId,
    credentials.clientSecret,
    'https://developers.google.com/oauthplayground' // Default redirect URI for token generation
  );
};

/**
 * Generate authentication URL for OAuth2 flow
 * @param {Object} credentials - OAuth credentials
 * @returns {string} - Authorization URL
 */
const getAuthUrl = (credentials) => {
  const oauth2Client = createOAuth2Client(credentials);
  
  const scopes = [
    'https://www.googleapis.com/auth/adwords'
  ];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Force to get refresh token
  });
};

/**
 * Exchange authorization code for tokens
 * @param {Object} credentials - OAuth credentials
 * @param {string} code - Authorization code
 * @returns {Promise<Object>} - Token response
 */
const getTokenFromCode = async (credentials, code) => {
  const oauth2Client = createOAuth2Client(credentials);
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 * @param {Object} credentials - OAuth credentials with refresh token
 * @returns {Promise<Object>} - Updated tokens
 */
const refreshAccessToken = async (credentials) => {
  const oauth2Client = createOAuth2Client(credentials);
  oauth2Client.setCredentials({
    refresh_token: credentials.refreshToken
  });
  
  try {
    const { credentials: tokens } = await oauth2Client.refreshAccessToken();
    return tokens;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

/**
 * Validate OAuth credentials
 * @param {Object} credentials - OAuth credentials
 * @returns {boolean} - Whether credentials are valid
 */
const validateCredentials = (credentials) => {
  return !!(
    credentials &&
    credentials.clientId &&
    credentials.clientSecret &&
    credentials.refreshToken &&
    credentials.developerToken
  );
};

/**
 * Save tokens to file (for development only)
 * @param {Object} tokens - OAuth tokens
 */
const saveTokens = (tokens) => {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};

/**
 * Load tokens from file (for development only)
 * @returns {Object|null} - OAuth tokens or null if not found
 */
const loadTokens = () => {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE));
    }
    return null;
  } catch (error) {
    console.error('Error loading tokens:', error);
    return null;
  }
};

module.exports = {
  createOAuth2Client,
  getAuthUrl,
  getTokenFromCode,
  refreshAccessToken,
  validateCredentials,
  saveTokens,
  loadTokens
};
