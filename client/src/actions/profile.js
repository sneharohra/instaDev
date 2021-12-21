import axios from 'axios';
import { set } from 'mongoose';

import { setAlert } from './alert';

import{
    CLEAR_PROFILE,
    GET_PROFILE,
    PROFILE_ERROR, 
    UPDATE_PROFILE, 
    ACCOUNT_DELETED
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
        
        const res = await axios.post('http://localhost:5000/api/profile', formData, config);
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

export const addExperience = (formData, navigate) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type' : 'application/json'
            }
        }
        
        const res = await axios.put('http://localhost:5000/api/profile/experience', formData, config);
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        });
        dispatch(setAlert('Experience added!', 'success' ));

        navigate('/dashboard');

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

export const addEducation = (formData, navigate) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type' : 'application/json'
            }
        }
        
        const res = await axios.put('http://localhost:5000/api/profile/education', formData, config);
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        });
        dispatch(setAlert('Education added!', 'success' ));

        navigate('/dashboard');

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

export const deleteExperience = id => async dispatch => {
    try {
        const res = await axios.delete(`http://localhost:5000/api/profile/experience/${id}`);

        dispatch({
            type: UPDATE_PROFILE, 
            payload: res.data
        });

        dispatch(setAlert('Experience removed!', 'success' ));
    } catch (error) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        })
    }
}

export const deleteEducation = id => async dispatch => {
    try {
        const res = await axios.delete(`http://localhost:5000/api/profile/education/${id}`);

        dispatch({
            type: UPDATE_PROFILE, 
            payload: res.data
        });

        dispatch(setAlert('Education removed!', 'success' ));
    } catch (error) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status}
        })
    }
}

// Delete account and profile
export const deleteAccount = () => async dispatch => {
    if(window.confirm('Are you sure? This change can NOT be undone!')) {
        try {
            const res = await axios.delete(`http://localhost:5000/api/profile/`);
    
            dispatch({type: CLEAR_PROFILE});
            dispatch({type: ACCOUNT_DELETED});
    
            dispatch(setAlert('Your account has been deleted successfully!'));
        } catch (error) {
            dispatch({
                type: PROFILE_ERROR,
                payload: { msg: error.response.statusText, status: error.response.status}
            })
        }
    }

    
}
