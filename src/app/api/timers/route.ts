import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Timer from '@/lib/timer';

export async function GET() {
  try {
    await connectDB();
    const timers = await Timer.find();
    return NextResponse.json({ timers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch timers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, duration } = body;

    const timer = await Timer.create({
      name,
      duration,
    });

    return NextResponse.json({ timer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create timer' }, { status: 500 });
  }
}