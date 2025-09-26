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
import productService from "@/services/productService";

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
        - Responde con texto natural, amigable y bien estructurado
        - SIEMPRE incluye URLs de imágenes cuando estén disponibles en los datos de productos, sellos, bordes, etc, siempre y cuando sean obtenidas de las herramientas
        - SIEMPRE prefiere las imágenes thumbnails cuando estén disponibles sobre otras urls
        - Para productos como playmats, sellos, bordes, etc.: menciona nombre, precio, describe brevemente el diseño Y muestra la imagen si está disponible
        - Cuando tengas una URL de imagen, inclúyela en tu respuesta para que el usuario pueda ver el producto
        - Usa lenguaje conversacional como si estuvieras hablando cara a cara
        - Utiliza emojis de forma moderada y apropiada
        - Si no encuentras algo, sugiere alternativas similares
        - Si la respuesta de la herramienta no incluye imágenes, no inventes URLs o imágenes, responde solo con el lenguaje natural
        - Usa párrafos cortos y bien separados para mejor legibilidad
        - Las imágenes enriquecen la experiencia del usuario y deben mostrarse siempre que sea posible

        PRODUCTOS DISPONIBLES:
        - Playmats de alta calidad para cartas y juegos de mesa
        - Diseños exclusivos y personalizados
        - Sellos de diversas franquicias (anime, videojuegos, etc.)
        - Precios desde $1
        - Personalización disponible`,
      messages: convertToModelMessages(contextMessages),
      tools: {
        "list-topics": {
          description: `SIEMPRE úsalo cuando el usuario pregunte sobre los temas que puede consultar o en que le puedes ayudar.`,
          inputSchema: z.object({}),
          execute: async () => {
            const topics = [
              "Catálogo de productos",
              "Precios de productos",
              "Tipos y tamaños de playmats/mousepads",
              "Sellos disponibles",
              "Precios de sellos",
            ];
            return {
              topics,
              message: `Puedo ayudarte con los siguientes temas:\n- ${topics.join('\n- ')}`
            };
          }
        },
        "list-products": {
          description: `SIEMPRE úsalo cuando el usuario pregunte por el catálogo general de productos.`,
          inputSchema: z.object({}),
          execute: async () => {
            const products: any[] = await productService.list()
            return {
              found: products.length > 0,
              count: products.length,
              products,
              message: products.length > 0
                ? `Encontré ${products.length} producto(s) en total` 
                : `No encontré productos en nuestro catálogo`,
            };
          }
        },
        "list-products-by-price": {
          description: `SIEMPRE úsalo cuando el usuario pregunte por precios, productos baratos, o mencione un precio específico.`,
          inputSchema: z.object({
            minPrice: z.number().optional().describe("Precio mínimo de los productos a listar"),
            maxPrice: z.number().optional().describe("Precio máximo de los productos a listar"),
            price: z.number().describe("Precio promedio de los productos a listar"),
          }),
          execute: async ({ price, minPrice, maxPrice }: { price: number, minPrice?: number, maxPrice?: number }) => {
            const products: any[] = await productService.list()
            const filteredProducts = products.filter((product) => {
              const productPrice = product.price ?? 0;
              return (!minPrice || productPrice >= minPrice) && (!maxPrice || productPrice <= maxPrice);
            });
            return {
              found: filteredProducts.length > 0,
              count: filteredProducts.length,
              products: filteredProducts,
              message: filteredProducts.length > 0 
                ? `Encontré ${filteredProducts.length} producto(s) por debajo de $${price}` 
                : `No encontré productos por debajo de $${price} en nuestro catálogo`,
            };
          },
        },
        "list-products-by-theme": {
          description: `SIEMPRE úsalo cuando el usuario mencione cualquier tema, personaje, anime, videojuego o franquicia específica.`,
          inputSchema: z.object({
            theme: z.string().describe("El tema, personaje o franquicia específica que el usuario está pidiendo")
          }),
          execute: async ({ theme }: { theme: string }) => {
            const products: any[] = await productService.list()
            // Filter products based on theme (intelligent matching)
            const filteredProducts = products.filter(product => {
              const productName = product.name?.toLowerCase();
              const productDescription = product.description?.toLowerCase() || "";
              const searchTheme = theme.toLowerCase();
              return productName?.includes(searchTheme) ||
                    productDescription.includes(searchTheme) ||
                    productName?.split(' ').some((word: any) => searchTheme.includes(word)) ||
                    productDescription.split(' ').some((word: any) => searchTheme.includes(word))
            });
            return {
              found: filteredProducts.length > 0,
              count: filteredProducts.length,
              products: filteredProducts,
              message: filteredProducts.length > 0 
                ? `Encontré ${filteredProducts.length} producto(s) de ${theme}`
                : `No encontré productos de ${theme} en nuestro catálogo`,
            };
          }
        },
        "list-types": {
          description: `SIEMPRE úsalo cuando el usuario pregunte por tipos o categorías de diseños.`,
          inputSchema: z.object({}),
          execute: async () => {
            const types: any[] = await resourcesService.list({ category: '10' })
            return {
              found: types.length > 0,
              count: types.length,
              types,
              message: types.length > 0
                ? `Encontré ${types.length} tipo(s) de playmats/mousepads` 
                : `No encontré tipos de playmats/mousepads en nuestro catálogo`,
            };
          }
        },
        "list-sizes": {
          description: `SIEMPRE úsalo cuando el usuario pregunte por tamaños o dimensiones en general.`,
          inputSchema: z.object({}),
          execute: async () => {
            const sizes: any[] = await resourcesService.list({ category: `8` })
            return {
              found: sizes.length > 0,
              count: sizes.length,
              sizes,
              message: sizes.length > 0
                ? `Encontré ${sizes.length} tamaño(s) de playmats/mousepads`
                : `No encontré tamaños de playmats/mousepads en nuestro catálogo`,
            };
          }
        },
        "list-sizes-by-type": {
          description: `SIEMPRE úsalo cuando el usuario pregunte por tamaños o dimensiones de playmats o mouspads.`,
          inputSchema: z.object({
            type: z.string().describe("La categoría de los tamaños a listar como playmats o mousepads usando la referencia en singular, ej: 'playmat' o 'mousepad'"),
          }),
          execute: async ({ type }: { type: string }) => {
            const sizes: any[] = await resourcesService.list({ category: `8` })
            const typeSearch = type.toLowerCase();
            const filteredSizes = type
              ? sizes.filter(size => size.categories?.some((cat: any) => cat.name.toLowerCase().includes(typeSearch)))
              : sizes;
            return {
              found: filteredSizes.length > 0,
              count: filteredSizes.length,
              sizes: filteredSizes,
              message: filteredSizes.length > 0
                ? `Encontré ${filteredSizes.length} tamaño(s) de playmats/mousepads`
                : `No encontré tamaños de playmats/mousepads en nuestro catálogo`,
            };
          }
        },
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
        },
        "list-borders": {
          description: `SIEMPRE úsalo cuando el usuario pregunte por bordes disponibles para playmats.`,
          inputSchema: z.object({}),
          execute: async () => {
            const borders: any[] = await resourcesService.list({ category: '4' })
            return {
              found: borders.length > 0,
              count: borders.length,
              borders,
              message: borders.length > 0
                ? `Encontré ${borders.length} borde(s) para playmats`
                : `No encontré bordes para playmats en nuestro catálogo`,
            };
          }
        },
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
      content: `Responde con un saludo apropiado y pregunta en qué puedes ayudar con los productos de Playmats Ecuador.`
    }],
  });

  return defaultResponse.toUIMessageStreamResponse();
}