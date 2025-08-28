import { verifyWebhook } from '@clerk/astro/webhooks'
import type { APIRoute } from 'astro'
import { userService } from '../../../services/userService'
import type { UserCreatedEvent, UserDeletedEvent, UserUpdatedEvent } from '../../../types/clerk'
import type { User } from '@/types'

export const POST: APIRoute = async ({ request }) => {
  try {
    const evt = await verifyWebhook(request, {
      signingSecret: import.meta.env.CLERK_WEBHOOK_SIGNING_SECRET,
    })

    // Do something with payload
    const { id } = evt.data
    const eventType = evt.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    
    // Para debugging
    console.log('Webhook payload:', evt.data)

    const actions: Record<string, () => Promise<void>> = {
      "user.created": async () => {
        console.log('User created webhook received')
        try {
          // Primero convertimos a unknown y luego al tipo específico para evitar errores de tipado
          const userData = evt.data as unknown as UserCreatedEvent

          // Si queremos ver la estructura completa de los datos de Clerk
          console.log('Full Clerk webhook payload:', JSON.stringify(userData, null, 2))
          
          const result = await userService.createUser(userData)
          console.log('User created successfully:', result)
        } catch (error) {
          console.error('Error creating user:', error)
        }
      },
      "user.deleted": async () => {
        console.log('User deleted webhook received')
        try {
          // Primero convertimos a unknown y luego al tipo específico para evitar errores de tipado
          const userData = evt.data as unknown as UserDeletedEvent
          const apiUserArray = await userService.getUserByProviderId(userData.id) as User[];
          const result = await userService.deleteUser(apiUserArray[0])
          console.log('User deleted successfully:', result)
        } catch (error) {
          console.error('Error deleting user:', error)
        }
      },
      "user.updated": async () => {
        console.log('User updated webhook received')
        try {
          // Primero convertimos a unknown y luego al tipo específico para evitar errores de tipado
          const userData = evt.data as unknown as UserUpdatedEvent
          const result = await userService.updateUser(userData)
          console.log('User updated successfully:', result)
        } catch (error) {
          console.error('Error updating user:', error)
        }
      }
    }

    // Verificamos si existe un manejador para el tipo de evento
    const actionHandler = actions[eventType];
    if (actionHandler) {
      // Ejecutamos el manejador correspondiente
      await actionHandler();
      return new Response('Webhook processed successfully', { status: 200 });
    } else {
      // Si no hay manejador, simplemente registramos que recibimos el evento
      console.log(`No handler for event type: ${eventType}`);
      return new Response('Webhook received but not processed', { status: 200 });
    }
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response('Error processing webhook', { status: 400 });
  }
}