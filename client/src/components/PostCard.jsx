import React, { useState } from 'react'
import { BadgeCheck, Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react'
import moment from 'moment'
import { dummyUserData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Comments from './Comments'

const PostCard = ({post}) => {

  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.content || '');
  const [localContent, setLocalContent] = useState(post.content || '');
  const [comments, setComments] = useState(post.comments || []); //State for comments
  const [newComment, setNewComment] = useState(''); // State for new comment input
  const postWithHashtags = (localContent || '').replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>')
  const [likes, setLikes] = useState(post.likes_count || [])
  const currentUser = useSelector((state)=> state.user.value)

  const handleCommentAdd = (comment) => {
    setComments(prev => [...prev, comment])
  }

  const { getToken } = useAuth()

  const handleDelete = async (postId) => {
    try {
      const { data } = await api.delete(`/api/post/${postId}`, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })
      if(data.success){
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleSaveEdit = async () => {
    try {
      const token = await getToken()
      const { data } = await api.put(`/api/post/${post._id}`,
        { content: editText },
        { headers: { Authorization: `Bearer ${token}` }}
      )

      if(data.success) {
        setLocalContent(editText)
        setIsEditing(false)
        toast.success('Post updated')
        //window.location.reload()  // Reload the page to see the changes
      } else {
        toast.error(data.message || 'Updated failed')
      }
    } catch (error) {
      toast.error(error.message)
      console.log('bwahahaha')
    }
  }

  const handleCancelEdit = () => {
    setEditText(localContent)
    setIsEditing(false)
  }

  const handleLike = async () => {
    try {
      const { data } = await api.post('/api/post/like', {postId: post._id}, {headers: {Authorization: `Bearer ${await getToken()}`}})

      if (data.success){
        toast.success(data.message)
        setLikes(prev => {
          if(prev.includes(currentUser._id)){
            return prev.filter(id => id !== currentUser._id)
          }else{
              return [...prev, currentUser._id]
          }
        })
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleAddComment = async () => {
    if(!newComment.trim()) return;  // Prevent empty comments
    try {
      const token = await getToken()
      const { data } = await api.post(`/api/post/${post._id}/comment`, { content: newComment }, { headers: { Authorization: `Bearer ${token}`}});

      if(data.success){
        setComments([...comments, data.comment]); // Assuming the response returns the new comment
        setNewComment(''); // Clear input
        toast.success('Comment added');
      } else {
        toast.error(data.message || 'Failed to add comment');
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const navigate = useNavigate()

  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl relative'>
      {/* User Info */}
      <div onClick={() => navigate('/profile/' + post.user._id)} className='inline-flex items-center gap-3 cursor-pointer'>
          <img src={post.user.profile_picture} alt="" className='w-10 h-10 rounded-full shadow'/>
          <div>
              <div className='flex items-center space-x-1'>
                <span>{post.user.full_name}</span>
                <BadgeCheck className='w-4 h-4 text-blue-500'/>
              </div>
              <div className='text-gray-500 text-sm'>@{post.user.username} . {moment(post.createdAt).fromNow()}</div>
          </div>
      </div>
      {/* Edit or Delete post */}
      <div className="absolute top-5 right-4">
        <MoreVertical className="w-5 h-5 cursor-pointer text-gray-600" onClick={() => setMenuOpen(!menuOpen)}/>
        {/* DROPDOWN MENU */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white shadow-md rounded-md border z-10">

            {/* If current user is the owner */}
            {post.user._id === currentUser._id ? (
              <>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => {
                  setMenuOpen(false); setIsEditing(true);
                }}>Edit Post</button>
                <button className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50" onClick={() => {
                  handleDelete(post._id)}}>Delete Post</button>
              </>
            ) : (
                  <>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setMenuOpen(false)
                        console.log("Report Post")
                      }}>
                      🚩 Report Post
                    </button>
                  </>
                )}

            </div>
          )}
      </div>

      {/* Content / Edit UI */}
      {isEditing ? (
        <div className='space-y-2'>
          <textarea className='w-full resize-none min-h-[96px] p-2 border rounded-md text-sm' value={editText} onChange={(e) => setEditText(e.target.value)}/>
            <div className='flex gap-2'>
              <button onClick={handleSaveEdit} className='px-4 py-2 bg-indigo-600 text-white rounded'>Save</button>
              <button onClick={handleCancelEdit} className='px-4 py-2 border rounded'>Cancel</button>
            </div>
        </div>
      ) : (
        post.content && <div className='text-gray-800 text-sm whitespace-pre-line' dangerouslySetInnerHTML={{__html: postWithHashtags}}/>
      )}
      {/* Content
      {post.content && <div className='text-gray-800 text-sm whitespace-pre-line' dangerouslySetInnerHTML={{__html: postWithHashtags}}/>} */}

      {/* Images */}
      {/* <div className='grid grid-cols-2 gap-2'>
        {post.image_urls.map((img, index) => (
          <img src={img} key={index} className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && 'col-span-2 h-auto'}`} alt='' />
        ))}
        </div> */}

      {/* Media (Images / Videos) */}
<div className='grid grid-cols-2 gap-2'>
  {/* New Cloudinary posts */}
  {post.media
    ? post.media.map((m, index) =>
        m.type === 'image' ? (
          <img
            key={index}
            src={m.url}
            alt='post'
            className={`w-full h-48 object-cover rounded-lg ${
              post.media.length === 1 && 'col-span-2 h-auto'
            }`}
          />
        ) : (
          <video
            key={index}
            controls
            className={`w-full h-48 rounded-lg ${
              post.media.length === 1 && 'col-span-2 h-auto'
            }`}
          >
            <source src={m.url} />
          </video>
        )
      )
    : /* OLD ImageKit posts fallback */
      post.image_urls?.map((img, index) => (
        <img
          key={index}
          src={img}
          alt='post'
          className={`w-full h-48 object-cover rounded-lg ${
            post.image_urls.length === 1 && 'col-span-2 h-auto'
          }`}
        />
      ))}
</div>


        {/* Actions */}
        <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300'>
          <div className='flex items-center gap-1'>
            <Heart className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`} onClick={handleLike}/>
            <span>{likes.length}</span>
          </div>
          <div className='flex items-center gap-1 cursor-pointer' onClick={() => setShowCommentsModal(true)}>
            <MessageCircle className='w-4 h-4'/>
            <span>{comments.length}</span>
          </div>
          <div className='flex items-center gap-1'>
            <Share2 className='w-4 h-4 cursor-pointer'/>
            <span>{7}</span>
          </div>
        </div>

        {/* Comments Modal Component */}
        <Comments postId={post._id} postOwnerId={post.user._id} comments={comments} onClose={() => setShowCommentsModal(false)} isOpen={showCommentsModal} onCommentAdded={(c) => setComments([...comments, c])} />
    </div>
  )
}

export default PostCard




// import React, { useState } from 'react'
// import { BadgeCheck, Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react'
// import moment from 'moment'
// import { useNavigate } from 'react-router-dom'
// import { useSelector } from 'react-redux'
// import { useAuth } from '@clerk/clerk-react'
// import api from '../api/axios'
// import toast from 'react-hot-toast'

// const PostCard = ({ post }) => {

//   const navigate = useNavigate()
//   const currentUser = useSelector((state) => state.user.value)
//   const { getToken } = useAuth()

//   const [menuOpen, setMenuOpen] = useState(false)
//   const [isEditing, setIsEditing] = useState(false)
//   const [localContent, setLocalContent] = useState(post.content || '')
//   const [editText, setEditText] = useState(post.content || '')

//   const [likes, setLikes] = useState(post.likes_count)
//   const [comments, setComments] = useState(post.comments || [])
//   const [newComment, setNewComment] = useState('')

//   const postWithHashtags = localContent.replace(
//     /(#\w+)/g,
//     '<span class="text-indigo-600">$1</span>'
//   )

//   // -------------------------
//   // DELETE POST
//   // -------------------------
//   const handleDelete = async (postId) => {
//     try {
//       const token = await getToken()
//       const { data } = await api.delete(`/api/post/${postId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       })

//       if (data.success) {
//         toast.success("Post deleted")
//         window.location.reload()
//       } else {
//         toast.error(data.message)
//       }
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   // -------------------------
//   // SAVE EDIT
//   // -------------------------
//   const handleSaveEdit = async () => {
//     try {
//       const token = await getToken()
//       const { data } = await api.put(
//         `/api/post/${post._id}`,
//         { content: editText },
//         { headers: { Authorization: `Bearer ${token}` } }
//       )

//       if (data.success) {
//         setLocalContent(editText)
//         setIsEditing(false)
//         toast.success('Post updated')
//         window.location.reload()
//       } else {
//         toast.error(data.message)
//       }
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   // Cancel Edit
//   const handleCancelEdit = () => {
//     setEditText(localContent)
//     setIsEditing(false)
//   }

//   // -------------------------
//   // LIKE POST
//   // -------------------------
//   const handleLike = async () => {
//     try {
//       const token = await getToken()
//       const { data } = await api.post(
//         `/api/post/like`,
//         { postId: post._id },
//         { headers: { Authorization: `Bearer ${token}` } }
//       )

//       if (data.success) {
//         setLikes((prev) => {
//           if (prev.includes(currentUser._id)) {
//             return prev.filter((id) => id !== currentUser._id)
//           } else {
//             return [...prev, currentUser._id]
//           }
//         })
//       } else {
//         toast.error(data.message)
//       }
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   // -------------------------
//   // ADD COMMENT
//   // -------------------------
//   const handleAddComment = async () => {
//     if (!newComment.trim()) return

//     try {
//       const token = await getToken()
//       const { data } = await api.post(
//         `/api/post/${post._id}/comment`,
//         { content: newComment },
//         { headers: { Authorization: `Bearer ${token}` } }
//       )

//       if (data.success) {
//         setComments([...comments, data.comment])
//         setNewComment('')
//         toast.success("Comment added")
//       } else {
//         toast.error(data.message)
//       }
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   // -------------------------
//   // RETURN JSX
//   // -------------------------
//   return (
//     <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl relative'>

//       {/* USER INFO + 3 DOT MENU */}
//       <div className='flex justify-between items-start'>
//         <div onClick={() => navigate('/profile/' + post.user._id)} className='inline-flex items-center gap-3 cursor-pointer'>
//           <img src={post.user.profile_picture} alt="" className='w-10 h-10 rounded-full shadow' />
//           <div>
//             <div className='flex items-center space-x-1'>
//               <span>{post.user.full_name}</span>
//               <BadgeCheck className='w-4 h-4 text-blue-500' />
//             </div>
//             <div className='text-gray-500 text-sm'>
//               @{post.user.username} · {moment(post.createdAt).fromNow()}
//             </div>
//           </div>
//         </div>

//         {/* THREE DOTS MENU */}
//         <div className="relative">
//           <MoreVertical
//             className="w-5 h-5 cursor-pointer text-gray-600"
//             onClick={() => setMenuOpen(!menuOpen)}
//           />

//           {menuOpen && (
//             <div className="absolute right-0 mt-2 w-36 bg-white shadow-md rounded-md border z-10">
//               {post.user._id === currentUser._id ? (
//                 <>
//                   <button className="w-full text-left px-3 py-2 hover:bg-gray-100"
//                     onClick={() => { setMenuOpen(false); setIsEditing(true); }}>
//                     ✏️ Edit Post
//                   </button>

//                   <button className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
//                     onClick={() => { setMenuOpen(false); handleDelete(post._id); }}>
//                     🗑️ Delete Post
//                   </button>
//                 </>
//               ) : (
//                 <button className="w-full text-left px-3 py-2 hover:bg-gray-100">🚩 Report Post</button>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* CONTENT (EDIT OR NORMAL) */}
//       {isEditing ? (
//         <div className='space-y-2'>
//           <textarea
//             className='w-full resize-none min-h-[80px] p-2 border rounded-md text-sm'
//             value={editText}
//             onChange={(e) => setEditText(e.target.value)}
//           />
//           <div className='flex gap-2'>
//             <button onClick={handleSaveEdit} className='px-4 py-2 bg-indigo-600 text-white rounded'>Save</button>
//             <button onClick={handleCancelEdit} className='px-4 py-2 border rounded'>Cancel</button>
//           </div>
//         </div>
//       ) : (
//         localContent && (
//           <div
//             className='text-gray-800 text-sm whitespace-pre-line'
//             dangerouslySetInnerHTML={{ __html: postWithHashtags }}
//           />
//         )
//       )}

//       {/* IMAGES */}
//       {post.image_urls.length > 0 && (
//         <div className='grid grid-cols-2 gap-2'>
//           {post.image_urls.map((img, i) => (
//             <img
//               key={i}
//               src={img}
//               alt=""
//               className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && "col-span-2 h-auto"}`}
//             />
//           ))}
//         </div>
//       )}

//       {/* ADD COMMENT */}
//       <div className='flex items-center gap-2'>
//         <input
//           type='text'
//           value={newComment}
//           onChange={(e) => setNewComment(e.target.value)}
//           placeholder='Add a comment...'
//           className='flex-1 p-2 border rounded-md'
//         />
//         <button onClick={handleAddComment} className='px-4 py-2 bg-indigo-600 text-white rounded'>
//           Comment
//         </button>
//       </div>

//       {/* COMMENTS LIST */}
//       <div className='mt-3'>
//         {comments.map((c) => (
//           <div key={c._id} className='border-b py-2 text-sm'>
//             <span className='font-semibold'>{c.user.full_name}</span>: {c.content}
//           </div>
//         ))}
//       </div>

//       {/* ACTIONS (LIKE, COMMENT COUNT, SHARE) */}
//       <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t'>
//         <div className='flex items-center gap-1'>
//           <Heart
//             className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`}
//             onClick={handleLike}
//           />
//           <span>{likes.length}</span>
//         </div>

//         <div className='flex items-center gap-1'>
//           <MessageCircle className='w-4 h-4 cursor-pointer' />
//           <span>{comments.length}</span>
//         </div>

//         <div className='flex items-center gap-1'>
//           <Share2 className='w-4 h-4 cursor-pointer' />
//           <span>7</span>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default PostCard
