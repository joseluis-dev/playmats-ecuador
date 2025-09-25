import { useState, useEffect } from 'react';
import { BotIcon } from "./icons/BotIcon";
import { X, MessageCircle } from 'lucide-react';
import Chat from './AIChat/chat';
import { Button } from './ui/button';
import { useCustomizationTool } from '@/stores/customToolStore';

interface ChatbotProps {
  className?: string;
}

export const Chatbot = ({ className = '' }: ChatbotProps) => {
  const { addLayers, formRef } = useCustomizationTool()
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Hide tooltip after 5 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  // Handle ESC key to close chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setShowTooltip(false);
    }
  };

  const closeChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const handleSealAction = ({ seal }: any) => {
    const location = window.location.href;
    if (!location.includes('customise')) {
      // window.open(seal.url, '_blank');
      return;
    }
    const currentSeals = formRef.getValues('seals') || [];
    formRef.setValue('seals', [...currentSeals, seal]);
    addLayers('seals', seal);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Container */}
      <div className={`fixed bottom-0 right-0 z-50 transition-all duration-300 ease-in-out ${className}`}>
        
        {/* Chat Window */}
        {isOpen && (
          <div className={`
            fixed bottom-20 right-4 
            h-[calc(100vh-6rem)] md:w-96 md:h-[600px]
            max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)]
            bg-[var(--color-background)] 
            border border-[var(--color-border)]
            rounded-2xl shadow-2xl 
            transition-all duration-300 ease-in-out
            overflow-hidden
          `}>
            
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-[var(--color-muted)]/30 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                  <BotIcon className="w-4 h-4 text-[var(--color-primary-foreground)]" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm text-[var(--color-foreground)]">
                    Asistente Virtual
                  </h3>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Playmats EC
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeChat}
                  className="h-8 w-8 p-0 hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  title="Cerrar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="h-[calc(100%-4rem)] overflow-hidden">
              <Chat sealAction={handleSealAction} sizeAction={() => {}} borderAction={() => {}} />
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-5 right-5 flex flex-col items-end">
          {/* Tooltip */}
          {showTooltip && !isOpen && (
            <div className="mb-3 mr-4 bg-[var(--color-popover)] text-[var(--color-popover-foreground)] px-3 py-2 rounded-lg shadow-lg border border-[var(--color-border)] animate-bounce">
              <div className="text-sm font-medium">¿Necesitas ayuda?</div>
              <div className="text-xs opacity-90">Puedo resolver tus dudas</div>
              {/* Arrow pointing down-right */}
              <div className="absolute -bottom-1 right-4 w-2 h-2 bg-[var(--color-popover)] border-r border-b border-[var(--color-border)] transform rotate-45"></div>
            </div>
          )}

          {/* Main Button */}
          <Button
            onClick={toggleChat}
            className={`
              w-14 h-10 rounded-full shadow-2xl 
              bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90
              text-[var(--color-text)]
              transition-all duration-300 ease-in-out
              ${isOpen ? 'scale-95' : 'scale-100 hover:scale-110'}
              group relative overflow-hidden
            `}
            title={isOpen ? "Cerrar chat" : "Abrir chat"}
          >
            {/* Button icon with animation */}
            <div className={`transition-transform duration-300 ${isOpen ? 'rotate-270' : 'rotate-0'}`}>
              {isOpen ? (
                <MessageCircle className="h-8 w-8" />
              ) : (
                <BotIcon className="h-8 w-8" />
              )}
            </div>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200"></div>
          </Button>

          {/* Online indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--color-background)] animate-pulse"></div>
        </div>
      </div>
    </>
  );
};
