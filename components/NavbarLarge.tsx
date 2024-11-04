import React from "react";
import MaxWidthWrapper from "./common/MaxWidthWrapper";
import Link from "next/link";
import NavbarMobile from "./NavbarMobile";
import { LayoutDashboardIcon, Presentation } from "lucide-react";
import { buttonVariants } from "./ui/button";
// import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
// import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";

const NavbarLarge = async () => {
  const user = null;

  return (
    <MaxWidthWrapper className="flex items-center justify-between px-8 py-4 w-full text-gray-900 border-b border-gray-300">
      <div className="flex items-center space-x-8">
        <Link
          href="/"
          className="text-xl font-semibold flex gap-2 items-center"
        >
          <Presentation />
          <span>SlideGen</span>
        </Link>

        <div className="space-x-8 hidden md:flex text-sm">
          <Link href="/generate">Generate</Link>
        </div>
      </div>
      <NavbarMobile user={user} />
      <div className="hidden md:flex space-x-4  items-center">
        {user ? (
          <Link href={"/dashboard"} className={buttonVariants()}>
            Dashboard <LayoutDashboardIcon className="h-6 w-6" />
          </Link>
        ) : (
          <div>
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost" })}
            >
              Login
            </Link>
            <Link  href="/register" className={buttonVariants()}>
              Create Account
            </Link>
          </div>
        )}
      </div>
    </MaxWidthWrapper>
  );
};

export default NavbarLarge;