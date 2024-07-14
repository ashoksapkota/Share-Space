import PostEcho from "@/components/forms/PostEcho";
import { fetchEchoById } from "@/lib/actions/echo.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const thread = await fetchEchoById(params.id);

  return (
    <>
      <h1 className="head-text">Edit Echo</h1>

      <PostEcho
        userId={userInfo._id}
        echoId={thread.id}
        echoText={thread.text}
      />
    </>
  );
};

export default Page;
