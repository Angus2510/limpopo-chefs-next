import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/actions/auth/session/validateUser';
import { refreshAccessToken } from '@/lib/actions/auth/session/refreshToken';

interface HandleSessionOptions {
  redirectPath: string;
  fallbackPath?: string;
  requiredPermissions?: string[];
}

export async function handleSession({
  redirectPath,
  fallbackPath,
  requiredPermissions,
}: HandleSessionOptions) {
  const accessToken = cookies().get('accessToken')?.value;
  const refreshToken = cookies().get('refreshToken')?.value;

  let sessionData = null;

  if (accessToken) {
    sessionData = await validateSession(accessToken);
  }

  if (!sessionData?.valid && refreshToken) {
    const refreshResult = await refreshAccessToken(refreshToken);

    if (refreshResult.success) {
      const newAccessToken = refreshResult.newAccessToken;
      // Redirect to client-side page to set the new access token in cookies
      return redirect(
        `/set-cookie?accessToken=${newAccessToken}&redirect=${redirectPath}`
      );
    } else {
      console.error('Failed to refresh access token');
      return redirect(fallbackPath || '/login');
    }
  }

  if (!sessionData?.valid) {
    return redirect(fallbackPath || '/login');
  }

  // Check if the user has the required permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPermissions = sessionData?.session?.permissions || [];
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return redirect('/denied');
    }
  }
  return sessionData;
}
