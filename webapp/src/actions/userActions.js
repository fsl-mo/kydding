import comeesyAPI from '../api/comeesy';
import { userTypes } from './types';
import history from '../utils/history';
import { saveToken, removeToken, validateToken } from '../utils/helperFns';

const userLoading = () => ({
  type: userTypes.USER_LOADING,
});

const userAuthSuccess = () => ({
  type: userTypes.USER_AUTH_SUCCESS,
});
const userAuthFailed = error => ({
  type: userTypes.USER_AUTH_FAILED,
  payload: error,
});

const updateUserDataSuccess = () => ({
  type: userTypes.UPDATE_USER_DATA_SUCCESS,
});

const updateUserDataFailed = error => ({
  type: userTypes.UPDATE_USER_DATA_FAILED,
  payload: error,
});

export const login = data => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(userLoading());

    comeesyAPI
      .post('/auth/login', data)
      .then(res => {
        resolve();
        const token = `Bearer ${res.data.token}`;
        saveToken(token);
        dispatch(userAuthSuccess());
        dispatch(getUserOwnData());
        history.push('/');
      })
      .catch(err => {
        console.error(err.response);
        dispatch(userAuthFailed(err.response.data));
        reject(err.response);
      });
  });

export const signup = data => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(userLoading());

    comeesyAPI
      .post('/auth/signup', data)
      .then(res => {
        resolve();
        const token = `Bearer ${res.data.token}`;
        saveToken(token);
        dispatch(userAuthSuccess());
        dispatch(getUserOwnData());
        history.push('/');
      })
      .catch(err => {
        console.error(err);
        dispatch(userAuthFailed(err.response.data));
        reject(err.response);
      });
  });

export const logout = () => dispatch =>
  new Promise((resolve, reject) => {
    dispatch(userLoading());
    comeesyAPI
      .get('/auth/logout')
      .then(res => {
        resolve();
        removeToken();
        dispatch({ type: userTypes.LOGOUT });
        history.push('/');
      })
      .catch(err => {
        console.error(err);
        removeToken();
        dispatch({ type: userTypes.LOGOUT });
        history.push('/');
        reject(err.response);
      });
  });

export const getUserOwnData = () => dispatch => {
  const { token } = window.localStorage;
  if (!token || !validateToken(token)) return dispatch(logout());

  dispatch(userLoading());
  return new Promise((resolve, reject) => {
    comeesyAPI
      .get('/user', { headers: { Authorization: token } })
      .then(res => {
        resolve(res.data);
        dispatch(userAuthSuccess());
        dispatch({
          type: userTypes.GET_USER_SUCCESS,
          payload: res.data,
        });
      })
      .catch(err => {
        console.error(err);
        dispatch({
          type: userTypes.GET_USER_FAILED,
          payload: err.response,
        });
        reject(err.response);
      });
  });
};

export const updateUserDetails = data => dispatch => {
  const { token } = window.localStorage;
  if (!token || !validateToken(token)) return dispatch(logout());

  dispatch(userLoading());
  return new Promise((resolve, reject) => {
    comeesyAPI
      .post('/user/details', data, {
        headers: { Authorization: token },
      })
      .then(res => {
        resolve(res.data);
        dispatch(updateUserDataSuccess());
        dispatch(getUserOwnData());
      })
      .catch(err => {
        console.error(err);
        dispatch(updateUserDataFailed(err.response.data));
        reject(err.response);
      });
  });
};

export const updateUserCredentials = data => dispatch => {
  const { token } = window.localStorage;
  if (!token || !validateToken(token)) return dispatch(logout());

  dispatch(userLoading());

  return new Promise((resolve, reject) => {
    comeesyAPI
      .post('/user/credentials', data, {
        headers: { Authorization: token },
      })
      .then(res => {
        resolve(res.data);
        dispatch(updateUserDataSuccess());
        dispatch(getUserOwnData());
      })
      .catch(err => {
        console.error(err);
        dispatch(updateUserDataFailed(err.response.data));
        reject(err.response);
      });
  });
};

export const uploadUserAvatar = file => dispatch => {
  const { token } = window.localStorage;
  if (!token || !validateToken(token)) return dispatch(logout());

  dispatch(userLoading());

  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    comeesyAPI
      .post('/user/avatar', formData, {
        headers: { Authorization: token },
      })
      .then(res => {
        resolve(res.data);
        dispatch(updateUserDataSuccess());
        dispatch(getUserOwnData());
      })
      .catch(err => {
        console.error(err);
        dispatch(updateUserDataFailed(err.response.data));
        reject(err.response.data);
      });
  });
};
