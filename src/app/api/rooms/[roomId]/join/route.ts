import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Type assertion to include 'id' on user
    const userId = session?.user ? (session.user as typeof session.user & { id?: string })?.id : undefined;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const roomCode = params.roomId;

    const room = await db.room.findUnique({
      where: { roomCode },
      include: {
        participants: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    if (!room.isActive) {
      return NextResponse.json(
        { error: 'Room is no longer active' },
        { status: 410 }
      );
    }

    if (new Date() > room.expiresAt) {
      return NextResponse.json(
        { error: 'Room has expired' },
        { status: 410 }
      );
    }

    if (room.participants.length >= room.maxUsers) {
      return NextResponse.json(
        { error: 'Room is full' },
        { status: 409 }
      );
    }

    const existingParticipant = room.participants.find(
      p => p.userId === userId
    );

    if (existingParticipant) {
      return NextResponse.json(
        { message: 'Already in room' },
        { status: 200 }
      );
    }

    await db.roomParticipant.create({
      data: {
        roomId: room.id,
        userId: userId,
        role: 'interviewee',
      },
    });

    return NextResponse.json({
      message: 'Successfully joined room',
      roomCode,
    });
  } catch (error) {
    console.error('Room join error:', error);
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    );
  }
}