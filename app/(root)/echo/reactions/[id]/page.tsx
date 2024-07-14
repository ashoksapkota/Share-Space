import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import Comment from "@/components/forms/Comment";
import EchoCard from "@/components/cards/EchoCard";

import { fetchUser } from "@/lib/actions/user.actions";
import {
  fetchEchoById,
  getReactedUsersByEcho,
  isEchoReactedByUser,
} from "@/lib/actions/echo.actions";
import UserCard from "@/components/cards/UserCard";

export const revalidate = 0;

async function page({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const echo = await fetchEchoById(params.id);

  const reactions = await getReactedUsersByEcho(echo._id);

  const reactionState = await isEchoReactedByUser({
    echoId: echo._id,
    userId: userInfo._id,
  });

  return (
    <section className="relative">
      <div>
        <EchoCard
          id={echo._id}
          currentUserId={user.id}
          parentId={echo.parentId}
          content={echo.text}
          author={echo.author}
          community={echo.community}
          createdAt={echo.createdAt}
          comments={echo.children}
          reactions={reactions.users}
          reactState={reactionState}
        />
      </div>

      <div className="mt-7">
        <Comment
          echoId={params.id}
          currentUserImg={user.imageUrl}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className="mt-10">
        <h1 className="head-text mb-10">People who likes</h1>
        {echo.reactionsCount === 0 ? (
          <p className="no-result">No users found</p>
        ) : (
          <>
            {reactions.users.map((reaction: any) => (
              <UserCard
                key={reaction._id}
                id={reaction._id}
                name={reaction.name}
                username={reaction.username}
                imgUrl={reaction.image}
                personType="User"
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

export default page;
