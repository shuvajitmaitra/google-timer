import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Timer from '@/lib/models/Timer';

export async function GET() {
  try {
    await dbConnect();
    const timers = await Timer.find({}).sort({ createdAt: -1 });
    return NextResponse.json(timers);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch timers';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { name, hours = 0, minutes = 0, seconds = 0 } = body;
    const duration = hours * 3600 + minutes * 60 + seconds;
    
    if (duration <= 0) {
      return NextResponse.json({ error: 'Duration must be greater than 0' }, { status: 400 });
    }

    const newTimer = new Timer({
      name: name || 'New Timer',
      duration,
      remainingTime: duration,
      isRunning: true,
      expectedEndTime: Date.now() + duration * 1000,
    });

    const savedTimer = await newTimer.save();
    return NextResponse.json(savedTimer, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create timer';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
