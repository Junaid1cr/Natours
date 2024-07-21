/* eslint-disable import/prefer-default-export */
/* eslint-disable no-restricted-globals */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-undef */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateData = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:8000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') showAlert('success', 'Data Updated');
  } catch (err) {
    console.log('dfsdfaadf');
    showAlert(
      'error',
      err.response?.data?.message || 'An error occurred. Please try again.',
    );
  }
};
