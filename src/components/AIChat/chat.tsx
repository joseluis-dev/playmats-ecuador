import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BotIcon } from '@/components/icons/BotIcon';
import { Send, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SealResults } from './SealResults';
import type { SealSearchResult } from './types';

export default function Chat({ className = '' }: { className?: string }) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current && messagesEndRef.current) {
      const container = messagesContainerRef.current;
      const endElement = messagesEndRef.current;
      
      // Scroll within the container only
      const containerRect = container.getBoundingClientRect();
      const elementRect = endElement.getBoundingClientRect();
      
      if (elementRect.bottom > containerRect.bottom || elementRect.top < containerRect.top) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className={cn(
      "w-full h-full flex flex-col bg-[var(--color-background)] overflow-hidden",
      className
    )}>
      {/* Messages Area - Adjusted for popup */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-muted) transparent' 
        }}
      >
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-4">
            <BotIcon className="w-12 h-12 mx-auto text-[var(--color-muted-foreground)]" />
            <div>
              <h3 className="font-heading font-semibold text-lg text-[var(--color-foreground)]">¡Hola! 👋</h3>
              <p className="text-[var(--color-muted-foreground)] mt-2 text-sm">
                Soy tu asistente virtual. Puedo ayudarte a encontrar sellos por tema o precio.
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage({ text: "¿Qué sellos tienes disponibles?" })}
                  className="text-xs"
                >
                  Ver sellos disponibles
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage({ text: "Muéstrame sellos de League of Legends" })}
                  className="text-xs"
                >
                  Sellos de juegos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage({ text: "¿Tienes sellos de $2 o menos?" })}
                  className="text-xs"
                >
                  Sellos por precio
                </Button>
              </div>
            </div>
          </div>
        )}

        {messages.map(message => (
          <div key={message.id} className="space-y-3">
            {/* Message Header */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                message.role === 'user' 
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" 
                  : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
              )}>
                {message.role === 'user' ? (
                  <User className="w-3 h-3" />
                ) : (
                  <BotIcon className="w-3 h-3" />
                )}
              </div>
              <span className="font-heading font-medium text-xs text-[var(--color-muted-foreground)]">
                {message.role === 'user' ? 'Tú' : 'Asistente'}
              </span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {new Date().toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            
            {/* Message Content */}
            <div className="ml-8 space-y-3">
              {message.parts.map((part, index) => {
                switch (part.type) {
                  case 'text':
                    return (
                      <div key={index} className="prose prose-sm max-w-none">
                        <p className="text-[var(--color-foreground)] leading-relaxed whitespace-pre-wrap text-sm">
                          {part.text
                            .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
                            .replace(/###(.*?)###/g, '$1')
                            .replace(/---(.*?)---/g, '$1')
                            .replace(/\*\*(.*?)\*\*/g, '$1')
                            .replace(/http[s]?:\/\/[^\s]+/g, '')
                            .replace(/\([^)]*\)/g, '')
                            .trim()
                          }
                        </p>
                      </div>
                    );

                  case 'step-start':
                    return index > 0 ? (
                      <div key={index} className="h-px bg-[var(--color-border)] my-4" />
                    ) : null;

                  case 'tool-all-seals':
                  case 'tool-list-seals-by-price':
                  case 'tool-list-seals-by-theme':
                    switch (part.state) {
                      case 'input-streaming':
                        return (
                          <div key={index} className="flex items-center gap-2 p-2 bg-[var(--color-muted)]/50 border border-[var(--color-border)] rounded-lg">
                            <Loader2 className="w-3 h-3 animate-spin text-[var(--color-primary)]" />
                            <span className="text-xs text-[var(--color-muted-foreground)]">
                              🤖 Preparando búsqueda...
                            </span>
                          </div>
                        );
                      case 'input-available':
                        return (
                          <div key={index} className="flex items-center gap-2 p-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg">
                            <Loader2 className="w-3 h-3 animate-spin text-[var(--color-primary)]" />
                            <span className="text-xs text-[var(--color-primary)]">
                              🤖 Buscando sellos{(part as any).input?.tema && ` de ${(part as any).input.tema}`}
                              {(part as any).input?.precio && ` hasta $${(part as any).input.precio}`}...
                            </span>
                          </div>
                        );
                      case 'output-available':
                        return (
                          <div key={index}>
                            <SealResults sealData={(part as any).output as SealSearchResult} />
                          </div>
                        );
                      case 'output-error':
                        return (
                          <div key={index} className="p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-600">
                              ❌ Error al buscar sellos: {part.errorText}
                            </p>
                          </div>
                        );
                    }
                    break;

                  default:
                    return null;
                }
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Compact for popup */}
      <div className="border-t border-[var(--color-border)] p-3 bg-[var(--color-muted)]/20">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== 'ready'}
            placeholder="Pregúntame sobre sellos..."
            className="flex-1 text-sm h-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && status === 'ready') {
                  sendMessage({ text: input });
                  setInput('');
                }
              }
            }}
          />
          <Button
            className='text-[var(--color-primary-foreground)]'
            type="submit"
            disabled={!input.trim() || status !== 'ready'}
            size="sm"
          >
            {status !== 'ready' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        {status !== 'ready' && (
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1 text-center">
            {status === 'streaming' ? 'El asistente está escribiendo...' : 'Procesando...'}
          </p>
        )}
      </div>
    </div>
  );
}