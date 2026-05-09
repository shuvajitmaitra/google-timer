export interface Timer {
  _id: string;
  name: string;
  duration: number;
  remainingTime: number;
  status: 'running' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimerInput {
  name: string;
  duration: number;
}

export interface UpdateTimerInput {
  name?: string;
  duration?: number;
  remainingTime?: number;
  status?: 'running' | 'paused' | 'completed';
}