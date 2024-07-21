/* eslint-disable no-undef */
// This is your test secret API key.
const stripe = Stripe(
  'pk_test_51PeXedHpW7MpZOBafCoqgiNgW8VOKX6p4Nd2BwgKVKMnRFntHnDPDnVBRX8KQz9TfaDnYbZr49hbwMf5LQAFcU9V004aiGJW6z',
);

initialize();

// Create a Checkout Session
async function initialize() {
  const fetchClientSecret = async () => {
    const response = await fetch('/create-checkout-session', {
      method: 'POST',
    });
    const { clientSecret } = await response.json();
    return clientSecret;
  };

  const checkout = await stripe.initEmbeddedCheckout({
    fetchClientSecret,
  });

  // Mount Checkout
  checkout.mount('#checkout');
}
