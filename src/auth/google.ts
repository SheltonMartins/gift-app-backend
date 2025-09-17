// src/auth/google.ts
import * as AuthSession from 'expo-auth-session';
import * as Random from 'expo-random';

const CLIENT_ID = 'SEU_CLIENT_ID_DO_GOOGLE';

const REDIRECT_URI = AuthSession.makeRedirectUri({
  // @ts-ignore
  useProxy: true, // já está definido aqui
});

export const signInWithGoogle = async () => {
  const state = Array.from(await Random.getRandomBytesAsync(16))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  const request = new AuthSession.AuthRequest({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    responseType: AuthSession.ResponseType.IdToken,
    scopes: ['profile', 'email'],
    extraParams: { nonce: state },
  });

  // faz a URL de autenticação
  await request.makeAuthUrlAsync(discovery);

  // promptAsync agora sem useProxy
  const result = await request.promptAsync(discovery);

  return result;
};
