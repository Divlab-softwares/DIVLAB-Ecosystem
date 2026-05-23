async function getCourseInfos(id: string) {
    try {
        const res = await fetch("/api/formation?courseId=" + id || "ignore");

        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        // console.log("data.data.currency", data.data.currency);

        console.log("Response from /api/formation:", data);
        return data.data;
    } catch (error) {
        console.error("Error updating course info:", error);
    }
}