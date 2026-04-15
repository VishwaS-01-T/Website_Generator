import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

let webcontainerInstance = null;

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function boot() {
            try {
                if (!webcontainerInstance) {
                    webcontainerInstance = await WebContainer.boot();
                }
                setWebcontainer(webcontainerInstance);
            } catch (err) {
                console.error('WebContainer boot error:', err);
                setError(err.message);
            }
        }
        
        boot();
    }, []);

    return { webcontainer, error };
}