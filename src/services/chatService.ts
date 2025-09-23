/**
 * Chat Service - Maneja validación y filtrado de mensajes del chatbot
 */

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
  'hay', 'existe', 'existen', 'cuanto', 'cuánto', 'cuales', 'cuáles', 'muestrame',
  'quiero', 'busco', 'tienen', 'interesa', 'recomienda', 'recomiendas',
];

// Temas explícitamente prohibidos
const PROHIBITED_TOPICS = [
  'política', 'politica', 'religion', 'religión', 'drogas', 'sexo',
  'violencia', 'armas', 'hack', 'piratería', 'pirateria',
  'programación', 'programacion', 'código', 'codigo', 'javascript',
  'python', 'react', 'desarrollo', 'software'
];

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export interface BusinessAnalysis {
  hasBusinessKeywords: boolean;
  hasBusinessPatterns: boolean;
  hasGreeting: boolean;
  isBusinessRelated: boolean;
}

/**
 * Valida que el mensaje cumpla con los requisitos básicos
 */
export function validateMessage(message: string): ValidationResult {
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

/**
 * Determina si el mensaje está relacionado con el negocio
 */
export function isBusinessRelated(message: string): boolean {
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

/**
 * Analiza el mensaje de manera más detallada (útil para debugging)
 */
export function analyzeMessage(message: string): BusinessAnalysis {
  const lowerMessage = message.toLowerCase();
  
  // Verificar palabras clave del negocio
  const hasBusinessKeywords = BUSINESS_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Verificar patrones del negocio
  const businessPatterns = [
    /\$\d+/, /precio.*\d+/, /\d+.*dollar/, /cuant[oa].*cuesta/,
    /que.*tienes?/, /mostrar.*todo/, /ver.*catalogo/, /quiero.*comprar/,
    /busco.*sello/, /tienen.*disponible/, /me.*interesa/, /recomienda.*algo/,
  ];
  
  const hasBusinessPatterns = businessPatterns.some(pattern => 
    pattern.test(lowerMessage)
  );
  
  // Verificar saludos
  const greetingPatterns = [
    /^(hola|buenos|buenas|gracias|por favor)(\s|$)/,
    /^(hi|hello|hey)(\s|$)/,
  ];
  
  const hasGreeting = greetingPatterns.some(pattern => 
    pattern.test(lowerMessage)
  );
  
  const isBusinessRelated = hasBusinessKeywords || hasBusinessPatterns || hasGreeting;
  
  return {
    hasBusinessKeywords,
    hasBusinessPatterns,
    hasGreeting,
    isBusinessRelated
  };
}

/**
 * Mensajes predefinidos para respuestas de rechazo
 */
export const REJECTION_MESSAGES = {
  validation: `🤖 Lo siento, tu mensaje no pudo ser procesado. Por favor:

    • Escribe un mensaje claro y completo
    • Usa un lenguaje apropiado
    • Pregunta sobre playmats, sellos o productos

    ¿En qué puedo ayudarte con nuestros productos? 😊`,

  businessRestriction: `🤖 Hola! Soy tu asistente especializado de Playmats Ecuador. Solo puedo ayudarte con:

    • Búsqueda de productos por tema o franquicia
    • Consultas de precios y disponibilidad  
    • Información sobre nuestro catálogo
    • Recomendaciones de productos

    ¿Te gustaría ver nuestros productos disponibles o buscar algo específico? 😊`
};

/**
 * Servicio principal para validar mensajes del chat
 */
export class ChatService {
  /**
   * Procesa y valida un mensaje del usuario
   */
  static processMessage(message: string): {
    validation: ValidationResult;
    analysis: BusinessAnalysis;
    shouldProcess: boolean;
    rejectionReason?: 'validation' | 'business-restriction';
  } {
    const validation = validateMessage(message);
    
    if (!validation.isValid) {
      return {
        validation,
        analysis: {
          hasBusinessKeywords: false,
          hasBusinessPatterns: false,
          hasGreeting: false,
          isBusinessRelated: false
        },
        shouldProcess: false,
        rejectionReason: 'validation'
      };
    }
    
    const analysis = analyzeMessage(message);
    
    if (!analysis.isBusinessRelated) {
      return {
        validation,
        analysis,
        shouldProcess: false,
        rejectionReason: 'business-restriction'
      };
    }
    
    return {
      validation,
      analysis,
      shouldProcess: true
    };
  }
}