import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateRoomCode } from '@/lib/utils';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate unique room code
    let roomCode: string;
    let attempts = 0;
    
    do {
      roomCode = generateRoomCode();
      const existingRoom = await db.room.findUnique({
        where: { roomCode },
      });
      
      if (!existingRoom) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'Failed to generate unique room code' },
        { status: 500 }
      );
    }

    // Create room
    const room = await db.room.create({
      data: {
        roomCode,
        hostId: session.user.id,
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      },
      include: {
        host: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    // Add host as participant
    await db.roomParticipant.create({
      data: {
        roomId: room.id,
        userId: session.user.id,
        role: 'interviewer',
      },
    });

    return NextResponse.json({
      roomCode: room.roomCode,
      room,
    });
  } catch (error) {
    console.error('Room creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
