export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface Room {
  id: string;
  roomCode: string;
  title?: string;
  isActive: boolean;
  maxUsers: number;
  createdAt: Date;
  expiresAt: Date;
  hostId: string;
  host: User;
  participants: RoomParticipant[];
}

export interface RoomParticipant {
  id: string;
  roomId: string;
  userId: string;
  role: 'interviewer' | 'interviewee';
  joinedAt: Date;
  user: User;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints?: string;
  starterCode: Record<string, string>;
  solution?: Record<string, string>;
}

export interface CodeState {
  code: string;
  language: string;
  cursorPosition?: { line: number; column: number };
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system';
}

export interface TimerState {
  duration: number; // in seconds
  remaining: number;
  isRunning: boolean;
  startedAt?: Date;
}

export interface RoomState {
  room: Room | null;
  participants: RoomParticipant[];
  currentQuestion: Question | null;
  codeState: CodeState;
  chatMessages: ChatMessage[];
  timerState: TimerState;
  isConnected: boolean;
}

// Socket Events
export interface SocketEvents {
  // Room events
  'join-room': { roomCode: string; userId: string };
  'leave-room': { roomCode: string; userId: string };
  'room-updated': Room;
  'user-joined': RoomParticipant;
  'user-left': { userId: string };
  
  // Code events
  'code-change': CodeState;
  'cursor-change': { userId: string; position: { line: number; column: number } };
  
  // Question events
  'question-selected': Question;
  'question-changed': Question;
  
  // Chat events
  'chat-message': ChatMessage;
  
  // Timer events
  'timer-start': { duration: number };
  'timer-pause': void;
  'timer-resume': void;
  'timer-reset': void;
  'timer-update': TimerState;
  
  // Session events
  'session-end': { feedback?: string };
}
