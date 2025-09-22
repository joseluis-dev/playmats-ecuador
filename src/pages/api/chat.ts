import { resourcesService } from "@/services/resourcesService";
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

// Keywords relacionadas con el negocio
const BUSINESS_KEYWORDS = [
  // Saludos y cortesía
  'hola', 'buenos', 'buenas', 'tardes', 'dias', 'días', 'gracias', 'por favor',

  // Productos
  'sello', 'sellos', 'playmat', 'playmats', 'sticker', 'stickers',
  'personalización', 'personalizacion', 'diseño', 'diseños',
  
  // Temas/Franquicias
  'pokemon', 'pikachu', 'charizard', 'digimon', 'agumon', 'omnimon',
  'anime', 'manga', 'naruto', 'goku', 'dragon ball', 'one piece', 'luffy',
  'sailor moon', 'yugi', 'yu-gi-oh', 'attack on titan', 'kimetsu', 'yaiba',
  'league of legends', 'apex legends', 'lol',
  
  // Comercio
  'precio', 'precios', 'costo', 'costos', 'comprar', 'venta', 'ventas',
  'catalogo', 'catálogo', 'disponible', 'disponibles', 'stock',
  'tienda', 'negocio', 'producto', 'productos',
  
  // Consultas generales del negocio
  'que', 'qué', 'como', 'cómo', 'donde', 'dónde', 'cuando', 'cuándo',
  'mostrar', 'ver', 'buscar', 'encontrar', 'listar', 'tengo', 'tienes',
  'hay', 'existe', 'existen', 'cuanto', 'cuánto', 'cuales', 'cuáles'
];

// Temas explícitamente prohibidos
const PROHIBITED_TOPICS = [
  'política', 'politica', 'religion', 'religión', 'drogas', 'sexo',
  'violencia', 'armas', 'hack', 'piratería', 'pirateria',
  'programación', 'programacion', 'código', 'codigo', 'javascript',
  'python', 'react', 'desarrollo', 'software'
];

function validateMessage(message: string): { isValid: boolean; reason?: string } {
  // Validar mensaje vacío
  if (!message.trim()) {
    return { isValid: false, reason: 'Mensaje vacío' };
  }
  
  // Validar longitud mínima (evitar spam de 1-2 caracteres)
  if (message.trim().length < 2) {
    return { isValid: false, reason: 'Mensaje demasiado corto' };
  }
  
  // Validar longitud máxima (evitar spam)
  if (message.length > 1000) {
    return { isValid: false, reason: 'Mensaje demasiado largo' };
  }
  
  // Detectar posible spam (muchos caracteres repetidos)
  const repeatedChars = /(.)\1{10,}/; // Más de 10 caracteres iguales seguidos
  if (repeatedChars.test(message)) {
    return { isValid: false, reason: 'Posible spam detectado' };
  }
  
  return { isValid: true };
}

function isBusinessRelated(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Verificar si contiene temas prohibidos (más estricto)
  const hasProhibitedContent = PROHIBITED_TOPICS.some(topic => {
    // Buscar la palabra completa, no solo como parte de otra palabra
    const wordBoundary = new RegExp(`\\b${topic}\\b`);
    return wordBoundary.test(lowerMessage);
  });
  
  if (hasProhibitedContent) {
    console.log('🔍 Tema prohibido detectado en el mensaje');
    return false;
  }
  
  // Verificar si contiene palabras relacionadas con el negocio
  const hasBusinessKeywords = BUSINESS_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Patrones adicionales específicos del negocio (mejorados)
  const businessPatterns = [
    /\$\d+/,  // Menciones de precios como $5, $10
    /precio.*\d+/,  // "precio de 5", "precio hasta 10"  
    /\d+.*dollar/,  // "5 dollars"
    /cuant[oa].*cuesta/,  // "cuanto cuesta", "cuanta cuesta"
    /que.*tienes?/,  // "que tienes", "qué tienes"
    /mostrar.*todo/,  // "mostrar todo", "muestra todo"
    /ver.*catalogo/,  // "ver catálogo"
    /quiero.*comprar/,  // "quiero comprar"
    /busco.*sello/,  // "busco sello"
    /tienen.*disponible/,  // "tienen disponible"
    /me.*interesa/,  // "me interesa"
    /recomienda.*algo/,  // "recomiendas algo"
  ];
  
  const hasBusinessPatterns = businessPatterns.some(pattern => 
    pattern.test(lowerMessage)
  );
  
  // Permitir saludos simples y cortesías básicas
  const greetingPatterns = [
    /^(hola|buenos|buenas|gracias|por favor)(\s|$)/,
    /^(hi|hello|hey)(\s|$)/,
  ];
  
  const hasGreeting = greetingPatterns.some(pattern => 
    pattern.test(lowerMessage)
  );
  
  const isBusinessRelated = hasBusinessKeywords || hasBusinessPatterns || hasGreeting;
  
  console.log('🔍 Análisis de contenido:', {
    hasBusinessKeywords,
    hasBusinessPatterns,
    hasGreeting,
    isBusinessRelated
  });
  
  return isBusinessRelated;
}

export async function POST(req: any) {
  const startTime = Date.now();
  const { messages }: { messages: UIMessage[] } = await req.request.json();
  
  console.log('📨 Nueva solicitud de chat recibida');
  
  // Obtener el último mensaje del usuario
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  
  if (lastUserMessage?.parts?.[0]?.type === 'text') {
    const messageText = lastUserMessage.parts[0].text;
    console.log('👤 Mensaje del usuario:', messageText.substring(0, 100) + (messageText.length > 100 ? '...' : ''));
    
    // Validar el mensaje antes del filtrado
    const validation = validateMessage(messageText);
    if (!validation.isValid) {
      console.log('❌ Mensaje rechazado por validación:', validation.reason);
      
      const validationMessage = `🦭 Lo siento, tu mensaje no pudo ser procesado. Por favor:

• Escribe un mensaje claro y completo
• Usa un lenguaje apropiado
• Pregunta sobre sellos, playmats o productos

¿En qué puedo ayudarte con nuestros productos? 😊`;

      return new Response(
        JSON.stringify({
          messages: [
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: validationMessage,
              createdAt: new Date()
            }
          ]
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Verificar si el mensaje está relacionado con el negocio
    if (!isBusinessRelated(messageText)) {
      console.log('🚫 Mensaje rechazado por contenido no relacionado al negocio');
      
      // Respuesta estática sin llamar a OpenAI para ahorrar costos
      const restrictedMessage = `🦭 Hola! Soy tu asistente especializado en sellos y playmats. Solo puedo ayudarte con:

• Búsqueda de sellos por tema o franquicia
• Consultas de precios y disponibilidad  
• Información sobre nuestro catálogo
• Recomendaciones de productos

¿Te gustaría ver nuestros sellos disponibles o buscar algo específico? 😊`;

      return new Response(
        JSON.stringify({
          messages: [
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: restrictedMessage,
              createdAt: new Date()
            }
          ]
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    console.log('✅ Mensaje aprobado - Procesando con OpenAI');
  }

  // Create OpenAI client with API key
  const openai = createOpenAI({
    apiKey: import.meta.env.OPENAI_API_KEY,
  });

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `Eres un asistente experto en sellos y playmats EXCLUSIVAMENTE.

      RESTRICCIONES ESTRICTAS:
      - SOLO responde preguntas sobre sellos, playmats, precios y productos de la tienda
      - NUNCA respondas preguntas sobre otros temas (política, tecnología, vida personal, etc.)
      - Si alguien pregunta algo no relacionado, redirige educadamente hacia los productos

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
      - Sellos de diversas franquicias (anime, videojuegos, etc.)
      - Precios desde $1
      - Personalización disponible`,
    messages: convertToModelMessages(messages),
    tools: {
      "all-seals": {
        description: `Úsalo para listar todos los sellos disponibles.`,
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
        description: `Úsalo para listar los sellos disponibles por precio.`,
        inputSchema: z.object({
          price: z.number().describe("Precio de los sellos a listar"),
        }),
        execute: async ({ price }) => {
          console.log("Listing seals by price:", price);
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
        description: `Úsalo para listar los sellos disponibles por tema.`,
        inputSchema: z.object({
          theme: z.string().describe("The specific theme, character, or franchise the user is asking about")
        }),
        execute: async ({ theme }) => {
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
  return result.toUIMessageStreamResponse();
}
