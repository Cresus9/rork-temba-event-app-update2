import { Platform } from 'react-native';

// Secret key for encryption - should match the web app
const SECRET_KEY = 'default-secret-key'; // In production, this should come from environment variables

/**
 * Creates a simple signature for the payload
 * This is a basic implementation that works across all platforms
 */
function createSignature(data: string, secret: string): string {
  // Simple hash function that works consistently across platforms
  let hash = 0;
  const combinedString = data + secret;
  
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hex string and ensure it's always positive
  return Math.abs(hash).toString(16);
}

/**
 * Base64 encoding function that works in React Native
 */
function base64Encode(str: string): string {
  try {
    // Use native btoa if available (web)
    if (typeof btoa === 'function') {
      return btoa(str);
    }
    
    // For React Native, implement base64 encoding
    // This is a simplified implementation
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    let i = 0;
    
    while (i < str.length) {
      const char1 = str.charCodeAt(i++);
      const char2 = i < str.length ? str.charCodeAt(i++) : 0;
      const char3 = i < str.length ? str.charCodeAt(i++) : 0;
      
      const enc1 = char1 >> 2;
      const enc2 = ((char1 & 3) << 4) | (char2 >> 4);
      const enc3 = ((char2 & 15) << 2) | (char3 >> 6);
      const enc4 = char3 & 63;
      
      if (isNaN(char2)) {
        result += chars.charAt(enc1) + chars.charAt(enc2) + '==';
      } else if (isNaN(char3)) {
        result += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + '=';
      } else {
        result += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Base64 encoding error:', error);
    throw new Error('Failed to encode data');
  }
}

/**
 * Base64 decoding function that works in React Native
 */
function base64Decode(str: string): string {
  try {
    // Use native atob if available (web)
    if (typeof atob === 'function') {
      return atob(str);
    }
    
    // For React Native, implement base64 decoding
    // This is a simplified implementation
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    let i = 0;
    
    // Remove padding characters
    str = str.replace(/=+$/, '');
    
    while (i < str.length) {
      const enc1 = chars.indexOf(str.charAt(i++));
      const enc2 = chars.indexOf(str.charAt(i++));
      const enc3 = chars.indexOf(str.charAt(i++));
      const enc4 = chars.indexOf(str.charAt(i++));
      
      const char1 = (enc1 << 2) | (enc2 >> 4);
      const char2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const char3 = ((enc3 & 3) << 6) | enc4;
      
      result += String.fromCharCode(char1);
      
      if (enc3 !== 64) {
        result += String.fromCharCode(char2);
      }
      if (enc4 !== 64) {
        result += String.fromCharCode(char3);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Base64 decoding error:', error);
    throw new Error('Failed to decode data');
  }
}

/**
 * Generates QR code data using a simple signature-based approach
 * This method works consistently across all platforms (iOS, Android, Web)
 */
export const generateQRData = (ticketId: string): string => {
  try {
    if (!ticketId) {
      throw new Error('Ticket ID is required');
    }
    
    console.log('Generating QR data for ticket:', ticketId);
    
    // Create a payload with ticket ID and timestamp
    const payload = {
      id: ticketId,
      timestamp: Date.now(),
      version: '1.0' // Adding version for future compatibility
    };
    
    // Convert to JSON string
    const jsonData = JSON.stringify(payload);
    
    // Create a simple signature
    const signature = createSignature(jsonData, SECRET_KEY);
    
    // Combine the payload and signature
    const result = {
      data: payload,
      sig: signature
    };
    
    // Return as base64 encoded string for QR code
    return base64Encode(JSON.stringify(result));
  } catch (error) {
    console.error('Error generating QR data:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Decodes and validates the QR data
 */
export const decodeQRData = (encodedData: string): { id: string; timestamp: number } => {
  try {
    if (!encodedData) {
      throw new Error('QR data is required');
    }
    
    // Decode the base64 string
    const jsonString = base64Decode(encodedData);
    const data = JSON.parse(jsonString);
    
    // Extract payload and signature
    const { data: payload, sig } = data;
    
    // Verify the signature
    const calculatedSignature = createSignature(JSON.stringify(payload), SECRET_KEY);
    if (sig !== calculatedSignature) {
      throw new Error('Invalid signature');
    }
    
    // Check if the ticket has expired (24 hour validity)
    const now = Date.now();
    if (now - payload.timestamp > 24 * 60 * 60 * 1000) {
      throw new Error('Ticket QR code has expired');
    }
    
    return {
      id: payload.id,
      timestamp: payload.timestamp
    };
  } catch (error) {
    console.error('Error decoding QR data:', error);
    throw new Error('Invalid QR code');
  }
};

export const validateTicketQR = async (qrData: string): Promise<boolean> => {
  try {
    const decoded = decodeQRData(qrData);
    
    // Additional validation logic can be added here
    // For example, checking against a database to ensure the ticket exists and is valid
    
    return true;
  } catch (error) {
    console.error('QR validation failed:', error);
    return false;
  }
};