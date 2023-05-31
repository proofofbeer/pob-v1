import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      passHref
      className={`${
        isActive ? "bg-secondary shadow-md" : ""
      } hover:bg-secondary hover:shadow-md focus:bg-secondary py-1.5 px-3 text-sm rounded-full gap-2`}
    >
      {children}
    </Link>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const developmentEnv = process.env.NEXT_PUBLIC_DEVELOPMENT_ENV;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  const navLinks = (
    <>
      <li>
        <NavLink href="/pob">
          🍺 <span className="ml-1">My POBs</span>
        </NavLink>
      </li>
      <li>
        <NavLink href="/collections">
          🍻<span className="ml-1">My Collections</span>
        </NavLink>
      </li>
    </>
  );

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="md:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              {navLinks}
            </ul>
          )}
        </div>
        <div className="hidden md:flex lg:hidden items-center gap-2 ml-4 mr-6">
          <Link href="/" passHref className="flex items-center relative text-4xl">
            🍻 <span className="font-semibold leading-tight text-lg ml-1">POB</span>
          </Link>
        </div>
        <div className="hidden lg:flex items-center gap-2 ml-4 mr-6">
          <Link href="/" passHref className="flex items-center relative text-4xl">
            🍻 <span className="font-semibold leading-tight text-lg ml-1">Proof of Beer</span>
          </Link>
        </div>
        <ul className="hidden md:flex md:flex-nowrap menu menu-horizontal px-1 gap-2">{navLinks}</ul>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        {developmentEnv === "local" && <FaucetButton />}
      </div>
    </div>
  );
};
