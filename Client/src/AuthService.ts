import { UserManager, User } from 'oidc-client-ts';
import { userManagerSettings } from './authConfig';

export const userManager = new UserManager(userManagerSettings);

export const AuthService = {
  getUser: async (): Promise<User | null> => {
    return userManager.getUser();
  },

  signinRedirect: (provider?: string): Promise<void> => {
    if (provider) {
      return userManager.signinRedirect({ extraQueryParams: { acr_values: `urn:zitadel:oidc:idp:${provider}` } });
    } else {
      return userManager.signinRedirect();
    }
  },

  signoutRedirect: (): Promise<void> => {
    return userManager.signoutRedirect();
  },

  signinRedirectCallback: (): Promise<User> => {
    return userManager.signinRedirectCallback();
  },

  signoutRedirectCallback: (): Promise<void> => {
    return userManager.signoutRedirectCallback();
  },

  getAccessToken: async (): Promise<string | undefined> => {
    const user = await userManager.getUser();
    return user?.access_token;
  },
};
