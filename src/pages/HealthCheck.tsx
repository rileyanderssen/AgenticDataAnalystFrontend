import { apiTestHealth } from "../routes/HealthCheck"

export default function HealthCheckPage() {
    const testHealth = async () => {
        await apiTestHealth();
    }

    return (
        <button
            onClick={testHealth}
        >
            Click to test health
        </button>
    )
}