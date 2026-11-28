import { useState } from "react";
import { getUsers, addUser, deleteUser, updateUser, getUserEnrollments } from "../../services/userService";
import { useCrud } from "../../hooks/useCrud";
import { useListQuery } from "../../hooks/useListQuery";
import type { UserEnrollment, User, UsersProps, CreateUserBody, UpdateUserBody, UserForm, UserListQuery } from "../../types";
import { isBlank, userFormError } from "../../lib/validation";
import { showError } from "../../lib/errors";
import CrudList from "./CrudList";
import { ListHeader, Pager } from "./ListControls";
import CrudModal from "./CrudModal";

const EMPTY_USER: UserForm = {
    firstName: "",
    secondName: "",
    email: "",
    password: "",
    comments: ""
}

export default function Instructors({ token, refreshUsers, variant = "full" }: UsersProps) {
    const [editForm, setEditForm] = useState<UserForm>({});
    const [addForm, setAddForm] = useState<UserForm>({});
    const [add, setAdd] = useState(false);

    const { listRef, ...list } = useListQuery<UserListQuery>({ role: "instructor" }, variant);

    const {
        items: users,
        meta,
        selectedItem: selectedUser,
        setSelectedItem: setSelectedUser,
        addItem,
        updateItem,
        deleteItem
    } = useCrud<User, CreateUserBody, UpdateUserBody, UserListQuery>({
        token,
        getAll: getUsers,
        query: list.query,
        create: addUser,
        update: updateUser,
        remove: deleteUser
    });

    async function handleAddUser() {
        if (!token || !addForm) return;

        const problem = userFormError(addForm, { requirePassword: true });
        if (problem) {
            alert(problem);
            return;
        }
        const { firstName, secondName, email, password, role, comments } = addForm;

        try {
            // A blank comment is left out: the API takes no comment, not an empty one.
            await addItem({
                firstName: firstName!.trim(),
                secondName: secondName!.trim(),
                email: email!.trim(),
                password: password!,
                role,
                comments: isBlank(comments) ? undefined : comments
            });
            await refreshUsers();
            setAdd(false);
        } catch (err) {
            showError(err);
        }
    }

    async function handleDeleteUser(userId: number) {
        if (!token) return;
        if (confirm("Are you sure you want to delete this instructor?")) {
            try {
                await deleteItem(userId);
                await refreshUsers();
            } catch (err) {
                showError(err);
            }
        }
        else
            return;
    }

    async function handleUpdateUser(userId: number) {
        if (!token || !editForm) return;

        const problem = userFormError(editForm, { requirePassword: false });
        if (problem) {
            alert(problem);
            return;
        }
        const { firstName, secondName, email, comments } = editForm;

        try {
            // Enrollments are saved through their own endpoints; a blank comment clears it.
            await updateItem(userId, {
                firstName: firstName!.trim(),
                secondName: secondName!.trim(),
                email: email!.trim(),
                comments: isBlank(comments) ? null : comments
            });
            await refreshUsers();
            setSelectedUser(null);
        } catch (err) {
            showError(err);
        }
    }

    async function handleGetEnrollments(userId: number) {
        if (!token) return;

        try {
            const result = await getUserEnrollments(token, userId);
            setEditForm(prev => ({
                ...prev!,
                enrollments: result.data.map((e: UserEnrollment) => e.course)
            }));
        } catch (err) {
            showError(err);
        }
    }


    const pager = <Pager meta={meta} page={list.page} onPageChange={list.setPage} variant={variant} />;

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <ListHeader
                title="Instructors"
                onAdd={() => {
                    setAddForm({
                        firstName: EMPTY_USER.firstName,
                        secondName: EMPTY_USER.secondName,
                        email: EMPTY_USER.email,
                        role: "instructor",
                        password: EMPTY_USER.password,
                        comments: EMPTY_USER.comments ?? ""
                    });
                    setAdd(true);
                }}
                search={list.search}
                onSearchChange={list.setSearch}
                searchPlaceholder="Search name or email"
                variant={variant}
                pager={variant === "compact" ? pager : undefined}
            />
            <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto">
                <CrudList<User>
                    items={users}
                    getKey={(u) => u.id}
                    renderLabel={(u) =>
                        `${u.secondName}, ${u.firstName}`
                    }
                    onEdit={(user) => {
                        setSelectedUser(user);
                        setEditForm({
                            firstName: user.firstName,
                            secondName: user.secondName,
                            email: user.email,
                            comments: user.comments ?? "",
                            enrollments: []
                        });
                        void handleGetEnrollments(user.id);
                    }}
                    onDelete={handleDeleteUser}
                    dense={variant === "compact"}
                />
            </div>
            {variant === "full" && pager}
            <CrudModal
                open={!!add}
                onClose={() => setAdd(false)}
                onSave={() =>
                    handleAddUser()
                }
            >
                {/* First name */}
                <p className="flex justify-between items-center mb-2">
                    <strong>First name</strong>
                    <input
                        value={addForm.firstName || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({
                                ...prev!,
                                firstName: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Last name */}
                <p className="flex justify-between items-center mb-2">
                    <strong>Last name</strong>
                    <input
                        value={addForm.secondName || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({
                                ...prev!,
                                secondName: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Email */}
                <p className="flex justify-between items-center mb-2">
                    <strong>Email</strong>
                    <input
                        type="email"
                        value={addForm.email || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({
                                ...prev!,
                                email: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Password */}
                <p className="flex justify-between items-center mb-2">
                    <strong>Password</strong>
                    <input
                        type="password"
                        value={addForm.password || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({
                                ...prev!,
                                password: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Comments */}
                <p className="flex justify-between items-center mb-3">
                    <strong>Comments</strong>
                    <textarea
                        value={addForm.comments || ""}
                        onChange={(e) =>
                            setAddForm(prev => ({
                                ...prev!,
                                comments: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>
            </CrudModal>
            <CrudModal
                open={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                onSave={() =>
                    handleUpdateUser(selectedUser!.id)
                }
            >
                {/* First name */}
                <p className="flex justify-between items-center mb-2">
                    <strong>First name</strong>
                    <input
                        value={editForm.firstName || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({
                                ...prev!,
                                firstName: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Last name */}
                <p className="flex justify-between items-center mb-2">
                    <strong>Last name</strong>
                    <input
                        value={editForm.secondName || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({
                                ...prev!,
                                secondName: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Email */}
                <p className="flex justify-between items-center mb-2">
                    <strong>Email</strong>
                    <input
                        type="email"
                        value={editForm.email || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({
                                ...prev!,
                                email: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>

                {/* Comments */}
                <p className="flex justify-between items-center mb-3">
                    <strong>Comments</strong>
                    <textarea
                        value={editForm.comments || ""}
                        onChange={(e) =>
                            setEditForm(prev => ({
                                ...prev!,
                                comments: e.target.value
                            }))
                        }
                        className="border border-gray-200 rounded p-1 w-64"
                    />
                </p>
            </CrudModal>
        </div>
    );
}