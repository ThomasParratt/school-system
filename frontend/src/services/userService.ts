
export async function getUsers(token: string | null) {
    const res = await fetch("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed");
    return res.json();
}