import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Timer from '@/lib/models/Timer';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    await dbConnect();
    const timer = await Timer.findById(id);
    if (!timer) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
    }
    return NextResponse.json(timer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch timer' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    await dbConnect();
    const body = await request.json();
    const timer = await Timer.findById(id);
    
    if (!timer) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
    }

    // Handle updates based on actions
    if (body.action === 'play') {
      if (!timer.isRunning && timer.remainingTime > 0) {
        timer.isRunning = true;
        timer.expectedEndTime = Date.now() + timer.remainingTime * 1000;
      }
    } else if (body.action === 'pause') {
      if (timer.isRunning) {
        timer.isRunning = false;
        // Calculate exact remaining time
        if (timer.expectedEndTime) {
          timer.remainingTime = Math.max(0, Math.ceil((timer.expectedEndTime - Date.now()) / 1000));
        }
        timer.expectedEndTime = null;
      }
    } else if (body.action === 'addTime') {
      // Add a given amount of time (e.g., 60 seconds)
      const addedTime = body.seconds || 60;
      if (timer.isRunning && timer.expectedEndTime) {
        timer.expectedEndTime += addedTime * 1000;
        // Optionally update original duration if it overflows? Nah, usually duration implies just the starting point
        // Or we update the max duration so the ring doesn't complete weirdly.
        if (timer.remainingTime + addedTime > timer.duration) {
             timer.duration = timer.remainingTime + addedTime;
        }
      } else {
        timer.remainingTime += addedTime;
        if (timer.remainingTime > timer.duration) {
             timer.duration = timer.remainingTime;
        }
      }
    } else if (body.action === 'stop' || body.action === 'reset') {
       // Just delete or reset? The user specified "Stop/Reset on completion", usually reset goes back to max duration, or stop just finishes it.
       // Let's implement reset
       timer.isRunning = false;
       timer.remainingTime = timer.duration;
       timer.expectedEndTime = null;
    } else if (body.action === 'complete') {
        timer.isRunning = false;
        timer.remainingTime = 0;
        timer.expectedEndTime = null;
    }

    await timer.save();
    return NextResponse.json(timer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update timer' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    await dbConnect();
    const deletedTimer = await Timer.findByIdAndDelete(id);
    if (!deletedTimer) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete timer' }, { status: 500 });
  }
}
