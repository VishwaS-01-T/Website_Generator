import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

// Singleton instance
let webcontainerInstance = null;

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState();

    async function main() {
        if (!webcontainerInstance) {
            webcontainerInstance = await WebContainer.boot();
        }
        setWebcontainer(webcontainerInstance);
    }
    useEffect(() => {
        main();
      }, []);

    return webcontainer;
}