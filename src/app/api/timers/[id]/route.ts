import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Timer from '@/lib/timer';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const timer = await Timer.findById(params.id);
    if (!timer) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
    }
    return NextResponse.json({ timer });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch timer' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const timer = await Timer.findByIdAndUpdate(params.id, body, { new: true });
    if (!timer) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
    }
    return NextResponse.json({ timer });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update timer' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const timer = await Timer.findByIdAndDelete(params.id);
    if (!timer) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Timer deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete timer' }, { status: 500 });
  }
}