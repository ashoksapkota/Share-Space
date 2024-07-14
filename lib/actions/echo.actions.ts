"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Echo from "../models/echo.model";
import Community from "../models/community.model";
import { fetchUsers, getUserFollowersIds } from "./user.actions";


export async function isEchoReactedByUser({
  echoId,
  userId,
}: {
  echoId: string;
  userId: string;
}) {
  try {
    connectToDB();

    const echo = await Echo.findOne({ _id: echoId });

    const isReacted: any = echo.reactions.some((reaction: any) =>
      reaction.user.equals(userId)
    );

    return !!isReacted;
  } catch (error: any) {
    throw new Error(
      `Failed to check if echo is reacted by user: ${error.message}`
    );
  }
}
export async function getReactedUsersByEcho(echoId: string) {
  try {
    connectToDB();

    const echo = await Echo.findOne({ _id: echoId });

    const reactedUsersIds = echo.reactions.map(
      (reaction: any) => reaction.user
    );

    const reactedUsers = await fetchUsers({
      userId: "INVALID_USER_ID",
      userIds: reactedUsersIds,
    });

    return reactedUsers;
  } catch (error: any) {
    throw new Error(`Failed to get reacted users: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    // Calculate the number of posts to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a query to fetch the posts that have no parent (top-level echoes) (an echo that is not a comment/reply).
    const postsQuery = Echo.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: "author",
        model: User,
      })
      .populate({
        path: "community",
        model: Community,
      })
      .populate({
        path: "children", // Populate the children field
        populate: {
          path: "author", // Populate the author field within children
          model: User,
          select: "_id name parentId image", // Select only _id and username fields of the author
        },
      });

    // Count the total number of top-level posts (echoes) i.e., echoes that are not comments.
    const totalPostsCount = await Echo.countDocuments({
      parentId: { $in: [null, undefined] },
    }); // Get the total count of posts

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
  } catch (error: any) {
    throw new Error(`Error fetching echoes: ${error.message}`);
  }
}

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function editEcho({
  echoId,
  text,
  path,
}: {
  echoId: string;
  text: string;
  path: string;
}) {
  try {
    connectToDB();

    const echo = await Echo.findById(echoId);

    if (!echo) {
      throw new Error("Echo not found");
    }

    echo.text = text;

    await echo.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to edit echo: ${error.message}`);
  }
}
export async function createEcho({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdEcho = await Echo.create({
      text,
      author,
      community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { echoes: createdEcho._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { echoes: createdEcho._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create echo: ${error.message}`);
  }
}

async function fetchAllChildEchoes(echoId: string): Promise<any[]> {
  const childEchoes = await Echo.find({ parentId: echoId });

  const descendantEchoes = [];
  for (const childEcho of childEchoes) {
    const descendants = await fetchAllChildEchoes(childEcho._id);
    descendantEchoes.push(childEcho, ...descendants);
  }

  return descendantEchoes;
}

export async function deleteEcho(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the echo to be deleted (the main echo)
    const mainEcho = await Echo.findById(id).populate("author community");

    if (!mainEcho) {
      throw new Error("Echo not found");
    }

    // Fetch all child echoes and their descendants recursively
    const descendantEchoes = await fetchAllChildEchoes(id);

    // Get all descendant echo IDs including the main echo ID and child echo IDs
    const descendantEchoIds = [
      id,
      ...descendantEchoes.map((echo) => echo._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantEchoes.map((echo) => echo.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainEcho.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantEchoes.map((echo) => echo.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainEcho.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child echoes and their descendants
    await Echo.deleteMany({ _id: { $in: descendantEchoIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { echoes: { $in: descendantEchoIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { echoes: { $in: descendantEchoIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete echo: ${error.message}`);
  }
}

export async function fetchEchoById(echoId: string) {
  connectToDB();

  try {
    const echo = await Echo.findById(echoId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Echo, // The model of the nested children (assuming it's the same "Echo" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return echo;
  } catch (err) {
    console.error("Error while fetching echo:", err);
    throw new Error("Unable to fetch echo");
  }
}

export async function addReactToEcho({
  echoId,
  userId,
  path,
}: {
  echoId: string;
  userId: string;
  path: string;
}) {
  try {
    connectToDB();

    const echo = await Echo.findById(echoId);
    const user = await User.findOne({ id: userId });

    if (!echo) {
      throw new Error("Echo not found");
    }

    const isAlreadyReacted = await isEchoReactedByUser({
      echoId: echo._id,
      userId: user._id,
    });

    if (isAlreadyReacted) {
      echo.reactions.pull({
        user: user._id,
      });
    } else {
      echo.reactions.push({
        user: user._id,
      });
    }

    await echo.save();

    if (isAlreadyReacted) {
      user.reactions.pull({
        echo: echo._id,
      });
    } else {
      user.reactions.push({
        echo: echo._id,
      });
    }

    await user.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to add reaction to echo: ${error.message}`);
  }
}

export async function addCommentToEcho({
  echoId,
  commentText,
  userId,
  path,
}: {
  echoId: string;
  commentText: string;
  userId: string;
  path: string;
}) {
  connectToDB();

  try {
    // Find the original echo by its ID
    const originalEcho = await Echo.findById(echoId);

    if (!originalEcho) {
      throw new Error("Echo not found");
    }

    // Create the new comment echo
    const commentEcho = new Echo({
      text: commentText,
      author: userId,
      parentId: echoId, // Set the parentId to the original echo's ID
    });

    // Save the comment echo to the database
    const savedCommentEcho = await commentEcho.save();

    // Add the comment echo's ID to the original echo's children array
    originalEcho.children.push(savedCommentEcho._id);

    // Save the updated original echo to the database
    await originalEcho.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}

export async function fetchPostReactions({ echoId }: { echoId: string }) {
  try {
    connectToDB();

    const echo = await Echo.findOne({ id: echoId });

    if (!echo) {
      throw new Error("Echo not found");
    }

    const reactionsUsersIds = echo.reactions.map(
      (reaction: any) => reaction.user
    );

    const reactions = await User.find({
      _id: { $in: reactionsUsersIds },
    }).select("_id id name image username");

    return reactions;
  } catch (error: any) {
    throw new Error(`Failed to fetch post reactions: ${error.message}`);
  }
}

export async function getReactionsData({
  userId,
  posts,
  parentId = "",
}: {
  userId: string;
  posts: any[];
  parentId?: string;
}) {
  try {
    connectToDB();

    const [parentReactions, parentReactionState, childrenData] =
      await Promise.all([
        (parentId && getReactedUsersByEcho(parentId)) || { users: [], isNext: false },
        (parentId &&
          isEchoReactedByUser({
            echoId: parentId,
            userId,
          })) ||
          false,
        Promise.all(
          posts.map(async (post) => {
            const reactedUsers = await getReactedUsersByEcho(post._id);
            const reactedByUser = await isEchoReactedByUser({
              echoId: post._id,
              userId,
            });
            return { reactedUsers, reactedByUser };
          })
        ),
      ]);

    const childrenReactions = childrenData.map(
      (data: any) => data.reactedUsers
    );
    const childrenReactionState = childrenData.map(
      (data: any) => data.reactedByUser
    );

    return {
      parentReactions,
      parentReactionState,
      childrenReactions,
      childrenReactionState,
    };
  } catch (error: any) {
    throw new Error(`Failed to get reactions data: ${error.message}`);
  }
}
