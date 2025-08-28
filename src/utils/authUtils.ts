import type { AstroGlobal } from "astro";
import { userService } from "@/services/userService";

export interface AuthCheckResult {
  isAuthenticated: boolean;
  isAuthorized: boolean;
  user: any | null;
}

/**
 * Verifica si el usuario está autenticado y tiene el rol requerido
 * @param Astro - Objeto global de Astro
 * @param requiredRole - Rol requerido para acceder a la página (por defecto 'ADMIN')
 * @returns Objeto con información de autenticación y autorización
 */
export async function checkUserAuth(
  Astro: AstroGlobal,
  requiredRole: string = "ADMIN"
): Promise<AuthCheckResult> {
  const currentUser = await Astro.locals.currentUser();
  
  if (!currentUser) {
    return { isAuthenticated: false, isAuthorized: false, user: null };
  }
  
  const apiUserArray = await userService.getUserByProviderId(currentUser.id as string);
  
  if (!apiUserArray || apiUserArray.length === 0) {
    return { isAuthenticated: false, isAuthorized: false, user: null };
  }
  
  const apiUser = apiUserArray[0];
  const isAuthorized = apiUser.role === requiredRole;
  
  return {
    isAuthenticated: true,
    isAuthorized,
    user: apiUser
  };
}

/**
 * Verifica autenticación y redirecciona si es necesario
 * @param Astro - Objeto global de Astro
 * @param requiredRole - Rol requerido para acceder a la página
 * @returns Redirección o null si el usuario está autorizado
 */
export async function checkAuthAndRedirect(
  Astro: AstroGlobal,
  requiredRole: string = "ADMIN"
) {
  const { redirectToSignIn } = Astro.locals.auth();
  const { isAuthenticated, isAuthorized, user } = await checkUserAuth(Astro, requiredRole);
  
  const returnBackUrl = isAuthorized ? Astro.request.url : '/';
  
  if (!isAuthenticated) {
    return redirectToSignIn({ returnBackUrl });
  }
  
  if (!isAuthorized) {
    return redirectToSignIn({ returnBackUrl });
  }
  
  return null;
}