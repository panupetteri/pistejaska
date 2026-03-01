import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import DropdownMenu from "./dropdowns/DropdownMenu";

const logout = () => {
  signOut(getAuth());
};

const navBarLinkClassName =
  "block py-2 px-3 rounded-sm text-sm font-medium uppercase hover:bg-black/10";

const menuIconSvg = (
  <svg
    className="inline-block w-6 h-6 fill-current"
    focusable="false"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"></path>
  </svg>
);

export function NavBar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const openMenu = useCallback(() => setIsDropdownOpen(true), []);
  const closeMenu = useCallback(() => setIsDropdownOpen(false), []);
  const menuOptions = useMemo(
    () => [
      {
        value: "players" as const,
        label: "Players",
        onSelect: () => {
          navigate("/players");
        },
      },
      {
        value: "changelog" as const,
        label: "Changelog",
        onSelect: () => {
          navigate("/whatsnew");
        },
      },
      {
        value: "logout" as const,
        label: "Log out",
        onSelect: () => {
          logout();
        },
      },
    ],
    [navigate]
  );
  return (
    <div>
      <header className="bg-blue-800 h-12 flex flex-row items-center text-white shadow-lg">
        <h1 className="grow px-3 text-left text-xl font-bold cursor-pointer">
          <Link to="/">Pistejaska</Link>
        </h1>
        <div className="flex flex-row items-center grow-0 shrink-0">
          <Link className={navBarLinkClassName} to="/">
            Plays
          </Link>
          <Link className={navBarLinkClassName} to="/new">
            New
          </Link>
          <Link className={navBarLinkClassName} to="/games">
            Games
          </Link>
          <DropdownMenu
            isOpen={isDropdownOpen}
            options={menuOptions}
            onClose={closeMenu}
            onSelect={closeMenu}
          >
            <button
              className={navBarLinkClassName}
              aria-label="More options"
              aria-haspopup
              onClick={openMenu}
            >
              {menuIconSvg}
            </button>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}
