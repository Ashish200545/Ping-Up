// import React, { useState, useEffect } from 'react'
// import { X } from 'lucide-react'
// import moment from 'moment'
// import { useAuth } from '@clerk/clerk-react'
// import { useSelector } from 'react-redux'
// import api from '../api/axios'
// import toast from 'react-hot-toast'

// const Comments = ({ postId, comments: initialComments, onClose, isOpen, onCommentAdded }) => {
//   const [comments, setComments] = useState(initialComments || [])
//   const [newComment, setNewComment] = useState('')
//   const [loading, setLoading] = useState(false)

//   const currentUser = useSelector((state) => state.user.value)
//   const { getToken } = useAuth()

//   // Sync parent comment updates with modal
//   useEffect(() => {
//     setComments(initialComments)
//   }, [initialComments])

//   // Generates an initials avatar (no image required)
//   const generateInitialAvatar = (name) => {
//     if (!name) return "U"
//     const split = name.split(" ")
//     const initials = split[0][0] + (split[1]?.[0] || "")
//     return initials.toUpperCase()
//   }

//   const handleAddComment = async () => {
//     if (!newComment.trim()) return
    
//     setLoading(true)
//     try {
//       const token = await getToken()
//       const { data } = await api.post(
//         `/api/post/${postId}/comment`,
//         { content: newComment },
//         { headers: { Authorization: `Bearer ${token}` } }
//       )

//       if (data.success) {
//         setComments([...comments, data.comment])
//         setNewComment('')
//         toast.success('Comment added')
//         // Notify parent so it can update its comments state/count
//         if (typeof onCommentAdded === 'function') onCommentAdded(data.comment)
//       } else {
//         toast.error(data.message || 'Failed to add comment')
//       }
//     } catch (error) {
//       toast.error(error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!isOpen) return null

//   return (
//     <div className='fixed inset-0 bg-black/50 z-40' onClick={onClose}>
//       <div 
//         className='absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden flex flex-col animate-slide-up z-50' 
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className='flex justify-between items-center p-4 border-b sticky top-0 bg-white'>
//           <h3 className='text-lg font-semibold'>Comments</h3>
//           <X className='w-5 h-5 cursor-pointer hover:text-gray-600' onClick={onClose} />
//         </div>

//         {/* Comments List */}
//         <div className='flex-1 overflow-y-auto p-4 space-y-3'>
//           {comments.length === 0 ? (
//             <p className='text-gray-500 text-center py-8'>No comments yet. Be the first to comment!</p>
//           ) : (
//             comments.map((comment) => (
//               <div key={comment._id} className='flex gap-3'>
                
//                 {/* Avatar — safe fallback */}
//                 {comment.user?.profile_picture ? (
//                   <img
//                     src={comment.user.profile_picture}
//                     alt={comment.user.username}
//                     className='w-8 h-8 rounded-full object-cover flex-shrink-0'
//                   />
//                 ) : (
//                   <div className='w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold'>
//                     {generateInitialAvatar(comment.user?.full_name)}
//                   </div>
//                 )}

//                 <div className='flex-1'>
//                   <div className='bg-gray-100 rounded-lg p-3'>
//                     <p className='font-semibold text-sm'>{comment.user?.full_name}</p>
//                     <p className='text-sm text-gray-800 break-words'>{comment.content}</p>
//                   </div>
//                   <p className='text-xs text-gray-500 mt-1 ml-2'>
//                     {moment(comment.createdAt).fromNow()}
//                   </p>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* Add Comment Input */}
//         <div className='border-t p-4 flex items-center gap-2 sticky bottom-0 bg-white'>
          
//           {/* Current user avatar fallback */}
//           {currentUser?.profile_picture ? (
//             <img 
//               src={currentUser.profile_picture}
//               alt={currentUser.username}
//               className='w-8 h-8 rounded-full object-cover flex-shrink-0' 
//             />
//           ) : (
//             <div className='w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold'>
//               {generateInitialAvatar(currentUser.full_name)}
//             </div>
//           )}

//           <input
//             type='text'
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//             onKeyPress={(e) => { if (e.key === 'Enter' && !loading) handleAddComment() }}
//             placeholder='Add a comment...'
//             disabled={loading}
//             className='flex-1 p-2 border rounded-full text-sm outline-none focus:border-indigo-600'
//           />

//           <button 
//             onClick={handleAddComment} 
//             disabled={loading || !newComment.trim()}
//             className='px-4 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition'
//           >
//             {loading ? '...' : 'Post'}
//           </button>
//         </div>
//       </div>

//       {/* FIXED STYLE (NO jsx) */}
//       <style>{`
//         @keyframes slide-up {
//           from { transform: translateY(100%); }
//           to { transform: translateY(0); }
//         }
//         .animate-slide-up {
//           animation: slide-up 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   )
// }

// export default Comments


// import React, { useState, useEffect } from "react";
// import { X, Heart, MessageCircle, Trash2 } from "lucide-react";
// import moment from "moment";
// import { useAuth } from "@clerk/clerk-react";
// import { useSelector } from "react-redux";
// import api from "../api/axios";
// import toast from "react-hot-toast";

// const Comments = ({ postId, comments: initialComments, isOpen, onClose, onCommentAdded }) => {
//   const [comments, setComments] = useState(initialComments || []);
//   const [newComment, setNewComment] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { getToken } = useAuth();
//   const currentUser = useSelector((state) => state.user.value);

//   // Sync when parent updates
//   useEffect(() => {
//     setComments(initialComments);
//   }, [initialComments]);

//   const [replyOpen, setReplyOpen] = useState(false);
//   const [replyContent, setReplyContent] = useState("");

//   const generateInitialAvatar = (name) => {
//     if (!name) return "U";
//     const parts = name.split(" ");
//     return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
//   };

//   //  Add Comment
//   const handleAddComment = async () => {
//     if (!newComment.trim()) return;

//     setLoading(true);
//     try {
//       const token = await getToken();
//       const { data } = await api.post(
//         `/api/post/${postId}/comment`,
//         { content: newComment },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (data.success) {
//         setComments((prev) => [...prev, data.comment]);
//         onCommentAdded && onCommentAdded(data.comment);
//         setNewComment("");
//         toast.success("Comment added");
//       } else toast.error(data.message);
//     } catch (error) {
//       toast.error(error.message);
//     }
//     setLoading(false);
//   };

//   // Like / Unlike comment
//   const toggleLike = async (commentId) => {
//     try {
//       const token = await getToken();
//       const { data } = await api.post(
//         `/api/post/comment/${commentId}/like`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (data.success) {
//         setComments((prev) =>
//           prev.map((c) =>
//             c._id === commentId ? data.comment : c
//           )
//         );
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };


//   // Delete a comment
//   const deleteComment = async (commentId) => {
//     try {
//       const token = await getToken();
//       const { data } = await api.delete(
//         `/api/post/comment/${commentId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (data.success) {
//         setComments(comments.filter((c) => c._id !== commentId));
//         toast.success("Comment deleted");
//       } else toast.error(data.message);
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // Reply to a comment
//   const replyToComment = async (commentId, replyContent, setReplyContent, setReplyOpen) => {
//     try {
//       const token = await getToken();
//       const { data } = await api.post(
//         `/api/post/comment/${commentId}/reply`,
//         { content: replyContent },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (data.success) {
//         setComments((prev) => [...prev, data.comment]);
//         setReplyContent("");
//         setReplyOpen(false);
//         toast.success("Reply added");
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}>
//       <div
//         className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden flex flex-col animate-slide-up z-50"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b">
//           <h3 className="text-lg font-semibold">Comments</h3>
//           <X className="w-5 h-5 cursor-pointer" onClick={onClose} />
//         </div>

//         {/* Comments List */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {comments.length === 0 && (
//             <p className="text-center text-gray-500">No comments yet.</p>
//           )}

//           {comments.map((comment) => {
//             const isOwner = comment.user?.clerkId === currentUser?.clerkId || comment.user === currentUser?._id;
//             const liked = comment.likes?.includes(currentUser._id);

//             return (
//               <div key={comment._id} className="border-b pb-3">
//                 {/* Avatar + Username */}
//                 <div className="flex gap-3">
//                   {/* Avatar */}
//                   {comment.user?.profile_picture ? (
//                     <img
//                       src={comment.user?.profile_picture}
//                       className="w-8 h-8 rounded-full"
//                     />
//                   ) : (
//                     <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
//                       {generateInitialAvatar(comment.user?.full_name || "User")}
//                     </div>
//                   )}

//                   <div className="flex-1">
//                     <p className="font-semibold text-sm">{comment.user?.full_name || "Unknown User"}</p>
//                     <p className="text-gray-800 text-sm break-words">{comment.content}</p>

//                     <p className="text-xs text-gray-500 mt-1">
//                       {moment(comment.createdAt).fromNow()}
//                     </p>

//                     {/* Comment Actions */}
//                     <div className="flex gap-4 text-xs mt-2 text-gray-600">

//                       {/* Like comment */}
//                       <button
//                         className="flex items-center gap-1"
//                         onClick={() => toggleLike(comment._id)}
//                       >
//                         <Heart className={`w-4 h-4 ${liked ? "text-red-500 fill-red-500" : ""}`} />
//                         {comment.likes?.length || 0}
//                       </button>

//                       {/* Reply */}
//                       <button className="flex items-center gap-1" onClick={() => setReplyOpen(!replyOpen)}>
//                         <MessageCircle className="w-4 h-4" /> Reply
//                       </button>

//                       {/* Delete */}
//                       {isOwner && (
//                         <button className="flex items-center gap-1 text-red-600" onClick={() => deleteComment(comment._id)}>
//                           <Trash2 className="w-4 h-4" />
//                           Delete
//                         </button>
//                       )}
//                     </div>

//                     {/* Reply Input */}
//                     {replyOpen && (
//                       <div className="mt-2 flex gap-2">
//                         <input
//                           value={replyContent}
//                           onChange={(e) => setReplyContent(e.target.value)}
//                           placeholder="Reply..."
//                           className="flex-1 p-2 border rounded-md text-sm"
//                         />
//                         <button
//                           className="px-3 bg-indigo-600 text-white rounded-md"
//                           onClick={() =>
//                             replyToComment(comment._id, replyContent, setReplyContent, setReplyOpen)
//                           }
//                         >
//                           Post
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Add a new comment */}
//         <div className="p-4 border-t flex items-center gap-2">
//           <input
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//             placeholder="Add a comment..."
//             className="flex-1 p-2 border rounded-full"
//           />
//           <button
//             onClick={handleAddComment}
//             disabled={loading || !newComment.trim()}
//             className="bg-indigo-600 text-white px-4 py-2 rounded-full"
//           >
//             {loading ? "..." : "Post"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Comments;



import React, { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Trash2 } from "lucide-react";
import moment from "moment";
import { useAuth } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";

const Comments = ({
  postId,
  postOwnerId,
  comments: initialComments,
  isOpen,
  onClose,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();

  // Sync parent updates
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // ⭐ Reply state for individual comments
  const [activeReply, setActiveReply] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  // Avatar fallback
  const generateInitialAvatar = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  };

  // ADD COMMENT
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await api.post(
        `/api/post/${postId}/comment`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setComments((prev) => [...prev, data.comment]);
        onCommentAdded && onCommentAdded(data.comment);
        setNewComment("");
        toast.success("Comment added");
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  // LIKE / UNLIKE COMMENT
  const toggleLike = async (commentId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        `/api/post/comment/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? data.comment : c))
        );
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // DELETE COMMENT
  const deleteComment = async (commentId) => {
    try {
      const token = await getToken();
      const { data } = await api.delete(`/api/post/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setComments((prev) => prev.filter((c) => String(c._id) !== String(commentId)));
        toast.success("Comment deleted");
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // REPLY TO COMMENT
  const replyToComment = async (commentId) => {
    if (!replyContent.trim()) return;

    try {
      const token = await getToken();
      const { data } = await api.post(
        `/api/post/comment/${commentId}/reply`,
        { content: replyContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setComments((prev) => [...prev, data.comment]);
        setReplyContent("");
        setActiveReply(null);
        toast.success("Reply added");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden flex flex-col animate-slide-up z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Comments</h3>
          <X className="w-5 h-5 cursor-pointer" onClick={onClose} />
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 && (
            <p className="text-center text-gray-500">No comments yet.</p>
          )}

          {comments.map((comment) => {
            const displayName = comment.username || comment.user?.full_name || "Unkown User";

            const profilePic = comment.profileImage || comment.user?.profile_picture || null;

            const isOwner =
              String(comment.user) === String(currentUser?.clerkId) ||
              String(postOwnerId) === String(currentUser?.clerkId);

            const liked = comment.likes?.includes(currentUser.clerkId);

            const isReply = !!comment.parentComment;

            return (
              <div key={comment._id} className={`pb-3 ${isReply ? "ml-10 pl-3 border-l-2 border-gray-300" : "border-b"}`}>
                <div className="flex gap-3">
                  {/* Avatar */}
                  {profilePic ? (
                    <img
                      src={profilePic}
                      className={`${isReply ?  "w-6 h-6" : "w-8 h-8"} rounded-full`}
                    />
                  ) : (
                    <div className={`${isReply ? "w-6 h-6" : "w-8 h-8"} rounded-full bg-indigo-600 text-white flex items-center justify-center`}>
                      {generateInitialAvatar(displayName)}
                    </div>
                  )}

                  {/* CONTENT */}
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{displayName}</p>

                    {/* Replying to label */}
                    {/* {isReply && comment.parentComment?.user?.full_name && (
                      <p className="text-xs text-gray-500 italic mb-1">
                        Replying to {comment.parentComment.user.full_name}
                      </p>
                    )} */}
                    {isReply && (
                      <p className="text-xs text-gray-500 italic mb-1">Reply</p>
                    )}
                      
                    <p className="text-gray-800 text-sm break-words">
                      {comment.content}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {moment(comment.createdAt).fromNow()}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-4 text-xs mt-2 text-gray-600">
                      {/* LIKE */}
                      <button
                        className="flex items-center gap-1"
                        onClick={() => toggleLike(comment._id)}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            liked ? "text-red-500 fill-red-500" : ""
                          }`}
                        />
                        {comment.likes?.length || 0}
                      </button>

                      {/* REPLY */}
                      <button
                        className="flex items-center gap-1"
                        onClick={() =>
                          setActiveReply(
                            activeReply === comment._id ? null : comment._id
                          )
                        }
                      >
                        <MessageCircle className="w-4 h-4" /> Reply
                      </button>

                      {/* DELETE */}
                      {isOwner && (
                        <button
                          className="flex items-center gap-1 text-red-600"
                          onClick={() => deleteComment(comment._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>

                    {/* REPLY INPUT */}
                    {activeReply === comment._id && (
                      <div className="mt-2 flex gap-2">
                        <input
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1 p-2 border rounded-md text-sm"
                        />
                        <button
                          className="px-3 bg-indigo-600 text-white rounded-md"
                          onClick={() => replyToComment(comment._id)}
                        >
                          Post
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ADD NEW COMMENT */}
        <div className="p-4 border-t flex items-center gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 p-2 border rounded-full"
          />
          <button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-full"
          >
            {loading ? "..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comments;
