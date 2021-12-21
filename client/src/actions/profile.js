import axios from 'axios';
import { set } from 'mongoose';

import { setAlert } from './alert';

import{
    GET_PROFILE,
    PROFILE_ERROR
} from './types'


export const getCurrentProfile = () => async dispatch => {
    try {
        const res = await axios.get('http://localhost:5000/api/profile/me');
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
        
    } catch (error) {
        console.log(error)
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        })
        
    }
}

//create or update a profile 

export const createProfile = (formData, navigate, edit = false) => async dispatch =>{
    try {
        const config = {
            headers: {
                'Content-Type' : 'application/json'
            }
        }
        
        const res = await axios.post('/api/profile', formData, config);
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        });
        dispatch(setAlert(edit? 'Profile Updated!': 'Profile Created!', 'success' ));

        if(!edit) {
            navigate('/dashboard');
        }

    } catch (error) {
        const errors = error.response.data.errors;
        if(errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }
        
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        })
        
    }
}
