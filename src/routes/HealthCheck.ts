const apiUrl = import.meta.env.VITE_API_URL;

export const apiTestHealth = async () => {
    try {
        const res = await fetch(`${apiUrl}/api/health_check`, {
            method: "POST"
        })

        const data = await res.json();
        alert(data.message);
    } catch (error: any) {
        alert("Health check failed -> server down");
    }
}