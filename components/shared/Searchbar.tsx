"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";

// Function to sanitize input to remove potentially harmful characters
function sanitizeInput(input: string) {
  return input.replace(/[^\w\s-]/gi, "").trim(); // Removing all special characters except for word characters, spaces, and hyphens
}

interface Props {
  routeType: string;
}

function Searchbar({ routeType }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const sanitizedTerm = sanitizeInput(searchTerm);
      if (sanitizedTerm) {
        router.push(`/${routeType}?q=` + encodeURIComponent(sanitizedTerm));
      } else {
        router.push(`/${routeType}`);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, routeType]);

  return (
    <div className="searchbar">
      <Image
        src="/assets/search-gray.svg"
        alt="search"
        width={24}
        height={24}
        className="object-contain"
      />

      <Input
        id="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={`${
          routeType !== "search" ? "Search Communities" : "Search Users"
        }`}
        className="no-focus searchbar_input"
      />
    </div>
  );
}

export default Searchbar;
