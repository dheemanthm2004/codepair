"use client";

import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useRoomStore } from '@/store/room-store';
import { socketManager } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw, Settings, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

export function CodeEditor() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { codeState, setCodeState, currentQuestion } = useRoomStore();

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Listen for content changes
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      const position = editor.getPosition();
      
      const newCodeState = {
        code: value,
        language: codeState.language,
        cursorPosition: position ? { line: position.lineNumber, column: position.column } : undefined,
      };

      setCodeState(newCodeState);
      socketManager.emit('code-change', newCodeState);
    });

    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      socketManager.emit('cursor-change', {
        userId: 'current-user', // TODO: Get from auth
        position: { line: e.position.lineNumber, column: e.position.column },
      });
    });
  };

  const handleLanguageChange = (language: string) => {
    const newCodeState = {
      ...codeState,
      language,
      code: currentQuestion?.starterCode[language] || '',
    };
    setCodeState(newCodeState);
    socketManager.emit('code-change', newCodeState);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeState.code);
      // TODO: Show toast
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleResetCode = () => {
    const resetCode = currentQuestion?.starterCode[codeState.language] || '';
    const newCodeState = {
      ...codeState,
      code: resetCode,
    };
    setCodeState(newCodeState);
    socketManager.emit('code-change', newCodeState);
  };

  const handleRunCode = () => {
    // TODO: Implement code execution
    console.log('Running code:', codeState.code);
  };

  // Listen for remote code changes
  useEffect(() => {
    const socket = socketManager.getSocket();
    if (!socket) return;

    const handleCodeChange = (newCodeState: typeof codeState) => {
      if (editorRef.current) {
        const currentValue = editorRef.current.getValue();
        if (currentValue !== newCodeState.code) {
          editorRef.current.setValue(newCodeState.code);
        }
      }
      setCodeState(newCodeState);
    };

    socket.on('code-change', handleCodeChange);

    return () => {
      socket.off('code-change', handleCodeChange);
    };
  }, [setCodeState]);

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <select
            value={codeState.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="glass rounded-md px-3 py-1 text-sm bg-white/10 border border-white/20 text-white"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyCode}
            className="text-white/70 hover:text-white"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetCode}
            className="text-white/70 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="neon"
            size="sm"
            onClick={handleRunCode}
            className="ml-2"
          >
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={codeState.language}
          value={codeState.code}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: 'Fira Code, Monaco, Consolas, monospace',
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            renderWhitespace: 'selection',
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'line',
            selectionHighlight: false,
            occurrencesHighlight: "off",
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      </div>
    </div>
  );
}
