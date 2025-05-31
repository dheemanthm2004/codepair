import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface MockQuestion {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    [key: string]: any;
}

const MOCK_QUESTIONS: MockQuestion[] = [
    // ... same questions array from above
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if session exists before accessing user
    if (!session || !session.user || !(session.user as { id?: string }).id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Type assertion to include 'id' on user
    const user = session.user as typeof session.user & { id?: string };

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');

    let questions = MOCK_QUESTIONS;

    // Filter by difficulty if specified
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }

    // Get random question
    const randomIndex = Math.floor(Math.random() * questions.length);
    const randomQuestion = questions[randomIndex];

    return NextResponse.json({
      question: {
        ...randomQuestion,
      },
    });
  } catch (error) {
    console.error('Random question fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random question' },
      { status: 500 }
    );
  }
}