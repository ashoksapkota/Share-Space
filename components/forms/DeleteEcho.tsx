"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { deleteEcho } from "@/lib/actions/echo.actions";

interface Props {
  echoId: string;
  currentUserId: string;
  authorId: string;
  parentId: string | null;
  isComment?: boolean;
}

function DeleteEcho({
  echoId,
  currentUserId,
  authorId,
  parentId,
  isComment,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  if (currentUserId !== authorId) return null;

  const handleClick = async () => {
    await deleteEcho(JSON.parse(echoId), pathname);
    if (!parentId || !isComment) {
      router.push("/");
    }
  };
  return (
    <Image
      src="/assets/delete.svg"
      alt="delte"
      width={18}
      height={18}
      className="cursor-pointer object-contain"
      onClick={handleClick}
    />
  );
}

export default DeleteEcho;
