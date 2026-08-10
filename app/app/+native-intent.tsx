import { GOOGLE_AUTH_REDIRECT_PATH } from '@features/google-sign-in';
import { ROUTES } from '@shared/routes';

const isGoogleOAuthRedirect = (path: string) => {
  try {
    const url = new URL(path, 'app:/');

    return (
      url.pathname === `/${GOOGLE_AUTH_REDIRECT_PATH}` ||
      path.includes(GOOGLE_AUTH_REDIRECT_PATH)
    );
  } catch {
    return path.includes(GOOGLE_AUTH_REDIRECT_PATH);
  }
};

export const redirectSystemPath = ({
  path,
}: {
  path: string;
  initial: boolean;
}) => {
  if (isGoogleOAuthRedirect(path)) {
    return ROUTES.authCallback;
  }

  return path;
};
