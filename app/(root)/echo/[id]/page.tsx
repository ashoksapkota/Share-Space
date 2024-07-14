import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import Comment from "@/components/forms/Comment";
import EchoCard from "@/components/cards/EchoCard";

import { fetchUser } from "@/lib/actions/user.actions";
import {
  fetchEchoById,
  getReactionsData,
} from "@/lib/actions/echo.actions";

async function Page({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const echo = await fetchEchoById(params.id);

  const reactionsData = await getReactionsData({
    userId: userInfo._id,
    posts: echo.children,
    parentId: echo._id,
  });

  const {
    parentReactions,
    parentReactionState,
    childrenReactions,
    childrenReactionState,
  } = reactionsData;

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
          reactions={parentReactions.users}
          reactState={parentReactionState}
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
        {echo.children.map((childItem: any, idx: number) => (
          <EchoCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user.id}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            reactions={childrenReactions[idx].users}
            reactState={childrenReactionState[idx]}
            isComment
          />
        ))}
      </div>
    </section>
  );
}

export default Page;
