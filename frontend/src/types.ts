
export type User = {
    id: number;
    firstName: string;
    secondName: string;
    email: string;
    password: string;
    role: string;
    comments: string | null;
    enrollments: Course[];
};

export type Course = {
    id: number;
    title: string;
    language: string;
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