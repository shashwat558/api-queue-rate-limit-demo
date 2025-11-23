"use client";
import { useApiQueueStore } from "@/store/apiQueueStore";

export default function ZustandImplementation() {
  const { 
    queue, 
    isProcessing, 
    responses, 
    errors, 
    addJob, 
    clearResponses, 
    clearErrors 
  } = useApiQueueStore();

  const handleAddJob = () => {
    const message = `Request ${Date.now()}`;
    addJob(message);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">API Processing Queue (Zustand)</h1>
          <button 
            className="px-6 py-3 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={handleAddJob}
            disabled={isProcessing && queue.length > 0}
          >
            Send Request
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Processing</h2>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className={`font-semibold ${isProcessing ? 'text-yellow-600' : 'text-gray-500'}`}>
                {isProcessing ? 'Processing...' : 'Idle'}
              </span>
            </div>
            {isProcessing && queue.length > 0 && (
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
                      index === 0 && isProcessing 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">#{job.id}</span>
                      {index === 0 && isProcessing && (
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Responses</h2>
              {responses.length > 0 && (
                <button
                  onClick={clearResponses}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {responses.length === 0 ? (
                <p className="text-gray-500 italic">No responses yet</p>
              ) : (
                responses.map((response) => (
                  <div key={response.id} className="p-3 rounded bg-green-50 border border-green-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-green-700">Response</span>
                      <span className="text-xs text-gray-500">#{response.id}</span>
                    </div>
                    <p className="text-sm text-gray-800 font-mono wrap-break-word">
                      {typeof response.data === 'string' ? response.data : JSON.stringify(response.data)}
                    </p>
                  </div>
                ))
              )}
            </div>
            {errors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-red-700">Errors ({errors.length})</h3>
                  <button
                    onClick={clearErrors}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {errors.map((error) => (
                    <div key={error.id} className="p-2 rounded bg-red-50 border border-red-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-red-700">Error</span>
                        <span className="text-xs text-gray-500">#{error.id}</span>
                      </div>
                      <p className="text-xs text-red-800 wrap-break-word">
                        {error.error}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

