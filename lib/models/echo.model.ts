import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EchoesSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: String,
  },
  reactions: [reactionSchema],
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Echo",
    },
  ],
});

EchoesSchema.virtual("reactionsCount").get(function () {
  return this.reactions.length;
});

EchoesSchema.virtual("repliesCount").get(function () {
  return this.children.length;
});

const Echo = mongoose.models.Echo || mongoose.model("Echo", EchoesSchema);

export default Echo;
