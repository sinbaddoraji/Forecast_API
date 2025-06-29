import type { UserManagerSettings } from 'oidc-client-ts';

export const userManagerSettings: UserManagerSettings = {
    authority: import.meta.env.VITE_ZITADEL_AUTHORITY || 'https://your-zitadel-instance.com', 
    client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID || 'your-client-id', 
    redirect_uri: `${window.location.origin}/callback`,
    post_logout_redirect_uri: `${window.location.origin}/logout`,
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true,
    loadUserInfo: true,
};
