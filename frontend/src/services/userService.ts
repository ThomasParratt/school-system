
export async function getUsers(token: string) {
    const res = await fetch("/users", {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed");
    return res.json();
}