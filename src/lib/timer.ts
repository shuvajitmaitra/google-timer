import mongoose, { Schema, Document } from 'mongoose';

export interface ITimer extends Document {
  name: string;
  duration: number;
}

const TimerSchema = new Schema<ITimer>(
  {
    name: { type: String, required: true },
    duration: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Timer || mongoose.model<ITimer>('Timer', TimerSchema);