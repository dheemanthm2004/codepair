import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const roomCode = params.roomId;

    const room = await db.room.findUnique({
      where: { roomCode },
      include: {
        host: true,
        participants: {
          include: {
            user: true,
          },
        },
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

    return NextResponse.json({
      room,
      participants: room.participants,
    });
  } catch (error) {
    console.error('Room fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}