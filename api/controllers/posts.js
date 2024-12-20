const Post = require("../models/post");
const Comment = require("../models/comment");
const { generateToken } = require("../lib/token");
const Like = require("../models/like");

async function getAllPosts(req, res) {
  // const posts = await Post.find().sort({createdAt: - 1}).populate('user_id', 'profilePicture username')
  const posts = await Post.find().sort({createdAt: - 1}).populate('user_id', 'profilePicture username').populate({
    path: "comments", // populate post with all comments 
    options: { sort: { createdAt: -1 } },
    populate: [{
      path: "userId", // Populate users in each comment
      select: "profilePicture username", // Select only profilePicture and username fields for users
    },
    {
      path: 'likes', // Populate likes within comments
      select: 'username userId',
      model: 'User'
    }
  ]
  })
  .populate({
    path: 'likes',
    select: 'username',
    model: 'User'
  })

  const token = generateToken(req.user_id);
  res.status(200).json({ posts: posts, token: token });
}

async function createPost(req, res) {
  const post = new Post(req.body);
  await post.save();
  const newToken = generateToken(req.user_id);
  await post.populate('user_id', 'profilePicture username')

  res.status(201).json({ post: post, token: newToken });
}

async function updatePost(req, res){ 
  const {id} = req.params;
  const post = await Post.findByIdAndUpdate(id, {$set: {...req.body, isEdited: true}}, {new: true})
    .populate('user_id', 'profilePicture username')
    .populate({
      path: "comments", // populate post with all comments 
      options: { sort: { createdAt: -1 } },
      populate: [{
        path: "userId", // Populate users in each comment
        select: "profilePicture username", // Select only profilePicture and username fields for users
    },
    {
      path: 'likes', // Populate likes within comments
      select: 'username userId',
      model: 'User'
    }
  ]
  })
  .populate({
    path: 'likes',
    select: 'username userId',
    model: 'User'
  })

  const newToken = generateToken(req.user_id);
  res.status(202).json({post: post, token: newToken});
}

async function deletePost(req, res){
  const { id }  = req.params;
  const post = await Post.findById(id);
  post.comments.forEach(async (comment) => {
    await Comment.findByIdAndDelete(comment)
  })
  await Like.deleteMany({ entityId: id})
  const postToDelete = await Post.findByIdAndRemove(id);
  const newToken = generateToken(req.user_id);
  res.status(202).json({post: postToDelete, token: newToken});
}

async function getUserPosts(req, res){
  const {id} = req.params
  try{
    const posts = await Post.find({ user_id: id}).sort({createdAt: -1}).populate('user_id', 'profilePicture username')
    .populate({
      path: "comments", // populate post with all comments 
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "userId", // Populate users in each comment
        select: "profilePicture username", // Select only profilePicture and username fields for users
      }
    })
    .populate({
      path: 'likes',
      select: 'username userId',
      model: 'User'
    })
    const newToken = generateToken(req.user);
    res.status(200).json({posts: posts, token: newToken, });
  } catch (error) {
    res.status(500).json({message: "Error fetching post", error: error.message})
  }
}

const PostsController = {
  getAllPosts: getAllPosts,
  createPost: createPost,
  updatePost: updatePost,
  deletePost: deletePost,
  getUserPosts: getUserPosts,
};

module.exports = PostsController;
