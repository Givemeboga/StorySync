export type UserStruct = {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  email_confirmed: boolean;
  date_joined: string;
};

export type Tokens = {
  access_token: string;
  access_created_at: string;
  access_expires_at: string;
  refresh_token: string;
  refresh_created_at: string;
  refresh_expires_at: string;
};

export type AccessToken = {
  access_token: string;
  access_created_at: string;
  access_expires_at: string;
};

export type RefreshToken = {
  refresh_token: string;
  refresh_created_at: string;
  refresh_expires_at: string;
};

export type RegisterResponse = {
  message: string;
  user: UserStruct;
  tokens: Tokens;
};

export type LoginResponse = {
  message: string;
  user: UserStruct;
  tokens: Tokens;
};

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  birthdate: string;
}

export type UpdateRequest = {
  username?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  birthdate?: string;
};

export type LoginRequest = {
  identifier: string;
  password: string;
};
