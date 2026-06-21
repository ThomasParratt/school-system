
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
    enrollments: User[];
};

export type Session = {
    id: number;
    location: string;
    startsAt: string;
    endsAt: string;
    content: string | null;
    homework: string | null;
    courseId: number
};

export type Enrollment = {
    id: number;
    courseId: number;
    userId: number;
};

export type UserEnrollment = {
    course: Course;
    courseId: number;
    id: number;
    userId: number;
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