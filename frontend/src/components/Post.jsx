import { deletePost } from "../services/posts";

function Post({ post, setPosts }) {
  
  const removePost = async () => {
    const token = localStorage.getItem("token");
    const postToRemove = await deletePost(post._id, token)
    await setPosts((prev) => {
      const newArray = prev.filter(post => {
        return post._id !== postToRemove.post._id
      })
      return [...newArray]
    })
  }
  return (
    <div className="post">
      {post.message}
      <div className="post-btns">
        <button>Update</button>
        <button
        onClick={removePost}
        >Delete</button>
      </div>
    </div>
  )
}

export default Post;
