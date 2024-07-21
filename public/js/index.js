/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-undef */
import '@babel/polyfill';
import { logout, login } from './login';
import { updateData } from './updateSettings';
import { bookTour } from './stripe';

console.log('odfsdfad');

const loginform = document.querySelector('.form--login');
const updatesettings = document.querySelector('.form-user-data');
const updatepassword = document.querySelector('.form-user-password');
const bookbtn = document.getElementById('book-tour');

if (loginform) {
  console.log('qeroidfakndfadfkjadf');
  loginform.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

const logoutform = document.querySelector('.nav__el--logout');

if (logoutform) {
  logoutform.addEventListener('click', logout);
}

if (updatesettings) {
  updatesettings.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateData(form, 'data');
  });
}

if (updatepassword) {
  updatepassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    const passwordConfirm = document.getElementById('password-confirm').value;
    const password = document.getElementById('password').value;
    const passwordCurrent = document.getElementById('password-current').value;
    await updateData(
      { password, passwordConfirm, passwordCurrent },
      'password',
    );
    document.getElementById('password-confirm').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-current').value = '';
  });
}

if (bookbtn) {
  bookbtn.addEventListener('click', (e) => {
    console.log('Book button clicked');
    const { tourId } = e.target.dataset;
    console.log('Tour ID:', tourId);
    bookTour(tourId);
  });
}
