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
      "list-seals-by-precio": {
        description: `Úsalo para listar los sellos disponibles por precio.`,
        inputSchema: z.object({
          precio: z.number().describe("Precio de los sellos a listar"),
        }),
        execute: async ({ precio }) => {
          const sellos = await resourcesService.list({ category: '3' })
          return sellos.filter((sello) => {
            const priceValue = sello.attributes?.find(attr => attr.name.includes('price'))?.value ?? "0";
            const priceAttr = parseFloat(priceValue);
            return !isNaN(priceAttr) && priceAttr <= precio;
          });
        },
      },
      "list-seals-by-theme": {
        description: `Úsalo para listar los sellos disponibles por tema.`,
        inputSchema: z.object({
          tema: z.string().describe("Tema de los sellos a listar"),
        }),
        execute: async ({ tema, query }) => {
          const sellos = await resourcesService.list({ category: '3' })
          const filteredSeals = sellos.filter(seal => {
            const sealName = seal.name?.toLowerCase();
            const searchTheme = tema.toLowerCase();
            const searchQuery = query.toLowerCase();

            return sealName?.includes(searchTheme) || 
                  sealName?.includes('kimetsu') && (searchTheme.includes('kimetsu') || searchTheme.includes('yaiba')) ||
                  sealName?.includes('league') && searchTheme.includes('league') ||
                  sealName?.includes('apex') && searchTheme.includes('apex') ||
                  searchQuery.includes(sealName?.split(' ')[1]?.toLowerCase() || '');
          });
          
          return {
            found: filteredSeals.length > 0,
            count: filteredSeals.length,
            seals: filteredSeals,
            message: filteredSeals.length > 0 
              ? `Encontré ${filteredSeals.length} sello(s) de ${tema}` 
              : `No encontré sellos de ${tema} en nuestro catálogo`,
          };
        }
      }
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
