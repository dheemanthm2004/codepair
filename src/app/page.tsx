"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { validateRoomCode } from '@/lib/utils';
import { 
  Code2, 
  Users, 
  Timer, 
  MessageSquare, 
  Zap, 
  Star,
  ArrowRight,
  Play,
  UserPlus,
  Crown,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: "Real-Time Code Editor",
    description: "VS Code experience with live collaboration and syntax highlighting",
    gradient: "from-neon-blue to-neon-purple"
  },
  {
    icon: Users,
    title: "Interview Simulation",
    description: "Practice with interviewer/candidate roles and realistic scenarios",
    gradient: "from-neon-pink to-neon-blue"
  },
  {
    icon: Timer,
    title: "Session Management",
    description: "Built-in timer, question bank, and performance tracking",
    gradient: "from-neon-green to-neon-blue"
  },
  {
    icon: MessageSquare,
    title: "Live Communication",
    description: "Real-time chat and feedback during interview sessions",
    gradient: "from-neon-purple to-neon-pink"
  }
];

const stats = [
  { label: "Interview Sessions", value: "10K+", icon: Play },
  { label: "Active Users", value: "2.5K+", icon: UserPlus },
  { label: "Questions Bank", value: "500+", icon: Code2 },
  { label: "Success Rate", value: "94%", icon: Star },
];

export default function HomePage() {
  const [roomCode, setRoomCode] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    if (!session) {
      signIn();
      return;
    }

    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (response.ok) {
        router.push(`/room/${data.roomCode}`);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create room",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinRoom = async () => {
    if (!session) {
      signIn();
      return;
    }

    if (!validateRoomCode(roomCode)) {
      toast({
        title: "Invalid Room Code",
        description: "Please enter a valid 6-character room code",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (response.ok) {
        router.push(`/room/${roomCode}`);
        setIsJoinModalOpen(false);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join room",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white glow-text">
                CodePair<span className="text-neon-pink">+</span>
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              {session ? (
                <div className="flex items-center gap-3">
                  <span className="text-white/70">Welcome, {session.user?.name}</span>
                  <Button
                    variant="ghost"
                    onClick={() => signIn()}
                    className="text-white/70 hover:text-white"
                  >
                    Switch Account
                  </Button>
                </div>
              ) : (
                <Button
                  variant="glass"
                  onClick={() => signIn()}
                  className="text-white"
                >
                  Sign In
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Badge className="bg-gradient-to-r from-neon-pink to-neon-blue text-white px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Real-Time Collaboration Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 glow-text"
          >
            Master Coding
            <br />
            <span className="bg-gradient-to-r from-neon-pink via-neon-blue to-neon-purple bg-clip-text text-transparent">
              Interviews
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Practice technical interviews with real-time collaboration. Share code, 
            solve problems together, and simulate actual interview scenarios.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              variant="neon"
              size="lg"
              onClick={handleCreateRoom}
              className="text-lg px-8 py-4 h-auto group"
            >
              <Crown className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Host Interview
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="glass"
                  size="lg"
                  className="text-lg px-8 py-4 h-auto group text-white"
                >
                  <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Join Interview
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center">Join Interview Room</DialogTitle>
                  <DialogDescription className="text-center">
                    Enter the 6-character room code shared by your interviewer
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter room code (e.g. ABC123)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                  <Button
                    onClick={handleJoinRoom}
                    variant="neon"
                    className="w-full"
                    disabled={!roomCode.trim()}
                  >
                    Join Room
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <div className="glass rounded-lg p-6 hover:bg-white/10 transition-colors">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-neon-blue" />
                <div className="text-3xl font-bold text-white glow-text mb-1">
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4 glow-text">
            Everything You Need
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Professional-grade tools designed for realistic interview practice
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <Card className="h-full hover:scale-105 transition-transform duration-300 group cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white group-hover:text-neon-blue transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/70">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-neon-pink/10 to-neon-blue/10 border-white/20">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-white mb-6 glow-text">
                Ready to Ace Your Next Interview?
              </h2>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Join thousands of developers who've improved their interview skills with CodePair+
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="neon"
                  size="lg"
                  onClick={handleCreateRoom}
                  className="text-lg px-8 py-4 h-auto"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Practicing Now
                </Button>
                <Button
                  variant="glass"
                  size="lg"
                  className="text-lg px-8 py-4 h-auto text-white"
                  onClick={() => setIsJoinModalOpen(true)}
                >
                  Join a Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 glass">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">
                CodePair<span className="text-neon-pink">+</span>
              </span>
            </div>
            <div className="text-white/60 text-sm">
              © 2024 CodePair+. Built with 💜 for developers.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
