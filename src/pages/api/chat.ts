import { resourcesService } from "@/services/resourcesService";
import { ChatService, REJECTION_MESSAGES } from "@/services/chatService";
import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  type UIMessage,
  convertToModelMessages,
  stepCountIs,
} from "ai";
import { z } from "zod";

export const prerender = false;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: any) {
  const startTime = Date.now();
  const body = await req.request.json();
  
  // Nuevo formato: recibir solo el último mensaje y chatId
  const { message, chatId, messages: fullMessages } = body;
  
  // Si viene en el formato anterior (array completo), mantener compatibilidad
  const isLegacyFormat = Array.isArray(fullMessages);
  let lastUserMessage: UIMessage | undefined;
  let conversationHistory: UIMessage[] = [];
  
  if (isLegacyFormat) {
    // Formato anterior - usar tal como está
    conversationHistory = fullMessages;
    lastUserMessage = conversationHistory.filter(m => m.role === 'user').pop();
  } else {
    // Nuevo formato - reconstruir contexto desde persistencia
    if (chatId) {
      try {
        // Importar dinámicamente para evitar problemas SSR
        const { loadChat } = await import('@/utils/chatPersistence');
        conversationHistory = loadChat(chatId);
        console.log('📚 Contexto cargado desde persistencia:', conversationHistory.length, 'mensajes');
      } catch (error) {
        console.warn('⚠️ No se pudo cargar contexto:', error);
        conversationHistory = [];
      }
    }
    
    // Añadir el nuevo mensaje al contexto
    if (message) {
      conversationHistory = [...conversationHistory, message];
      lastUserMessage = message;
    }
  }
  
  console.log('📨 Nueva solicitud de chat recibida');
  
  if (lastUserMessage?.parts?.[0]?.type === 'text') {
    const messageText = lastUserMessage.parts[0].text;
    console.log('👤 Mensaje del usuario:', messageText.substring(0, 100) + (messageText.length > 100 ? '...' : ''));
    
    // Crear cliente OpenAI una sola vez
    const openai = createOpenAI({
      apiKey: import.meta.env.OPENAI_API_KEY,
    });
    
    // Procesar y validar el mensaje usando el servicio
    const messageResult = ChatService.processMessage(messageText);
    
    if (!messageResult.shouldProcess) {
      console.log(
        messageResult.rejectionReason === 'validation' 
          ? `❌ Mensaje rechazado por validación: ${messageResult.validation.reason}`
          : '🚫 Mensaje rechazado por contenido no relacionado al negocio'
      );
      
      const rejectionMessage = messageResult.rejectionReason === 'validation'
        ? REJECTION_MESSAGES.validation
        : REJECTION_MESSAGES.businessRestriction;
      
      const rejectionResponse = streamText({
        model: openai("gpt-4o-mini"),
        messages: [{
          role: 'system',
          content: `Responde exactamente con este mensaje:

          ${rejectionMessage}`
        }],
      });

      return rejectionResponse.toUIMessageStreamResponse();
    }
    
    console.log('✅ Mensaje aprobado - Procesando con OpenAI');
    
    // ESTRATEGIA: Usar contexto mínimo para herramientas
    // Solo incluir mensajes de usuario recientes (últimos 3-5) para evitar que el LLM "recuerde" 
    // resultados de herramientas y prefiera responder directamente
    const recentUserMessages = conversationHistory
      .filter(m => m.role === 'user')
      .slice(-3); // Últimos 3 mensajes de usuario
    
    const contextMessages = [
      // Incluir solo mensajes de usuario recientes para que el LLM use herramientas
      ...recentUserMessages,
      // Siempre incluir el mensaje actual
      lastUserMessage
    ].filter((msg, index, arr) => 
      // Evitar duplicados
      arr.findIndex(m => m.id === msg.id) === index
    );
    
    console.log('🎯 Usando contexto reducido:', contextMessages.length, 'mensajes para forzar uso de herramientas');
    
    // Si llega aquí, procesar con el sistema principal
    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: `Eres un asistente experto en sellos y playmats EXCLUSIVAMENTE.

        RESTRICCIONES ESTRICTAS:
        - SOLO responde preguntas sobre playmats, sellos, precios y productos de la tienda
        - NUNCA respondas preguntas sobre otros temas (política, tecnología, vida personal, etc.)
        - Si alguien pregunta algo no relacionado, redirige educadamente hacia los productos

        INSTRUCCIONES CRÍTICAS PARA HERRAMIENTAS:
        - SIEMPRE usa las herramientas disponibles para consultas sobre playmats, mousepads, sellos y productos
        - SIEMPRE úsalo cuando el usuario pregunte por sellos disponibles, catálogo o qué sellos tienes.
        - SIEMPRE úsalo cuando el usuario pregunte por precios, sellos baratos, o mencione un precio específico.
        - SIEMPRE úsalo cuando el usuario mencione cualquier tema, personaje, anime, videojuego o franquicia específica.
        - NO respondas de memoria sobre productos, precios o disponibilidad
        - Las herramientas te dan la información más actualizada
        - Aunque hayas respondido antes, SIEMPRE consulta las herramientas para datos precisos

        INSTRUCCIONES DE RESPUESTA:
        - Responde SOLO con texto natural, amigable y bien estructurado
        - NUNCA menciones URLs, enlaces, herramientas, plugins o procesos técnicos
        - Para sellos: menciona nombre, precio y describe brevemente el diseño
        - Usa lenguaje conversacional como si estuvieras hablando cara a cara
        - Utiliza emojis de forma moderada y apropiada
        - Si no encuentras algo, sugiere alternativas similares
        - Evita símbolos especiales como ***, ###, ---, etc.
        - Usa párrafos cortos y bien separados para mejor legibilidad

        PRODUCTOS DISPONIBLES:
        - Playmats de alta calidad para cartas y juegos de mesa
        - Diseños exclusivos y personalizados
        - Sellos de diversas franquicias (anime, videojuegos, etc.)
        - Precios desde $1
        - Personalización disponible`,
      messages: convertToModelMessages(contextMessages),
      tools: {
        "all-seals": {
          description: `SIEMPRE úsalo cuando el usuario pregunte por sellos disponibles, catálogo o qué sellos tienes.`,
          inputSchema: z.object({}),
          execute: async () => {
            const sellos = await resourcesService.list({ category: '3' })
            return {
              found: sellos.length > 0,
              count: sellos.length,
              seals: sellos,
              message: sellos.length > 0 
                ? `Encontré ${sellos.length} sello(s) en total` 
                : `No encontré sellos en nuestro catálogo`,
            };
          }
        },
        "list-seals-by-price": {
          description: `SIEMPRE úsalo cuando el usuario pregunte por precios, sellos baratos, o mencione un precio específico.`,
          inputSchema: z.object({
            price: z.number().describe("Precio máximo de los sellos a listar"),
          }),
          execute: async ({ price }: { price: number }) => {
            const sellos = await resourcesService.list({ category: '3' })
            const filteredSeals = sellos.filter((sello) => {
              const priceValue = sello.attributes?.find(attr => attr.name.includes('price'))?.value ?? "0";
              const priceAttr = parseFloat(priceValue);
              return !isNaN(priceAttr) && priceAttr <= price;
            });
            return {
              found: filteredSeals.length > 0,
              count: filteredSeals.length,
              seals: filteredSeals,
              message: filteredSeals.length > 0 
                ? `Encontré ${filteredSeals.length} sello(s) por debajo de $${price}` 
                : `No encontré sellos por debajo de $${price} en nuestro catálogo`,
            };
          },
        },
        "list-seals-by-theme": {
          description: `SIEMPRE úsalo cuando el usuario mencione cualquier tema, personaje, anime, videojuego o franquicia específica.`,
          inputSchema: z.object({
            theme: z.string().describe("El tema, personaje o franquicia específica que el usuario está pidiendo")
          }),
          execute: async ({ theme }: { theme: string }) => {
            const sellos = await resourcesService.list({ category: '3' })
            // Filter seals based on theme (intelligent matching)
            const filteredSeals = sellos.filter(seal => {
              const sealName = seal.name?.toLowerCase();
              const searchTheme = theme.toLowerCase();
              return sealName?.includes(searchTheme) ||
                    sealName?.split(' ').some(word => searchTheme.includes(word))
            });
            
            return {
              found: filteredSeals.length > 0,
              count: filteredSeals.length,
              seals: filteredSeals,
              message: filteredSeals.length > 0 
                ? `Encontré ${filteredSeals.length} sello(s) de ${theme}` 
                : `No encontré sellos de ${theme} en nuestro catálogo`,
            };
          }
        }
      },
      stopWhen: stepCountIs(5),
    });

    console.log('🤖 Respuesta generada por OpenAI - Tiempo total:', Date.now() - startTime, 'ms');
    return result.toUIMessageStreamResponse({
      originalMessages: conversationHistory,
      onFinish: async ({ messages }) => {
        if (chatId && !isLegacyFormat) {
          try {
            const { saveChat } = await import('@/utils/chatPersistence');
            saveChat(chatId, messages);
            console.log('💾 Conversación guardada en persistencia');
          } catch (error) {
            console.warn('⚠️ Error al guardar conversación:', error);
          }
        }
      },
    });
  }

  // Si no hay mensaje de texto válido, crear respuesta por defecto
  const openai = createOpenAI({
    apiKey: import.meta.env.OPENAI_API_KEY,
  });

  const defaultResponse = streamText({
    model: openai("gpt-4o-mini"),
    messages: [{
      role: 'system',
      content: `Responde con un saludo apropiado y pregunta en qué puedes ayudar con sellos y playmats.`
    }],
  });

  return defaultResponse.toUIMessageStreamResponse();
}