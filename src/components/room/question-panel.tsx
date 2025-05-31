"use client";

import React, { useState } from 'react';
import { useRoomStore } from '@/store/room-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";

import { getDifficultyColor } from '@/lib/utils';
import { ChevronDown, ChevronUp, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock questions data
const MOCK_QUESTIONS = [
  {
    id: '1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'easy' as const,
    category: 'Array',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
    ],
    constraints: '2 ≤ nums.length ≤ 10^4',
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Your code here
}`,
      python: `def two_sum(nums, target):
    # Your code here
    pass`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your code here
    return [];
}`,
    },
  },
  {
    id: '2',
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    difficulty: 'easy' as const,
    category: 'Stack',
    examples: [
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
    ],
    starterCode: {
      javascript: `function isValid(s) {
    // Your code here
}`,
      python: `def is_valid(s):
    # Your code here
    pass`,
      typescript: '',
    },
  },
];

export function QuestionPanel() {
  const { currentQuestion, setCurrentQuestion, participants } = useRoomStore();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(true);

  const currentUser = participants[0]; // TODO: Get actual current user
  const isInterviewer = currentUser?.role === 'interviewer';

  const handleSelectQuestion = (question: typeof MOCK_QUESTIONS[0]) => {
    setCurrentQuestion(question);
    setSelectedQuestionId(question.id);
    // TODO: Emit to socket
  };

  const handleRandomQuestion = () => {
    const randomQuestion = MOCK_QUESTIONS[Math.floor(Math.random() * MOCK_QUESTIONS.length)];
    handleSelectQuestion(randomQuestion);
  };

  if (!currentQuestion) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white glow-text">Questions</h3>
        </div>

        <div className="flex-1 p-4">
          {isInterviewer ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-white/70">Select a question to start</p>
                <Button
                  variant="neon"
                  size="sm"
                  onClick={handleRandomQuestion}
                  className="ml-auto"
                >
                  <Shuffle className="w-4 h-4 mr-1" />
                  Random
                </Button>
              </div>

              <div className="space-y-3">
                {MOCK_QUESTIONS.map((question) => (
                  <Card
                    key={question.id}
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => handleSelectQuestion(question)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{question.title}</h4>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/60 line-clamp-2">
                        {question.description}
                      </p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {question.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Shuffle className="w-8 h-8 text-white/50" />
                </div>
                <p className="text-white/70">Waiting for interviewer to select a question...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white glow-text">Problem</h3>
          {isInterviewer && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentQuestion(null)}
              className="text-white/70 hover:text-white"
            >
              Change
            </Button>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title and Difficulty */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white glow-text">
            {currentQuestion.title}
          </h2>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
              {currentQuestion.difficulty}
            </Badge>
                       <Badge variant="outline">
              {currentQuestion.category}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <div className="glass rounded-lg p-4">
          <p className="text-white/90 leading-relaxed">
            {currentQuestion.description}
          </p>
        </div>

        {/* Examples */}
        <div className="space-y-3">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2 text-white hover:text-neon-blue transition-colors"
          >
            <span className="font-medium">Examples</span>
            {showExamples ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {showExamples && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {currentQuestion.examples.map((example, index) => (
                  <div key={index} className="glass rounded-lg p-4 space-y-2">
                    <div>
                      <span className="text-white/70 text-sm">Input:</span>
                      <code className="block mt-1 p-2 bg-black/30 rounded text-green-400 text-sm font-mono">
                        {example.input}
                      </code>
                    </div>
                    <div>
                      <span className="text-white/70 text-sm">Output:</span>
                      <code className="block mt-1 p-2 bg-black/30 rounded text-blue-400 text-sm font-mono">
                        {example.output}
                      </code>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="text-white/70 text-sm">Explanation:</span>
                        <p className="mt-1 text-white/80 text-sm">
                          {example.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Constraints */}
        {currentQuestion.constraints && (
          <div className="glass rounded-lg p-4">
            <h4 className="text-white/90 font-medium mb-2">Constraints:</h4>
            <p className="text-white/70 text-sm font-mono">
              {currentQuestion.constraints}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
