// Les routes d'administration du backend exigent la session NextAuth (cookie).
// En prod le site et l'API partagent le domaine ; en local ils sont sur deux
// ports différents, d'où `credentials: 'include'` pour envoyer le cookie.
export function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  return fetch(input, { credentials: 'include', ...init });
}
