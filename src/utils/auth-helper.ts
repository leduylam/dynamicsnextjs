import { me } from "@framework/auth/use-login";

export const handleLoginSuccess = async (
  data: any,
  authLogin: Function,
  authorize: Function
) => {
  const { access_token, refresh_token, expires_in, context } = data.data;
  
  if (context && context !== 'client') {
    throw new Error(`Invalid token context: ${context}. Expected: client`);
  }

  const user = await me();
  authLogin(user, access_token, refresh_token, expires_in);
  authorize(user);
};
