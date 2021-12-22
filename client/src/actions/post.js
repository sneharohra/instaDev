import axios from 'axios';
import { set } from 'mongoose';
import {setAlert} from './alert';
import{
    ADD_POST,
    DELETE_POST,
    GET_POSTS,
    POST_ERROR,
    UPDATE_LIKES,
    GET_POST,
    ADD_COMMENT,
    REMOVE_COMMENT
    
} from './types';


export const getPosts = () => async dispatch => {
    try {
        const res = await axios.get('/api/posts')
        dispatch({
            type: GET_POSTS,
            payload: res.data
        })
        
    } catch (error) {
        console.log(error)
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        })
        
    }
}

export const getPost = id => async dispatch => {
    try {
        const res = await axios.get(`/api/posts/${id}`)
        dispatch({
            type: GET_POST,
            payload: res.data
        })
        
    } catch (error) {
        console.log(error)
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        })
        
    }
}
export const addLike = postId => async dispatch => {
    try {
        const res = await axios.put(`/api/posts/like/${postId}`)
        dispatch({
            type: UPDATE_LIKES,
            payload: { postId, likes: res.data }
        })
        
    } catch (error) {
        console.log(error)
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        })
        
    }
}


export const removeLike = postId => async dispatch => {
    try {
        const res = await axios.put(`/api/posts/unlike/${postId}`)
        dispatch({
            type: UPDATE_LIKES,
            payload: { postId, likes: res.data }
        })
        
    } catch (error) {
        console.log(error)
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        })
        
    }
}

export const deletePost =  id  => async dispatch => {
    try {
        const res = await axios.delete(`/api/posts/${id}`)
        dispatch({
            type: DELETE_POST,
            payload: id
        })

        dispatch(setAlert('Post Removed' , 'success'));
        
    } catch (error) {
        console.log(error)
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        })
        
    }
}

export const addPost =  formData  => async dispatch => {
    const config = {
        headers: {
            'Content-Type' : 'application/json'
        }
    }
    try {
        const res = await axios.post('/api/posts/', formData, config);
        dispatch({
            type: ADD_POST,
            payload: res.data
        })

        dispatch(setAlert('Post Created' , 'success'));
        
    } catch (error) {
        console.log(error)
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        })
        
    }
}


export const addComment  =  (postId, formData)  => async dispatch => {
    const config = {
        headers: {
            'Content-Type' : 'application/json'
        }
    }
    try {
        const res = await axios.post(`/api/posts/comment/${postId}`, formData, config);
        dispatch({
            type: ADD_COMMENT,
            payload: res.data
        })

        dispatch(setAlert('Comment Added!' , 'success'));
        
    } catch (error) {
        console.log(error)
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        })
        
    }
}


export const deleteComment  =  (postId, commentId)  => async dispatch => {

    try {
        const res = await axios.delete(`/api/posts/comment/${postId}/${commentId}`);
        dispatch({
            type: REMOVE_COMMENT,
            payload: commentId
        })

        dispatch(setAlert('Comment Deleted!' , 'success'));
        
    } catch (error) {
        console.log(error)
        dispatch({
            type: POST_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        })
        
    }
}