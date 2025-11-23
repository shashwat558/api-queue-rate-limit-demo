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

type ApiQueueStore = {
    queue: Job[],
    isProcessing: boolean,
    responses: ApiResponse[],
    addJob: (message: string) => void,
    processQueue: () => Promise<void>;
}


export const useApiQueueStore = create<ApiQueueStore>((set, get) => ({
    queue: [],
    isProcessing: false,
    responses: [],

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
        
        try {
            const res = await fetch("https://assignment-backend.jainshashwat528.workers.dev/api/v1/echo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({message: job.message})
            });
            
            const data = await res.json();

            set((state) => ({
                responses: [...state.responses, {id: job.id, data: data.echo}]
            }));
        } catch (error) {
            set((state) => ({
                responses: [...state.responses, {id: job.id, data: error}]
            }));
        }

        set((state) => ({
            queue: state.queue.slice(1),
            currentJob: null,
            isProcessing: false,
        }));

        get().processQueue();


    }
}))