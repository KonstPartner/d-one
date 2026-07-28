import {
  GOOGLE_AUTH_AFTER_REDIRECT_ROUTE,
  GOOGLE_AUTH_REDIRECT_PATH,
} from '@features/auth/model';

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
    return GOOGLE_AUTH_AFTER_REDIRECT_ROUTE;
  }

  return path;
};
