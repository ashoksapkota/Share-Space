"use client";

import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import { addReactToEcho } from "@/lib/actions/echo.actions";

interface Props {
  echoId: string;
  currentUserId: string;
  interactState?: boolean;
  isComment?: boolean;
  parentId?: string | null;
}

const ReactEcho = ({
  echoId,
  currentUserId,
  interactState = false,
  isComment = false,
  parentId = null,
}: Props) => {
  const pathname = usePathname();

  const handleClick = async () => {
    await addReactToEcho({
      echoId,
      userId: currentUserId,
      path: pathname,
    });
  };

  return (
    <Image
      src={`/assets/heart-${interactState ? "filled" : "gray"}.svg`}
      alt="heart"
      width={24}
      height={24}
      className="cursor-pointer object-contain"
      onClick={handleClick}
    />
  );
};

export default ReactEcho;
