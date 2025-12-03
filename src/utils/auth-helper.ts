import { me } from "@framework/auth/use-login";

export const handleLoginSuccess = async (
  data: any,
  authLogin: Function,
  authorize: Function
) => {
  const loginData = data.data;
  const { context } = loginData;
  
  if (context && context !== 'client') {
    throw new Error(`Invalid token context: ${context}. Expected: client`);
  }
  if (loginData.user && loginData.roles) {
    authLogin(loginData);
    authorize(loginData.user);
  } else {
    const user = await me();
    authLogin(user);
    authorize(user.user || user);
  }
};
