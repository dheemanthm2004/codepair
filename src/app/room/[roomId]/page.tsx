"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useRoomStore } from '@/store/room-store';
import { socketManager } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';
import { CodeEditor } from '@/components/editor/code-editor';
import { QuestionPanel } from '@/components/room/question-panel';
import { Timer } from '@/components/room/timer';
import { Chat } from '@/components/room/chat';
import { Participants } from '@/components/room/participants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, 
  Users, 
  MessageSquare, 
  Timer as TimerIcon,
  Settings,
  ExternalLink,
  Copy,
  LogOut,
  Crown,
  User
} from 'lucide-react';
import { RoomParticipant } from '@prisma/client';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<'question' | 'chat'>('question');

  const {
    room,
    participants,
    isConnected,
    setRoom,
    setParticipants,
    setConnected,
    reset
  } = useRoomStore();

  const roomCode = params.roomId as string;
  const currentUser = participants.find(p => p.user.email === session?.user?.email);
  const isInterviewer = currentUser?.role === 'interviewer';

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    initializeRoom();

    return () => {
      leaveRoom();
    };
  }, [session, roomCode]);

  const initializeRoom = async () => {
    try {
      // Fetch room details
      const response = await fetch(`/api/rooms/${roomCode}`);
      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Room Not Found",
          description: data.error || "The room you're looking for doesn't exist.",
          variant: "destructive",
        });
        router.push('/');
        return;
      }

      setRoom(data.room);
      setParticipants(data.participants || []);

      // Connect to socket
      const socket = socketManager.connect();
      
      socket.on('connect', () => {
        setConnected(true);
        
        // Join room
        socket.emit('join-room', {
          roomCode,
          userId: session?.user?.email || '',
        });
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      // Room event listeners
      socket.on('room-updated', (updatedRoom) => {
        setRoom(updatedRoom);
      });

      socket.on('user-joined', (participant) => {
        setParticipants(
          participants
            .filter(p => p.userId !== participant.userId)
            .concat(participant)
        );
        toast({
          title: "User Joined",
          description: `${participant.user.name} joined the session`,
        });
      });

      socket.on('user-left', ({ userId }) => {
        setParticipants(participants.filter((p: RoomParticipant) => p.userId !== userId));
      });

      setIsLoading(false);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load room. Please try again.",
        variant: "destructive",
      });
      router.push('/');
    }
  };

  const leaveRoom = () => {
    const socket = socketManager.getSocket();
    if (socket && session?.user?.email) {
      socket.emit('leave-room', {
        roomCode,
        userId: session.user.email,
      });
    }
    socketManager.disconnect();
    reset();
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push('/');
  };

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      toast({
        title: "Copied!",
        description: "Room code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy room code",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading interview room...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Logo & Room Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  CodePair<span className="text-neon-pink">+</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={handleCopyRoomCode}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {roomCode}
                </Badge>

                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-white/60">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              {currentUser && (
                <Badge
                  variant={isInterviewer ? 'default' : 'outline'}
                  className={isInterviewer ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : ''}
                >
                  {isInterviewer ? <Crown className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                  {isInterviewer ? 'Interviewer' : 'Candidate'}
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeaveRoom}
                className="text-white/70 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Leave
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Left Sidebar - Question/Chat Panel */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="glass rounded-lg h-full flex flex-col">
              {/* Panel Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActivePanel('question')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activePanel === 'question'
                      ? 'text-neon-blue border-b-2 border-neon-blue'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Code2 className="w-4 h-4 mr-2 inline" />
                  Problem
                </button>
                <button
                  onClick={() => setActivePanel('chat')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activePanel === 'chat'
                      ? 'text-neon-blue border-b-2 border-neon-blue'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-2 inline" />
                  Chat
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                {activePanel === 'question' ? <QuestionPanel /> : <Chat />}
              </div>
            </div>
          </div>

          {/* Center - Code Editor */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-6">
            <div className="glass rounded-lg h-full">
              <CodeEditor />
            </div>
          </div>

          {/* Right Sidebar - Timer & Participants */}
          <div className="col-span-12 lg:col-span-3 xl:col-span-3">
            <div className="space-y-4 h-full">
              {/* Timer */}
              <Timer />

              {/* Participants */}
              <Participants />

              {/* Quick Actions */}
              {isInterviewer && (
                <div className="glass rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="glass"
                      size="sm"
                      className="w-full justify-start text-white/70"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      End Session
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      className="w-full justify-start text-white/70"
                      onClick={handleCopyRoomCode}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Share Room
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
