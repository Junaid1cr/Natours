/* eslint-disable import/prefer-default-export */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-restricted-globals */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51PeXedHpW7MpZOBafCoqgiNgW8VOKX6p4Nd2BwgKVKMnRFntHnDPDnVBRX8KQz9TfaDnYbZr49hbwMf5LQAFcU9V004aiGJW6z',
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/booking/checkout/${tourId}`,
    );
    //console.log('dfadgasdfdfgsodgjdsfgdsljfgslfg');
    console.log(session);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
// export const bookTour = async (tourId) => {
//   try {
//     console.log('Attempting to book tour with ID:', tourId);
//     // Mock response data
//     const mockResponse = { data: 'Mock session data' };
//     console.log('Booking session response:', mockResponse);
//   } catch (err) {
//     console.error('Error booking the tour:', err);
//   }
// };
