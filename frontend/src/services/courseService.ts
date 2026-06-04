
export async function getCourses(token: string | null) {
    const res = await fetch("http://localhost:3000/courses", {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed");
    return res.json();
}

export async function addCourse(
    token: string | null,
    user: { title: string; language: string; level: string; material: string }
) {
    const res = await fetch("http://localhost:3000/courses", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    });

    if (!res.ok) throw new Error("Failed to add course");
    return res.json();
}

export async function deleteCourse(
    token: string | null,
    courseId: number
) {
    const res = await fetch(`http://localhost:3000/courses/${courseId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) throw new Error("Failed to delete course");
    return res.json();
}