import Post from "./Post"

const PostContainer = ({ posts, setPosts }) => {
    return (
        <div> 
            {
                posts.map(post => {
                    return <Post post={post} setPosts={setPosts} key={post._id}/>
                })
            }
        </div>
    )
}


export default PostContainer