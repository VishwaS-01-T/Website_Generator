
import React, { useEffect, useState } from 'react';

export function PreviewFrame({ webContainer }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWebContainer, setHasWebContainer] = useState(false);

  useEffect(() => {
    console.log('PreviewFrame webContainer:', webContainer);
    if (!webContainer) {
      setIsLoading(false);
      return;
    }
    
    setHasWebContainer(true);
    setIsLoading(true);
    const container = webContainer;
    
    let isMounted = true;

    async function main() {
      setIsLoading(true);
      setError(null);
      
      try {
        const installProcess = await container.spawn('npm', ['install']);

        await new Promise((resolve, reject) => {
          installProcess.output.pipeTo(new WritableStream({
            write(data) {
              console.log(data);
            }
          }));
          
          installProcess.exit.then(code => {
            if (code === 0) resolve();
            else reject(new Error(`npm install failed with code ${code}`));
          });
        });

        if (!isMounted) return;

        const serverProcess = await container.spawn('npm', ['run', 'dev']);

        if (!isMounted) {
          serverProcess.kill();
          return;
        }

        container.on('server-ready', (port, serverUrl) => {
          if (isMounted) {
            console.log('Server ready:', serverUrl, port);
            setUrl(serverUrl);
            setIsLoading(false);
          }
        });

      } catch (err) {
        console.error('Preview error:', err);
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    }

    main();

    return () => {
      isMounted = false;
    };
  }, [webContainer]);

  if (!hasWebContainer) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="mb-2">WebContainer not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {isLoading && !url && !error && (
        <div className="text-center">
          <p className="mb-2">Loading...</p>
        </div>
      )}
      {error && (
        <div className="text-center text-red-400">
          <p className="mb-2">Error: {error}</p>
        </div>
      )}
      {!isLoading && !error && !url && (
        <div className="text-center">
          <p className="mb-2">Waiting for server...</p>
        </div>
      )}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}