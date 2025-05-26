import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Button, Form, ListGroup, Accordion, Modal, Card, Dropdown, CardGroup, Badge } from "react-bootstrap";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from "axios";
import { handleStripeAuthorizePayment } from "../../redux/actions/payment.action";
// Initialize Stripe
const stripePromise = loadStripe('pk_test_51NM7HwEA8nPIamsvPkKVxBLx012IzzgVoDPqTcXrGmkxA6LhY0K2aT6VEkDUCknwGplUp8NWQM8Ym53DnqCK3fR600XYUW1i6g');

// ---- Checkout Form ----
function CheckoutForm({ selectedPlan, onBack }) {
    const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
      billing_details: {
        name: 'Tarun Giri',
        email: 'tarun@web1expertss.com',
      },
    });

    if (error) {
      alert(error.message);
      return setLoading(false);
    }

    // Send to backend
    dispatch(handleStripeAuthorizePayment({
        email: 'tarun@web1experts.com',
        name: 'Tarun Giri',
        amount: selectedPlan.amount,
        paymentMethodId: paymentMethod.id
      }))
    // try {
    //   const res = await axios.post('/api/checkout', {
    //     email: 'user@example.com',
    //     name: 'John Doe',
    //     amount: selectedPlan.amount,
    //     paymentMethodId: paymentMethod.id
    //   });

    //   if (res.data.success) {
    //     alert('Payment successful!');
    //   } else {
    //     alert('Payment failed.');
    //   }
    // } catch (err) {
    //   console.error(err);
    //   alert('Server error');
    // }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Pay ${selectedPlan.amount} for {selectedPlan.name}</h4>
      <CardElement />
      <div className="mt-3">
        <Button variant="outline" type="button" onClick={onBack}>Back</Button>
        <Button type="submit" variant="primary" disabled={!stripe || loading}>
          {loading ? 'Processing...' : 'Pay'}
        </Button>
      </div>
    </form>
  );
}

// ---- Plans Page ----
function PlansPage() {
  const plans = [
    { name: 'Basic', amount: 10 },
    { name: 'Pro', amount: 20 },
  ];

  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className='team--page dashboard--page'>
      <div className='page--wrapper p-md-3 py-3 pt-5 mt-3 text-center'>
        <Container fluid>
          <h2>Choose a Plan</h2>

          {!selectedPlan && (
            <>
              {plans.map(plan => (
                <Button key={plan.name} variant="primary" className="m-2" onClick={() => setSelectedPlan(plan)}>
                  Choose {plan.name} - ${plan.amount}
                </Button>
              ))}
            </>
          )}

          {selectedPlan && (
            <Elements stripe={stripePromise}>
              <CheckoutForm selectedPlan={selectedPlan} onBack={() => setSelectedPlan(null)} />
            </Elements>
          )}
        </Container>
      </div>
    </div>
  );
}

export default PlansPage;
