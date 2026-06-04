
export type User = {
    id: number;
    firstName: string;
    secondName: string;
    email: string;
    role: string;
};

export type Course = {
    id: number;
    title: string;
    level: string;
    material: string;
};

export type LoginResponse = {
  data: {
    user: User;
    token: string;
  };
};

export type ApiErrorResponse = {
    error?: {
        message?: string;
        code?: string;
    };
};