
export type User = {
    id: number;
    firstName: string;
    secondName: string;
    email: string;
    role: string;
};

export type LoginResponse = {
  data: {
    user: User;
    token: string;
  };
};

export type AuthState = {
    token: string;
    user: User;
};

export type ApiErrorResponse = {
    error?: {
        message?: string;
        code?: string;
    };
};