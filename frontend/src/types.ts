import type { Course as CourseDto, CourseEnrollment } from "@school/contracts";

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

// A course as the API answers it (the contract), plus the students the admin
// page loads into it when one is opened.
export type Course = CourseDto & {
    enrollments?: Pick<User, "id" | "firstName" | "secondName">[];
};

export type { CourseEnrollment };

export type Session = {
    id: number;
    location: string;
    startsAt: string;
    endsAt: string;
    content: string | null;
    homework: string | null;
    courseId: number;
};


export type Enrollment = {
    id: number;
    courseId: number;
    userId: number;
    user: User;
    course: Course;
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

export type CoursesProps = {
    token: string | null;
    users: User[];
    courses: Course[];
    refreshCourses: () => Promise<void>;
}

export type MyCoursesProps = {
    token: string | null;
    courses: Course[];
}

export type UsersProps = {
    token: string | null;
    users: User[];
    courses: Course[];
    refreshUsers: () => Promise<void>;
}

export type MyStudentsProps = {
    token: string | null;
    users: User[];
    courses: Course[];
}

export type CalendarProps = {
    token: string | null;
    courses: Course[];
    sessions: Session[];
    refreshSessions: () => Promise<void>;
};

export type MyLessonsProps = {
    token: string | null;
    courses: Course[];
    sessions: Session[];
};