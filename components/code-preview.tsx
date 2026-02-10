'use client';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import React, { useRef, useEffect } from 'react';

interface CodeEditorProps {
  code: string;
  language: 'html' | 'css' | 'javascript';
  onCodeChange: (code: string) => void;
}

export function CodePreview({ code, language, onCodeChange }: CodeEditorProps) {
  const prismLang = language === 'html' ? 'markup' : language;
  const lineCount = code.split('\n').length;
  
  const editorRef = useRef<any>(null);
  
  const linesContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const editorDiv = editorRef.current;
    const linesEl = linesContainerRef.current;
    if (!editorDiv || !linesEl) return;

    const handleScroll = () => {
        if (linesEl) {
            linesEl.scrollTop = editorDiv.scrollTop;
        }
    };

    editorDiv.addEventListener('scroll', handleScroll);
    
    // Initial sync
    handleScroll();

    return () => {
      editorDiv.removeEventListener('scroll', handleScroll);
    };
  }, [code]);

  return (
    <div className="relative h-full w-full flex bg-background" data-prism-renderer="true">
      <div 
        ref={linesContainerRef}
        aria-hidden="true"
        className="flex-shrink-0 select-none text-right text-muted-foreground pt-4 pr-4 overflow-y-hidden bg-background"
        style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            lineHeight: '1.5',
        }}
      >
        {Array.from({ length: lineCount > 0 ? lineCount : 1 }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div ref={editorRef} className="flex-1 overflow-y-auto bg-background">
        <Editor
          value={code}
          onValueChange={onCodeChange}
          highlight={(code) => highlight(code, languages[prismLang] || languages.clike, prismLang)}
          padding={{ top: 16, right: 16, bottom: 16, left: 16 }}
          className="min-h-full"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            lineHeight: '1.5',
            caretColor: 'hsl(var(--foreground))',
          }}
        />
      </div>
    </div>
  );
}
