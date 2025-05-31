"use client";

import React from 'react';
import { useRoomStore } from '@/store/room-store';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function Participants() {
  const { participants, room } = useRoomStore();

  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-white/70" />
        <span className="text-white/70 font-medium">Participants</span>
        <Badge variant="outline" className="ml-auto">
          {participants.length}/{room?.maxUsers || 2}
        </Badge>
      </div>

      <div className="space-y-3">
        {participants.map((participant, index) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              {participant.role === 'interviewer' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium truncate">
                  {participant.user.name || 'Anonymous'}
                </span>
                <Badge 
                  variant={participant.role === 'interviewer' ? 'default' : 'outline'}
                  className={
                    participant.role === 'interviewer' 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                      : ''
                  }
                >
                  {participant.role === 'interviewer' ? 'Interviewer' : 'Candidate'}
                </Badge>
              </div>
              <div className="text-xs text-white/60">
                Joined {new Date(participant.joinedAt).toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}

        {participants.length < (room?.maxUsers || 2) && (
          <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-white/20">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-white/50" />
            </div>
            <div className="text-white/50">
              <div className="font-medium">Waiting for participant...</div>
              <div className="text-xs">Share the room code to invite</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
