import { useState } from "react";
import { getCourses, addCourse, deleteCourse, updateCourse, enroll, unenroll, getCourseEnrollments } from "../../services/courseService";
import { useCrud } from "../../hooks/useCrud";
import { useListQuery } from "../../hooks/useListQuery";
import type { Course, CourseEnrollment, CourseForm, CourseListQuery, CoursesProps, CreateCourseBody, UpdateCourseBody } from "../../types";
import { courseFormError, isLanguage, isLevel, LANGUAGES, LEVELS } from "../../lib/validation";
import { showError } from "../../lib/errors";
import CrudList from "./CrudList";
import { ListHeader, Pager } from "./ListControls";
import CrudModal from "./CrudModal";
import bin from "../../../assets/bin.png";

const EMPTY_COURSE: CourseForm = {
    title: "",
    material: ""
}

export default function Courses({ token, users, refreshCourses, variant = "full" }: CoursesProps) {
    const [editForm, setEditForm] = useState<CourseForm>({});
    const [selectedUserId, setSelectedUserId] = useState("");
    const [addForm, setAddForm] = useState<CourseForm>({});
    const [add, setAdd] = useState(false);

    const { listRef, ...list } = useListQuery<CourseListQuery>({}, variant);

    const {
        items: courses,
        meta,
        selectedItem: selectedCourse,
        setSelectedItem: setSelectedCourse,
        addItem,
        updateItem,
        deleteItem
    } = useCrud<Course, CreateCourseBody, UpdateCourseBody, CourseListQuery>({
        token,
        getAll: getCourses,
        query: list.query,
        create: addCourse,
        update: updateCourse,
        remove: deleteCourse
    });

    async function handleAddCourse() {
        if (!token || !addForm) return;

        const problem = courseFormError(addForm);
        if (problem) {
            alert(problem);
            return;
        }
        const { title, language, level, material, instructorId } = addForm;

        try {
            await addItem({ title: title!.trim(), language: language!, level: level!, material: material!, instructorId: instructorId! });
            await refreshCourses();
            setAdd(false);
        } catch (err) {
            showError(err);
        }
    }

    async function handleDeleteCourse(courseId: number) {
        if (!token) return;
        if (confirm("Are you sure you want to delete this course?")) {
            try {
                await deleteItem(courseId);
                //console.log(data);
                await refreshCourses();
            } catch (err) {
                showError(err);
            }
        }
        else
            return;
    }

    async function handleUpdateCourse(courseId: number) {
        if (!token || !editForm) return;

        const problem = courseFormError(editForm);
        if (problem) {
            alert(problem);
            return;
        }
        const { title, language, level, material, instructorId } = editForm;

        try {
            // Enrollments are saved through their own endpoints, not with the course.
            await updateItem(courseId, { title: title!.trim(), language, level, material, instructorId });
            await refreshCourses();
            setSelectedCourse(null);
        } catch (err) {
            showError(err);
        }
    }

    async function handleEnroll(courseId: number, userId: number) {
        if (!token) return;

        try {
            await enroll(token, courseId, userId);

        } catch (err) {
            showError(err);
        }
    }

    async function handleGetEnrollments(courseId: number) {
        if (!token) return;

        try {
            const result = await getCourseEnrollments(token, courseId);
            setEditForm(prev => ({
                ...prev!,
                enrollments: result.data.map((e: CourseEnrollment) => e.user)
            }));
        } catch (err) {
            showError(err);
        }
    }

    async function handleUnenroll(courseId: number, studentId: number) {
        if (!token) return;

        try {
            await unenroll(token, courseId, studentId);

        } catch (err) {
            showError(err);
        }
    }


    const pager = <Pager meta={meta} page={list.page} onPageChange={list.setPage} variant={variant} />;

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <ListHeader
                title="Courses"
                onAdd={() => {
                    setAddForm({
                        title: EMPTY_COURSE.title,
                        language: EMPTY_COURSE.language,
                        level: EMPTY_COURSE.level,
                        material: EMPTY_COURSE.material,
                        instructorId: EMPTY_COURSE.instructorId
                    });
                    setAdd(true);
                }}
                search={list.search}
                onSearchChange={list.setSearch}
                searchPlaceholder="Search title or instructor"
                variant={variant}
                pager={variant === "compact" ? pager : undefined}
            />
            <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto">
                <CrudList<Course>
                    items={courses}
                    getKey={(u) => u.id}
                    renderLabel={(u) =>
                        `${u.title} ${u.level}`
                    }
                    onEdit={(course) => {
                        setSelectedCourse(course);
                        setEditForm({
                            title: course.title,
                            language: course.language,
                            level: course.level,
                            material: course.material,
                            instructorId: course.instructorId,
                            enrollments: []
                        });
                        void handleGetEnrollments(course.id);
                    }}
                    onDelete={handleDeleteCourse}
                    dense={variant === "compact"}
                />
            </div>
            {variant === "full" && pager}
            <CrudModal
                open={!!add}
                onClose={() => setAdd(false)}
                onSave={() =>
                    handleAddCourse()
                }
            >
                <p className="flex justify-between items-center mb-2">
                    <strong>Course name</strong>
                    <input
                        value={addForm.title || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({
                                ...prev!,
                                title: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>
                <p className="flex justify-between items-center mb-2">
                    <strong>Language</strong>
                    <select
                        value={addForm.language || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({ ...prev, language: isLanguage(e.target.value) ? e.target.value : undefined }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    >
                        <option value="" disabled>
                            Select language
                        </option>
                        {LANGUAGES.map(language => (
                            <option key={language} value={language}>{language}</option>
                        ))}
                    </select>
                </p>
                <p className="flex justify-between items-center mb-2">
                    <strong>Level</strong>
                    <select
                        value={addForm.level || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({ ...prev, level: isLevel(e.target.value) ? e.target.value : undefined }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    >
                        <option value="" disabled>
                            Select level
                        </option>
                        {LEVELS.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </p>
                <p className="flex justify-between items-center mb-3">
                    <strong>Material</strong>
                    <textarea
                        value={addForm.material || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({ ...prev, material: e.target.value }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>
                <p className="flex justify-between items-center mb-2">
                    <strong>Instructor</strong>
                    <select
                        value={addForm.instructorId || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({
                                ...prev,
                                instructorId: e.target.value ? Number(e.target.value) : undefined,
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    >
                        <option value="">Select an instructor</option>

                        {users
                            .filter(user => user.role === "instructor")
                            .map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.firstName} {user.secondName}
                                </option>
                            ))}
                    </select>
                </p>
            </CrudModal>
            <CrudModal
                open={!!selectedCourse}
                onClose={() => setSelectedCourse(null)}
                onSave={() =>
                    handleUpdateCourse(selectedCourse!.id)
                }
            >
                <p className="flex justify-between items-center mb-2">
                    <strong>Course name</strong>
                    <input
                        value={editForm.title || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({
                                ...prev!,
                                title: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>
                <p className="flex justify-between items-center mb-2">
                    <strong>Language</strong>
                    <select
                        value={editForm.language || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({ ...prev, language: isLanguage(e.target.value) ? e.target.value : undefined }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    >
                        {LANGUAGES.map(language => (
                            <option key={language} value={language}>{language}</option>
                        ))}
                    </select>
                </p>
                <p className="flex justify-between items-center mb-2">
                    <strong>Level</strong>
                    <select
                        value={editForm.level || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({ ...prev, level: isLevel(e.target.value) ? e.target.value : undefined }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    >
                        {LEVELS.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </p>
                <p className="flex justify-between items-center mb-3">
                    <strong>Material</strong>
                    <textarea
                        value={editForm.material || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({ ...prev, material: e.target.value }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>
                <p className="flex justify-between items-center mb-2">
                    <strong>Instructor</strong>
                    <select
                        value={editForm.instructorId || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({
                                ...prev,
                                instructorId: e.target.value ? Number(e.target.value) : undefined,
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    >
                        <option value="">Select an instructor</option>

                        {users
                            .filter(user => user.role === "instructor")
                            .map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.firstName} {user.secondName}
                                </option>
                            ))}
                    </select>
                </p>

                <div className="mb-2">
                    <strong>Enrollments</strong>

                    {/* Add course */}
                    <div className="flex gap-2 mt-2 mb-2">
                        <select
                            value={selectedUserId}
                            onChange={(e) =>
                                setSelectedUserId(e.target.value)
                            }
                            className="border rounded p-1 flex-1"
                        >
                            <option value="">Select student</option>

                            {users
                                .filter(u => u.role === "student")
                                .map(user => (
                                <option
                                    key={user.id}
                                    value={user.id}
                                >
                                    {user.secondName}, {user.firstName}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => {
                                const user = users.find(
                                    c =>
                                        c.id === Number(selectedUserId)
                                );

                                if (!user) return;

                                setEditForm(prev => ({
                                    ...prev!,
                                    enrollments: [
                                        ...(prev?.enrollments ?? []),
                                        user,
                                    ].sort((a, b) =>
                                        a.secondName.localeCompare(b.secondName) ||
                                        a.firstName.localeCompare(b.firstName) ||
                                        a.id - b.id
                                    ),
                                }));

                                handleEnroll(
                                    selectedCourse!.id,
                                    Number(selectedUserId)
                                );

                                setSelectedUserId("");
                            }}
                        >
                            ➕
                        </button>
                    </div>

                    {editForm.enrollments?.map(user => (
                        <div
                            key={user.id}
                            className="flex justify-between items-center border-gray-200 rounded p-1 mb-1"
                        >
                            <span>{user.secondName}, {user.firstName}</span>

                            <button
                                type="button"
                                onClick={() => {
                                    setEditForm(prev => ({
                                        ...prev!,
                                        enrollments:
                                            prev?.enrollments?.filter(
                                                c => c.id !== user.id
                                            ) ?? [],
                                    }));

                                    handleUnenroll(selectedCourse!.id, user.id);
                                }}
                            >
                                <img
                                    src={bin} alt="Delete" 
                                    className="w-5 h-5 cursor-pointer hover:opacity-70" 
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </CrudModal>
        </div>
    );
}