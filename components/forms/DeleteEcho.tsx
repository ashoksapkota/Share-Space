"use client";

import { useState } from "react";
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
  const [showConfirm, setShowConfirm] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (currentUserId !== authorId) return null;

  const handleDelete = async () => {
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

  const handleClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    await handleDelete();
  };

  const handleCancel = () => {
    setShowConfirm(false);
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
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-black text-white border border-white p-6 rounded shadow-lg max-w-sm mx-auto">
            <p className="mb-6">Are you sure you want to delete this echo?</p>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleConfirm}
              >
                Confirm
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteEcho;
