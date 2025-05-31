"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRoomStore } from '@/store/room-store';
import { socketManager } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

export function Chat() {
  const { chatMessages, addChatMessage, participants } = useRoomStore();
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUser = participants[0]; // TODO: Get actual current user

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !currentUser) return;

    const newMessage = {
      id: uuidv4(),
      userId: currentUser.userId,
      userName: currentUser.user.name || 'Anonymous',
      message: message.trim(),
      timestamp: new Date(),
      type: 'message' as const,
    };

    addChatMessage(newMessage);
    socketManager.emit('chat-message', newMessage);
    setMessage('');
  };

  const formatMessageTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative">
      {/* Chat Toggle Button */}
      <Button
        variant="glass"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <MessageSquare className="w-4 h-4" />
        {chatMessages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-pink rounded-full text-xs flex items-center justify-center">
            {chatMessages.length > 9 ? '9+' : chatMessages.length}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-full right-0 mb-2 w-80 h-96 glass rounded-lg border border-white/20 flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-white/50 text-sm py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <AnimatePresence>
                  {chatMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.userId === currentUser?.userId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-2 ${
                          msg.userId === currentUser?.userId
                            ? 'bg-neon-blue/20 text-white'
                            : 'bg-white/10 text-white/90'
                        }`}
                      >
                        {msg.userId !== currentUser?.userId && (
                          <div className="text-xs text-white/60 mb-1">
                            {msg.userName}
                          </div>
                        )}
                        <div className="text-sm">{msg.message}</div>
                        <div className="text-xs text-white/50 mt-1">
                          {formatMessageTime(msg.timestamp)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  maxLength={500}
                />
                <Button
                  type="submit"
                  variant="neon"
                  size="sm"
                  disabled={!message.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
