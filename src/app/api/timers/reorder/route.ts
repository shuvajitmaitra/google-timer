import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Timer from '@/lib/timer';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { activeId, overId } = body;

    const timers = await Timer.find().sort({ position: 1 });
    const oldIndex = timers.findIndex((t) => t._id.toString() === activeId);
    const newIndex = timers.findIndex((t) => t._id.toString() === overId);

    if (oldIndex === -1 || newIndex === -1) {
      return NextResponse.json({ error: 'Invalid timer positions' }, { status: 400 });
    }

    const [removed] = timers.splice(oldIndex, 1);
    timers.splice(newIndex, 0, removed);

    const bulkOps = timers.map((timer, index) => ({
      updateOne: {
        filter: { _id: timer._id },
        update: { position: index },
      },
    }));

    await Timer.bulkWrite(bulkOps);

    const reorderedTimers = await Timer.find().sort({ position: 1 });

    return NextResponse.json({ timers: reorderedTimers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder timers' }, { status: 500 });
  }
}