import { useState } from "react";

export function useProcessIntent() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    async function processIntent(intent: string, prompt: string, imageBase64?: string) {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/process-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ intent, prompt, imageBase64 }),
            });

            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return { loading, result, error, processIntent };
}
