import { redirect } from "next/navigation";

import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { fetchUser, fetchUserPosts } from "@/lib/actions/user.actions";

import EchoCard from "../cards/EchoCard";
import { getReactionsData } from "@/lib/actions/echo.actions";
import { currentUser } from "@clerk/nextjs";

interface Result {
  name: string;
  image: string;
  id: string;
  echoes: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function EchoesTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;

  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  }

  if (!result) {
    redirect("/");
  }

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const reactionsData = await getReactionsData({
    userId: userInfo._id,
    posts: result.echoes,
  });

  const { childrenReactions, childrenReactionState } = reactionsData;

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.echoes.map((echo, idx) => (
        <EchoCard
          key={echo._id}
          id={echo._id}
          currentUserId={currentUserId}
          parentId={echo.parentId}
          content={echo.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: echo.author.name,
                  image: echo.author.image,
                  id: echo.author.id,
                }
          }
          community={
            accountType === "Community"
              ? { name: result.name, id: result.id, image: result.image }
              : echo.community
          }
          createdAt={echo.createdAt}
          comments={echo.children}
          reactions={childrenReactions[idx].users}
          reactState={childrenReactionState[idx]}
        />
      ))}
    </section>
  );
}

export default EchoesTab;