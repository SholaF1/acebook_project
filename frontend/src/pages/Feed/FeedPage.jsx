import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPost, getPosts } from "../../services/posts";
import PostContainer from "../../components/PostContainer";
import PostForm from "../../components/PostForm";
import './FeedPage.css'
import { getPayloadFromToken } from "../../services/helperFunctions";
import NavBar from "../Nav/NavBar";


export function FeedPage() {
    const [posts, setPosts] = useState([]);
    const [seePostForm, setSeePostForm] = useState(false)
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const loggedIn = token !== null;
        if (loggedIn) {
            getPosts(token)
            .then((data) => {
                setPosts(data.posts);
                localStorage.setItem("token", data.token);
            })
            .catch((err) => {
                console.error(err);
                navigate("/login");
            });
        }
    }, [navigate]);

    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/login");
        return;
    }

    const submitPost = async (postInfo, dealingWithImages) => {
        const token = localStorage.getItem("token");
        const decodedpayload = getPayloadFromToken(token)
        const imageUrl = await dealingWithImages(decodedpayload.user_id)
        const imageUrlCheck = imageUrl ? imageUrl.secure_url: ''
        const newPost = await createPost(postInfo, imageUrlCheck, decodedpayload.user_id, token)
        setPosts((prev) => [newPost.post, ...prev])
        localStorage.setItem('token', newPost.token)
    }

  return (
    <>
    <NavBar />
      <h2>Feed</h2>
      <div className="feed" role="feed">
        {seePostForm ? 
        <PostForm submitPost={submitPost} setSeePostForm={setSeePostForm}/>
        :
        <button
        onClick={() => setSeePostForm(true)}
        >Create A Post</button>}
        
        {posts.length > 0 && <PostContainer posts={posts} setPosts={setPosts}/>}
      </div>
    </>
  );
}
