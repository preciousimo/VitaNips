// src/types/auth.ts
export interface AuthTokens {
    access: string;
    refresh: string;
  }

  export interface DecodedToken {
    token_type: string;
    exp: number;
    iat: number;
    jti: string;
    user_id: number;
  }
