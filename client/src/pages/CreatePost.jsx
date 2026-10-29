// import React, { useState } from 'react'
// import { dummyUserData } from '../assets/assets'
// import { X, Image } from 'lucide-react'
// import toast from 'react-hot-toast'
// import { useSelector } from 'react-redux'
// import { useAuth } from '@clerk/clerk-react'
// import api from '../api/axios'
// import { useNavigate } from 'react-router-dom'

// const CreatePost = () => {

//   const navigate = useNavigate()
//   const [content, setContent] = useState('')
//   const [media, setMedia] = useState([])
//   const [loading, setLoading] = useState(false)

//   const user = useSelector((state)=>state.user.value)

//   const { getToken } = useAuth()

//   const handleSubmit = async () => {
//     if(!media.length && !content){
//       return toast.error('Please add at least one image or text')
//     }
//     setLoading(true)

//     const postType = media.length && content ? 'text_with_image' : media.length ? 'media' : 'text'

//     try {
//       const formData = new FormData();
//       formData.append('content', content)
//       formData.append('post_type', postType)
//       media.forEach((file) => {
//         formData.append('media', file)
//       })

//       const { data } = await api.post('/api/post/add', formData, {headers: {Authorization: `Bearer ${await getToken()}`}})

//       if(data.success) {
//         navigate('/')
//       } else {
//         console.log(data.message)
//         throw new Error(data.message)
//       }
//     } catch (error) {
//       console.log(error.message)
//       throw new Error(error.message)
//     }
//     setLoading(false)
//   }

//   return (
//     <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
//       <div className='max-w-6xl mx-auto p-6'>
//         {/* Title */}
//         <div className='mb-8'>
//           <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Post</h1>
//           <p className='text-slate-600'>Share your thoughts with the world</p>
//         </div>

//         {/* Form */}
//         <div className=',ax-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4'>
//           {/* Header */}
//           <div className='flex items-center gap-3'>
//             <img src={user.profile_picture} alt='' className='w-12 h-12 rounded-full shadow' />
//             <div>
//               <h2 className='font-semibold'>{user.full_name}</h2>
//               <p className='text-sm text-gray-500'>@{user.username}</p>
//             </div>
//           </div>
    
//           {/* Text Area */}
//           <textarea className='w-full resize-none max-h-20 mt-4 text-sm outline-none palceholder-gray-400' placeholder="What's happening?" onChange={(e) => setContent(e.target.value)} value={content}/>

//           {/* Images */}
//           {
//             media.length > 0 && <div className='flex flex-wrap gap-2 mt-4'>
//               {media.map((image, i) => (
//                 <div key={i} className='relative group'>
//                   <img src={URL.createObjectURL(image)} className='h-20 rounded-md' alt='' />
//                   <div onClick={() => setMedia(media.filter((_, index) => index !== i))} className='absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black'>
//                     <X className='w-6 h-6 text-white'/>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           }

//           {/* Bottom Bar */}
//           <div className='flex items-center justify-between pt-3 border-t border-gray-300'>
//             <label htmlFor='images' className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer'>
//               <Image className='size-6' />
//             </label>

//             <input type='file' id='images' accept='image/*' hidden multiple onChange={(e) => setImages([...images, ...e.target.files])} />

//             <button disabled={loading} onClick={() => toast.promise(handleSubmit(),
//             {
//               loading: 'uploading ...',
//               success: <p>Post Added</p>,
//               error: <p>Post Not Added</p>
//             }
//             )} className='text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:tp-purple-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md cursor-pointer'>
//               Publish Post
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CreatePost


import React, { useState } from 'react';
import { X, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.user.value);
  const { getToken } = useAuth();

  const handleSubmit = async () => {
    if (!media.length && !content.trim()) {
      return toast.error('Please add text or media');
    }

    setLoading(true);

    const postType =
      media.length && content
        ? 'text_with_media'
        : media.length
        ? 'media'
        : 'text';

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('post_type', postType);

      //MUST be "media" (matches multer)
      media.forEach((file) => {
        formData.append('media', file);
      });

      const token = await getToken();

      const { data } = await api.post('/api/post/add', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        toast.success('Post added');
        navigate('/');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Post upload failed');
    }

    setLoading(false);
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Post</h1>
          <p className='text-slate-600'>Share your thoughts with the world</p>
        </div>

        {/* Form */}
        <div className='max-w-xl bg-white p-4 sm:p-8 rounded-xl shadow-md space-y-4'>
          {/* User Header */}
          <div className='flex items-center gap-3'>
            <img
              src={user.profile_picture}
              alt=''
              className='w-12 h-12 rounded-full shadow'
            />
            <div>
              <h2 className='font-semibold'>{user.full_name}</h2>
              <p className='text-sm text-gray-500'>@{user.username}</p>
            </div>
          </div>

          {/* Text Input */}
          <textarea
            className='w-full resize-none max-h-24 mt-4 text-sm outline-none placeholder-gray-400'
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Media Preview */}
          {media.length > 0 && (
            <div className='flex flex-wrap gap-2 mt-4'>
              {media.map((file, i) => (
                <div key={i} className='relative group'>
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      className='h-20 rounded-md'
                      alt=''
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(file)}
                      className='h-20 rounded-md'
                      controls
                    />
                  )}

                  <div
                    onClick={() =>
                      setMedia(media.filter((_, index) => index !== i))
                    }
                    className='absolute hidden group-hover:flex justify-center items-center inset-0 bg-black/60 cursor-pointer'
                  >
                    <X className='w-6 h-6 text-white' />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar */}
          <div className='flex items-center justify-between pt-3 border-t border-gray-300'>
            <label
              htmlFor='media'
              className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer'
            >
              <Image className='w-6 h-6' />
            </label>

            <input
              type='file'
              id='media'
              accept='image/*,video/*,audio/*'
              hidden
              multiple
              onChange={(e) =>
                setMedia([...media, ...Array.from(e.target.files)])
              }
            />

            <button
              disabled={loading}
              onClick={() =>
                toast.promise(handleSubmit(), {
                  loading: 'Uploading...',
                  success: 'Post added',
                  error: 'Upload failed',
                })
              }
              className='text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md'
            >
              Publish Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
