// src/types/auth.ts
// --- Authentication Tokens ---
export interface AuthTokens {
    access: string;
    refresh: string;
  }
  
  // --- Decoded JWT Payload ---
  // (Adjust based on your actual token claims)
  export interface DecodedToken {
    token_type: string;
    exp: number; // Expiration timestamp
    iat: number; // Issued at timestamp
    jti: string; // JWT ID
    user_id: number;
    // Add any other custom claims your backend includes in the token
  }
  
  // Note: The main 'User' interface definition has been moved to 'src/types/user.ts'
  // Files that need the User type (like AuthContext) should now import it from there.