
export async function getUsers(token: string | null) {
    const res = await fetch("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed");
    return res.json();
}

export async function addUser(
    token: string | null,
    user: { firstName: string; secondName: string; email: string; password: string }
) {
    const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    });

    if (!res.ok) throw new Error("Failed to add user");
    return res.json();
}

export async function deleteUser(
    token: string | null,
    userId: number
) {
    const res = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) throw new Error("Failed to delete user");
    return res.json();
}