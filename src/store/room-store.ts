import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { RoomState, Room, RoomParticipant, Question, CodeState, ChatMessage, TimerState } from '@/types';

interface RoomActions {
  setRoom: (room: Room | null) => void;
  setParticipants: (participants: RoomParticipant[]) => void;
  addParticipant: (participant: RoomParticipant) => void;
  removeParticipant: (userId: string) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setCodeState: (codeState: Partial<CodeState>) => void;
  addChatMessage: (message: ChatMessage) => void;
  setTimerState: (timerState: Partial<TimerState>) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

const initialState: RoomState = {
  room: null,
  participants: [],
  currentQuestion: null,
  codeState: {
    code: '',
    language: 'javascript',
  },
  chatMessages: [],
  timerState: {
    duration: 1800, // 30 minutes
    remaining: 1800,
    isRunning: false,
  },
  isConnected: false,
};

export const useRoomStore = create<RoomState & RoomActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setRoom: (room) => set({ room }),

    setParticipants: (participants) => set({ participants }),

    addParticipant: (participant) =>
      set((state) => ({
        participants: [...state.participants.filter(p => p.userId !== participant.userId), participant],
      })),

    removeParticipant: (userId) =>
      set((state) => ({
        participants: state.participants.filter(p => p.userId !== userId),
      })),

    setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),

    setCodeState: (newCodeState) =>
      set((state) => ({
        codeState: { ...state.codeState, ...newCodeState },
      })),

    addChatMessage: (message) =>
      set((state) => ({
        chatMessages: [...state.chatMessages, message],
      })),

    setTimerState: (newTimerState) =>
      set((state) => ({
        timerState: { ...state.timerState, ...newTimerState },
      })),

    setConnected: (isConnected) => set({ isConnected }),

    reset: () => set(initialState),
  }))
);
