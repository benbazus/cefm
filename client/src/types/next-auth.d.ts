

import type { UserRole, User } from "@prisma/client";




interface User extends User {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  avatarUrl?: string
}

declare module "next-auth" {
  interface JWT {
    role: UserRole;
    isTwoFactorEnabled: boolean;
    isOAuth: boolean;
  }

  interface Session {
    user: User & Session["user"];
  }
}
