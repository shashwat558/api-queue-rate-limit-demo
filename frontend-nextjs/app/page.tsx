"use client";
import { apiQueue, Job } from "@/lib/apiQueue";
import { useApiQueueStore } from "@/store/apiQueueStore";
import { useEffect, useState } from "react";

interface ApiResponse {
  id?: number;
  status?: string;
  echo?: string;
  message?: string;
}

export default function Home() {
  const [queue, setQueue] = useState<Job[]>(apiQueue.getQueue());
  const [busy, setBusy] = useState(apiQueue.isBusy());
  const [responses, setResponses] = useState<ApiResponse[]>([]);
  const [errors, setErrors] = useState<unknown[]>([]);
  // const {queue: zustandQueue, isProcessing, responses: zustandResponses, addJob: zustandAddJob, processQueue: zustandProcessQueue} = useApiQueueStore();


  useEffect(() => {
    apiQueue.subscribe(() => {
      setQueue(apiQueue.getQueue());
      setBusy(apiQueue.isBusy());
    });

    const handleResponse = (e: Event) => {
      const customEvent = e as CustomEvent<ApiResponse>;
      setResponses((prev) => ([...prev, customEvent.detail]));  
    };

    const handleError = (e: Event) => {
      const customEvent = e as CustomEvent<unknown>;
      setErrors((prev) => ([...prev, customEvent.detail]));
    };

    window.addEventListener("api-response", handleResponse);
    window.addEventListener("api-error", handleError);

    return () => {
      window.removeEventListener("api-response", handleResponse);
      window.removeEventListener("api-error", handleError);
    };

  }, []);

  const addJob = () => {
    const message = "Hey Dodo";
    apiQueue.add(message);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1>Implementation without Zustand</h1>
        <div className="mb-6 flex justify-center">
          <button 
            className="px-6 py-3 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer shadow-md" 
            onClick={addJob}
          >
            Send Request
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Processing</h2>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${busy ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className={`font-semibold ${busy ? 'text-yellow-600' : 'text-gray-500'}`}>
                {busy ? 'Processing...' : 'Idle'}
              </span>
            </div>
            {busy && queue.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm text-gray-700">
                  Processing: <span className="font-mono font-semibold">{queue[0]?.message}</span>
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Queue</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {queue.length === 0 ? (
                <p className="text-gray-500 italic">Queue is empty</p>
              ) : (
                queue.map((job, index) => (
                  <div 
                    key={job.id} 
                    className={`p-3 rounded border ${
                      index === 0 && busy 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">#{job.id}</span>
                      {index === 0 && busy && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Processing</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 mt-1 font-mono">{job.message}</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Total in queue: <span className="font-bold">{queue.length}</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Responses</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {responses.length === 0 ? (
                <p className="text-gray-500 italic">No responses yet</p>
              ) : (
                responses.map((response, index) => (
                  <div key={`${response.id}-${index}`} className="p-3 rounded bg-green-50 border border-green-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-green-700">Response</span>
                      {response.id !== undefined && (
                        <span className="text-xs text-gray-500">#{response.id}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 font-mono wrap-break-word">
                      {response.echo || response.message || JSON.stringify(response)}
                    </p>
                    {response.status && (
                      <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                        response.status === 'ok' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {response.status}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
            {errors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-red-200">
                <h3 className="text-sm font-bold text-red-700 mb-2">Errors ({errors.length})</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {errors.map((error, index) => (
                    <div key={index} className="p-2 rounded bg-red-50 border border-red-200">
                      <p className="text-xs text-red-800 wrap-break-word">
                        {error instanceof Error ? error.message : String(error)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* <h1>Implementation with Zustand</h1> */}
      {/* <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-center">
          <button 
            className="px-6 py-3 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer shadow-md" 
            onClick={addJob}
          >
            Send Request
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Processing</h2>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${busy ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className={`font-semibold ${busy ? 'text-yellow-600' : 'text-gray-500'}`}>
                {busy ? 'Processing...' : 'Idle'}
              </span>
            </div>
            {busy && queue.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm text-gray-700">
                  Processing: <span className="font-mono font-semibold">{queue[0]?.message}</span>
                </p>
              </div>
            )}
      </div>
      </div>
      </div> */}
      </div>
  );
}
