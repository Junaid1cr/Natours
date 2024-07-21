/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-undef */
export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
  const markup = document.createElement('div');
  markup.className = `alert alert--${type}`;
  markup.innerHTML = msg;
  document.querySelector('body').insertAdjacentElement('afterbegin', markup);
  window.setTimeout(() => {
    const alertElement = document.querySelector('.alert');
    if (alertElement) alertElement.remove();
  }, 5000);
};
