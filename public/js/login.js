/* eslint-disable no-restricted-globals */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-undef */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  console.log({ email, password });
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: { email, password },
    });
    console.log(res);
    if (res && res.data && res.data.status === 'success') {
      showAlert('success', 'Logged In Successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', 'Login failed. Please try again.');
    }
  } catch (err) {
    showAlert(
      'error',
      err.response?.data?.message || 'An error occurred. Please try again.',
    );
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/logout',
    });
    if (res.data.status === 'success') location.reload(true);
  } catch (err) {
    showAlert('error', 'Some error happend');
  }
};
