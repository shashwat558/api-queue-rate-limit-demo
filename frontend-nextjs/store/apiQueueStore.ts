/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand"

type Job = {
    id: number,
    message: string
}

type ApiResponse = {
    id: number,
    data: any
}

type ApiError = {
    id: number,
    error: string
}

type ApiQueueStore = {
    queue: Job[],
    isProcessing: boolean,
    responses: ApiResponse[],
    errors: ApiError[],
    addJob: (message: string) => void,
    processQueue: () => Promise<void>;
    clearResponses: () => void;
    clearErrors: () => void;
}


export const useApiQueueStore = create<ApiQueueStore>((set, get) => ({
    queue: [],
    isProcessing: false,
    responses: [],
    errors: [],

    addJob: (message: string) => {
        const job: Job = {
            id: Date.now(),
            message
        };

        set((state) => ({
            queue: [...state.queue, job]
        }));

        get().processQueue();
    },

    processQueue: async () => {
        const {queue, isProcessing} = get();

        if(isProcessing || queue.length === 0) return;

        const job = queue[0];

        set({ isProcessing: true });
        
        try {
            const res = await fetch("https://assignment-backend.jainshashwat528.workers.dev/api/v1/echo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({message: job.message})
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();

            set((state) => ({
                responses: [...state.responses, {id: job.id, data: data.echo || data.message}]
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            set((state) => ({
                errors: [...state.errors, {id: job.id, error: errorMessage}]
            }));
        }

        set((state) => ({
            queue: state.queue.slice(1),
            isProcessing: false,
        }));
        get().processQueue();
    },

    clearResponses: () => {
        set({ responses: [] });
    },

    clearErrors: () => {
        set({ errors: [] });
    }
}))