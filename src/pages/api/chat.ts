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

function isBusinessRelated(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Verificar si contiene temas prohibidos
  const hasProhibitedContent = PROHIBITED_TOPICS.some(topic => 
    lowerMessage.includes(topic)
  );
  
  if (hasProhibitedContent) {
    return false;
  }
  
  // Verificar si contiene palabras relacionadas con el negocio
  const hasBusinessKeywords = BUSINESS_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Patrones adicionales específicos del negocio
  const businessPatterns = [
    /\$\d+/,  // Menciones de precios como $5, $10
    /precio.*\d+/,  // "precio de 5", "precio hasta 10"
    /\d+.*dollar/,  // "5 dollars"
    /cuant[oa].*cuesta/,  // "cuanto cuesta", "cuanta cuesta"
    /que.*tienes?/,  // "que tienes", "qué tienes"
    /mostrar.*todo/,  // "mostrar todo", "muestra todo"
    /ver.*catalogo/,  // "ver catálogo"
  ];
  
  const hasBusinessPatterns = businessPatterns.some(pattern => 
    pattern.test(lowerMessage)
  );
  
  return hasBusinessKeywords || hasBusinessPatterns;
}

export async function POST(req: any) {
  const { messages }: { messages: UIMessage[] } = await req.request.json();
  
  // Obtener el último mensaje del usuario
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  
  if (lastUserMessage?.parts?.[0]?.type === 'text') {
    const messageText = lastUserMessage.parts[0].text;
    
    // Verificar si el mensaje está relacionado con el negocio
    if (!isBusinessRelated(messageText)) {
      console.log('🚫 Mensaje rechazado por no estar relacionado con el negocio:', messageText);
      
      // Crear un mensaje simulado del asistente usando streamText
      const openai = createOpenAI({
        apiKey: import.meta.env.OPENAI_API_KEY,
      });

      const restrictedResponse = streamText({
        model: openai("gpt-4o-mini"),
        messages: [{
          role: 'system',
          content: `Responde exactamente con este texto:

            🦭 Hola! Soy tu asistente especializado en sellos y playmats. Solo puedo ayudarte con:

            • Búsqueda de sellos por tema o franquicia
            • Consultas de precios y disponibilidad  
            • Información sobre nuestro catálogo
            • Recomendaciones de productos

            ¿Te gustaría ver nuestros sellos disponibles o buscar algo específico? 😊`
        }],
      });

      return restrictedResponse.toUIMessageStreamResponse();
    }
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

  return result.toUIMessageStreamResponse();
}
