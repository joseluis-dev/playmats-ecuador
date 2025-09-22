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

export default function Chat() {
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
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[80vh] bg-background rounded-xl border border-border overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-muted/50 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <BotIcon className="w-4 h-4 text-[var(--color-text)]" />
        </div>
        <div>
          <h2 className="font-heading font-semibold">Asistente de Playmats EC</h2>
          <p className="text-sm text-muted-foreground">
            {status === 'streaming' ? 'Escribiendo...' : 'Listo para ayudarte'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <BotIcon className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-heading font-semibold text-lg">¡Hola! 👋</h3>
              <p className="text-muted-foreground mt-2">
                Soy tu asistente virtual. Puedo ayudarte a encontrar sellos por tema o precio.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage({ text: "¿Qué sellos tienes disponibles?" })}
                >
                  Ver sellos disponibles
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage({ text: "Muéstrame sellos de League of Legends" })}
                >
                  Sellos de juegos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage({ text: "¿Tienes sellos de $2 o menos?" })}
                >
                  Sellos por precio
                </Button>
              </div>
            </div>
          </div>
        )}

        {messages.map(message => (
          <div key={message.id} className="space-y-4">
            {/* Message Header */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                message.role === 'user' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-[var(--color-surface)] text-secondary-foreground"
              )}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-[var(--color-text)]" />
                ) : (
                  <BotIcon className="w-4 h-4" />
                )}
              </div>
              <span className="font-heading font-medium text-sm text-muted-foreground">
                {message.role === 'user' ? 'Tú' : 'Asistente'}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            
            {/* Message Content */}
            <div className="ml-11 space-y-4">
              {message.parts.map((part, index) => {
                switch (part.type) {
                  case 'text':
                    return (
                      <div key={index} className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
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
                      <div key={index} className="h-px bg-border my-6" />
                    ) : null;

                  case 'tool-all-seals':
                  case 'tool-list-seals-by-price':
                  case 'tool-list-seals-by-theme':
                    switch (part.state) {
                      case 'input-streaming':
                        return (
                          <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 border border-border rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">
                              🦭 Preparando búsqueda...
                            </span>
                          </div>
                        );
                      case 'input-available':
                        return (
                          <div key={index} className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm text-primary">
                              🦭 Buscando sellos{(part as any).input?.tema && ` de ${(part as any).input.tema}`}
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
                          <div key={index} className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive">
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

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-muted/20">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== 'ready'}
            placeholder="Pregúntame sobre sellos, precios o temas..."
            className="flex-1"
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
            className='text-[var(--color-text)]'
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
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {status === 'streaming' ? 'El asistente está escribiendo...' : 'Procesando...'}
          </p>
        )}
      </div>
    </div>
  );
}