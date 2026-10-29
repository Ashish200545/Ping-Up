// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
// import api from '../../api/axios.js'
// import toast from 'react-hot-toast'


// const initialState = {
//     value: null
// }

// export const fetchUser = createAsyncThunk('user/fetchUser', async (token) => {
//     const { data } = await api.get('/api/user/data', {
//         headers: {Authorization: `Bearer ${token}`}
//     })
//     return data.success ? data.user : console.log("hahahaha")//null
// })

// export const updateUser = createAsyncThunk('user/update', async ({userData, token}) => {
//     const { data } = await api.post('/api/user/update', userData, {
//         headers: {Authorization: `Bearer ${token}`}
//     })
//     if(data.success) {
//         toast.success(data.message)
//         return data.user
//     }else{
//         toast.error(data.message)
//         return null
//     }
// })


// const userSlice = createSlice({
//     name: 'user',
//     initialState,
//     reducers: {

//     },
//     extraReducers: (builder) => {
//         builder.addCase(fetchUser.fulfilled, (state, action) => {
//             state.value = action.payload
//         }).addCase(updateUser.fulfilled, (state, action) => {
//             state.value = action.payload
//         })
//     }
// })

// export default userSlice.reducer


import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'

const initialState = {
    value: null,
    loading: false,
    error: null
}

export const fetchUser = createAsyncThunk('user/fetchUser', async (token) => {
    // const { data } = await api.get('/api/user/data', {
    //     headers: {Authorization: `Bearer ${token}`}
    // })
    // return data.success ? data.user : null
    try{
         console.log('Fetching user with token:', token)
        const { data } = await api.get('/api/user/data', {
            headers: {Authorization: `Bearer ${token}`}
        })
        console.log('API Response:', data)
        console.log('data.success:', data.success)
        if(data.success) {
            console.log('User data:', data.user)
            return data.user
        } else {
            console.log('API returned success: false')
            return null
        }
    } catch (error) {
        console.error('fetchUser error:', error.message)
        throw error
    }
})

export const updateUser = createAsyncThunk('user/update', async ({userData, token}) => {
    const { data } = await api.post('/api/user/update', userData, {
        headers: {Authorization: `Bearer ${token}`}
    })
    if(data.success) {
        toast.success(data.message)
        return data.user
    }else{
        toast.error(data.message)
        return null
    }
})

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false
                state.value = action.payload
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.value = action.payload
            })
    }
})

export default userSlice.reducer