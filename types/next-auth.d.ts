// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      userType: string;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    firstName: string;
    lastName: string;
    userType: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    userType: string;
    accessToken: string;
  }
}
