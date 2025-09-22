/**
 * Tests básicos para el ChatService
 * Estos tests se pueden ejecutar manualmente para verificar el funcionamiento
 */

import { ChatService, validateMessage, isBusinessRelated, analyzeMessage } from './chatService';

console.log('🧪 Iniciando tests del ChatService...\n');

// Test 1: Validación de mensajes
console.log('📋 Test 1: Validación de mensajes');
console.log('✅ Mensaje válido:', validateMessage('Hola, ¿tienes sellos de Pokemon?'));
console.log('❌ Mensaje muy corto:', validateMessage('a'));
console.log('❌ Mensaje vacío:', validateMessage('   '));
console.log('❌ Mensaje con spam:', validateMessage('aaaaaaaaaaaaaaa'));
console.log('');

// Test 2: Análisis de contenido del negocio
console.log('📋 Test 2: Análisis de contenido del negocio');
console.log('✅ Mensaje de negocio 1:', isBusinessRelated('¿Cuánto cuestan los sellos de Pokemon?'));
console.log('✅ Mensaje de negocio 2:', isBusinessRelated('Hola, me interesa un playmat'));
console.log('✅ Saludo simple:', isBusinessRelated('Hola'));
console.log('❌ Tema prohibido:', isBusinessRelated('Explicame programación en Python'));
console.log('❌ Tema no relacionado:', isBusinessRelated('¿Cómo está el clima hoy?'));
console.log('');

// Test 3: Procesamiento completo
console.log('📋 Test 3: Procesamiento completo con ChatService');

const tests = [
  'Hola, ¿tienes sellos de Pokemon?',
  'Explicame programación',
  'a',
  '¿Cuánto cuesta un playmat personalizado?',
  'Háblame de política'
];

tests.forEach((message, index) => {
  console.log(`\n🔍 Test ${index + 1}: "${message}"`);
  const result = ChatService.processMessage(message);
  console.log('📊 Resultado:', {
    shouldProcess: result.shouldProcess,
    rejectionReason: result.rejectionReason,
    validation: result.validation,
    analysis: result.analysis
  });
});

console.log('\n🎉 Tests completados!');