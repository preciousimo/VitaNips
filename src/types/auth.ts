export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    // Add other user fields from your UserSerializer as needed
    phone_number?: string | null;
    date_of_birth?: string | null;
    profile_picture?: string | null;
    // ... other fields
  }
  
  export interface AuthTokens {
    access: string;
    refresh: string;
  }
  
  // Interface for the decoded JWT payload (adjust based on your actual token)
  export interface DecodedToken {
    token_type: string;
    exp: number; // Expiration timestamp
    iat: number; // Issued at timestamp
    jti: string;
    user_id: number;
    // Add any other custom claims your backend includes
  }