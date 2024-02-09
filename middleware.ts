import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  userRoutes,
} from "@/routes";

// Not sure if I need this and the auth.config if I don't run it on the edge
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  const redirectTo = (path: string) => Response.redirect(new URL(path, nextUrl));

  const isApiRoute = pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);
  const isUserRoute = userRoutes.includes(pathname);

  if (isPublicRoute || isApiRoute) return;
  // below this isPublicRoute and isApiRoute can only be false

  if (isAuthRoute) {
    if (isLoggedIn) return redirectTo(DEFAULT_LOGIN_REDIRECT);
    return;
  }

  // Redirect non-logged-in users trying to access protected routes
  if (!isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) callbackUrl += nextUrl.search;

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return redirectTo(`/auth/login?callbackUrl=${encodedCallbackUrl}`);
  }

  // Redirect logged-in, non-admin users trying to access restricted admin routes
  if (!isAdmin && !isUserRoute) {
    nextUrl.searchParams.set("error", "Access Denied");
    nextUrl.pathname = "/auth/error";

    return Response.redirect(nextUrl);
  }

  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
