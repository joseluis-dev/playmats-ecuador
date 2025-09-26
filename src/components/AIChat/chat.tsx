import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BotIcon } from '@/components/icons/BotIcon';
import { Send, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ResourceItem } from './types';
import type { UIMessage } from 'ai';
import { getOrCreateChatId, loadChat, saveChat } from '@/utils/chatPersistence';
import { Conversation, ConversationContent, ConversationScrollButton } from '../ai-elements/conversation';
import { Response } from '../ai-elements/response';
import { resourcesService } from '@/services/resourcesService';

interface ChatProps {
  className?: string;
  sealAction?: (type: ResourceItem) => void;
  typeAction?: (type: ResourceItem) => void;
  sizeAction?: (size: ResourceItem) => void;
  borderAction?: (border: ResourceItem) => void;
}

export default function Chat({ 
  className = '', 
  sealAction = () => {}, 
  typeAction = () => {}, 
  sizeAction = () => {}, 
  borderAction = () => {} 
}: ChatProps) {
  // Chat ID & initial messages persistence layer
  const [chatId, setChatId] = useState<string | undefined>();
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | undefined>();
  const [ready, setReady] = useState(false);

  // Initialize chat id & load messages once on mount
  useEffect(() => {
    try {
      const id = getOrCreateChatId();
      setChatId(id);
      const stored = loadChat(id);
      setInitialMessages(stored);
    } finally {
      setReady(true);
    }
  }, []);

  const { messages, sendMessage, status } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      // Enviar solo el último mensaje al servidor
      prepareSendMessagesRequest: ({ messages, id }) => {
        const lastMessage = messages[messages.length - 1];
        return {
          body: { 
            message: lastMessage, 
            chatId: id 
          },
        };
      },
    }),
    // NOTA: Cuando migremos a persistencia en base de datos, considerar generación de IDs en el servidor.
  });
  const [input, setInput] = useState('');

  // Persist messages on each change (evita escribir durante hidratación inicial)
  useEffect(() => {
    if (!chatId) return;
    if (!ready) return; // evita sobrescribir al cargar
    saveChat(chatId, messages);
  }, [messages, chatId, ready]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const handleClick = async (href: string) => {
    let data = []
    data = await resourcesService.list({ thumbnail: href });
    if (data.length === 0) data = await resourcesService.list({ url: href });
    if (data.length === 0) return;
    const categories = ['Sellos', 'Tipo', 'Tamaño', 'Bordes'];
    const item = data[0];
    const category = categories.find(cat =>
      item.categories?.some((c: any) =>
        typeof c === 'string'
          ? c === cat
          : c.name === cat || c.id === cat
      )
    );
    const actionMap: Record<string, (item: ResourceItem) => void> = {
      'Sellos': sealAction,
      'Tipo': typeAction,
      'Tamaño': sizeAction,
      'Bordes': borderAction,
    };
    if (category && actionMap[category]) {
      actionMap[category](item as ResourceItem);
    }
  }

  // Loading skeleton while initializing persistence
  if (!ready) {
    return (
      <div className={cn(
        'w-full h-full flex flex-col items-center justify-center text-xs text-[var(--color-muted-foreground)]',
        className
      )}>
        Cargando historial de chat...
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full h-full flex flex-col bg-[var(--color-background)] overflow-hidden",
      className
    )}>
        <Conversation className=''>
          <ConversationContent>
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
                      onClick={() => sendMessage({ text: "¿Qué tipos de playmat tienes?" })}
                      className="text-xs"
                    >
                      Ver tipos de playmat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage({ text: "¿Qué tamaños están disponibles?" })}
                      className="text-xs"
                    >
                      Ver tamaños disponibles
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage({ text: "¿Tienes bordes decorativos?" })}
                      className="text-xs"
                    >
                      Ver bordes disponibles
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
                            <Response
                              key={`${message.id}-${index}`}
                              className='text-[var(--color-text)]'
                              components={{
                                img: (props) => <ImgClickable onImageClick={handleClick} {...props} />,
                              }}
                            >
                              {part.text}
                            </Response>
                          </div>
                        );

                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            ))}
          </ConversationContent>
        <ConversationScrollButton />
        </Conversation>

      {/* Input Area - Compact for popup */}
      <div className="border-t border-[var(--color-border)] p-3 bg-[var(--color-muted)]/20">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== 'ready'}
            placeholder="Puedo resolver tus dudas..."
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
              <Loader2 className="w-4 h-4 animate-spin text-[var(--color-text)]" />
            ) : (
              <Send className="w-4 h-4 text-[var(--color-text)]" />
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

interface ImgClickableProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onImageClick?: (href: string) => void;
}

function ImgClickable(props: ImgClickableProps) {
  const { src = '', alt, onImageClick, ...rest } = props;

  function handleClick() {
    // Ejemplo: extraer un id desde la URL o usar data-attrs
    const url = new URL(src, window.location.origin);
    const href = url.href;
    if (!href) return;
    onImageClick && onImageClick(href);
  }

  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      onClick={handleClick}
      className="cursor-pointer object-cover object-center rounded-md hover:scale-105 transition-transform bg-[var(--color-surface)]"
    />
  );
}