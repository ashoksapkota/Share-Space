"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

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
    try {
      await deleteEcho(JSON.parse(echoId), pathname);
      toast.success("Echo deleted successfully!");

      if (!parentId || !isComment) {
        router.push("/");
      }
    } catch (error) {
      toast.error("Failed to delete Echo. Please try again.");
    }
  };

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "black",
            color: "white",
            border: "1px solid white",
          },
        }}
      />
      <Image
        src="/assets/delete.svg"
        alt="delete"
        width={18}
        height={18}
        className="cursor-pointer object-contain"
        onClick={handleClick}
      />
    </>
  );
}

export default DeleteEcho;
