export interface Job {
    id: number,
    message: string
}

type listeners = () => void;
class ApiQueue {
    private queue: Job[] = [];
    private isProcessing: boolean = false;
    private jobId: number = 0;
    private listeners : listeners[] = [];

    subscribe(fn: listeners) {
        this.listeners.push(fn)
    }

    notify() {
        for(const fn of this.listeners) fn()
    }
    
    add(message: string) {
        this.queue.push({id: this.jobId++, message})
        this.notify()
        this.process()
    }

    getQueue() {
        return [...this.queue];
    }

    isBusy() {
        return this.isProcessing;
    }

    async process() {
        if(this.isProcessing) return;
        if(this.queue.length === 0) return;

        this.isProcessing = true;
        this.notify();

        const job = this.queue[0];

        try {
         const res = await fetch("https://assignment-backend.jainshashwat528.workers.dev/api/v1/echo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({message: job?.message})
         });

         const json = await res.json();

         window.dispatchEvent(
            new CustomEvent("api-response", {
                detail: json
            })
         );
        } catch(error) {
            window.dispatchEvent(
                new CustomEvent("api-error", {
                    detail: error
                })
            );
        }

        this.queue.shift();
        this.isProcessing = false;
        this.notify();

        this.process();


    }

}

export const apiQueue = new ApiQueue();