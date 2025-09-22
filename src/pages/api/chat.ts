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

export async function POST(req: any) {
  const { messages }: { messages: UIMessage[] } = await req.request.json();
  // Create OpenAI client with API key
  const openai = createOpenAI({
    apiKey: import.meta.env.OPENAI_API_KEY,
  });

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `Eres un asistente experto en sellos, playmats y información del clima.
      INSTRUCCIONES IMPORTANTES:
      - Responde SOLO con texto natural, amigable y bien estructurado
      - NUNCA menciones URLs, enlaces, herramientas, plugins o procesos técnicos
      - Para sellos: menciona nombre, precio y describe brevemente el diseño
      - Usa lenguaje conversacional como si estuvieras hablando cara a cara
      - Utiliza emojis de forma moderada y apropiada
      - Si no encuentras algo, sugiere alternativas similares
      - Evita símbolos especiales como ***, ###, ---, etc.
      - Usa párrafos cortos y bien separados para mejor legibilidad`,
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
