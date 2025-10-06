import { api } from './api';
import type { APIUser, UserCreatedEvent, UserUpdatedEvent } from '../types/clerk';
import type { User } from '@/types';

const API_ENDPOINT = 'users';

export const userService = {
  /**
   * Busca un usuario específico por su ID
   * @param providerId ID del usuario a buscar
   * @returns El usuario encontrado o null si no existe
   */
  getUserByProviderId: async (providerId: string): Promise<User[] | null> => {
    try {
      const users = await api.get<User[]>(`${API_ENDPOINT}?providerId=${providerId}`, { headers: { 'X-User-Id': 'system-clerk' } });
      return users;
    } catch (error) {
      // Manejar error si el usuario no existe
      return null;
    }
  },

  /**
   * Crea un nuevo usuario en el sistema basado en los datos de Clerk
   * @param userData Datos del usuario recibidos del webhook de Clerk
   * @returns El usuario creado
   */
  createUser: async (userData: UserCreatedEvent): Promise<any> => {
    // Buscar la cuenta externa para determinar el proveedor y providerId
    let provider = "clerk";
    let providerId = userData.id;
    
    // Obtener el primer email disponible
    const primaryEmail = userData.email_addresses && userData.email_addresses.length > 0 
      ? userData.email_addresses[0].email_address 
      : 'default@gmail.com';
    
    // Formar el nombre completo
    const firstName = userData.first_name || '';
    const lastName = userData.last_name || '';
    const name = `${firstName} ${lastName}`.trim();
    
    // Crear el objeto de usuario con la estructura que espera la API
    const apiUser: APIUser = {
      provider: provider,
      providerId: providerId,
      email: primaryEmail,
      name: name,
      avatarUrl: userData.profile_image_url || userData.image_url || '',
      role: "USER", // Valor predeterminado
      status: "ACTIVE" // Valor predeterminado
    };
    
    return await api.post(API_ENDPOINT, apiUser, { 'X-User-Id': 'system-clerk' });
  },

  /**
   * Actualiza un usuario existente en el sistema
   * @param userData Datos del usuario recibidos del webhook de Clerk
   * @returns El usuario actualizado
   */
  updateUser: async (userData: UserUpdatedEvent): Promise<any> => {
    const apiUserArray = await userService.getUserByProviderId(userData.id) as User[];
    // Determinar qué email es el primario
    const primaryEmailId = userData.primary_email_address_id;
    
    const user: User = {
      provider: 'clerk',
      providerId: userData.id,
      email: userData.email_addresses?.find(email => email.id === primaryEmailId)?.email_address || (userData.email_addresses && userData.email_addresses.length > 0 ? userData.email_addresses[0].email_address : 'default@gmail.com'),
      name: `${userData.first_name} ${userData.last_name}`,
      avatarUrl: userData.image_url as string,
      role: 'USER',
      status: 'ACTIVE'
    };

    return await api.put<User>(`${API_ENDPOINT}/${apiUserArray[0].id}`, user, { 'X-User-Id': 'system-clerk' });
  },

  /**
   * Elimina un usuario del sistema
   * @param userData Datos del usuario recibidos del webhook de Clerk
   * @returns true si el usuario fue eliminado correctamente
   */
  deleteUser: async (userData: User): Promise<boolean> => {
    return await api.delete(`${API_ENDPOINT}/${userData.id}`, { 'X-User-Id': 'system-clerk' });
  }
}
