import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  echoId: string;
  currentUserId: string;
  authorId: string;
}

const EditEcho = ({ echoId, currentUserId, authorId }: Props) => {
  if (currentUserId !== authorId) return null;

  return (
    <Link href={`/edit-echo/${JSON.parse(echoId)}`}>
      <Image
        src="/assets/edit.svg"
        alt="edit echo"
        width={18}
        height={18}
        className="cursor-pointer object-contain"
      />
    </Link>
  );
};

export default EditEcho;
