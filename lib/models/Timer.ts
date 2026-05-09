import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITimer extends Document {
  name: string;
  duration: number; // The original duration in seconds
  remainingTime: number; // The remaining time in seconds (when paused)
  isRunning: boolean;
  expectedEndTime: number | null; // Epoch timestamp (ms) indicating when it should hit 0
}

const TimerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    remainingTime: { type: Number, required: true },
    isRunning: { type: Boolean, default: false },
    expectedEndTime: { type: Number, default: null },
  },
  {
    timestamps: true,
  }
);

// Delete the model if it exists to avoid OverwriteModelError in hot reloads
const Timer: Model<ITimer> = mongoose.models.Timer || mongoose.model<ITimer>('Timer', TimerSchema);

export default Timer;
