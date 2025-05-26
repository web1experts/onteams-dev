import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Button, Form, ListGroup, Accordion, Modal, Card, Dropdown, CardGroup, Badge } from "react-bootstrap";
import { handleAuthorizePayment } from "../../redux/actions/payment.action";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
const stripePromise = loadStripe('pk_test_51NM7HwEA8nPIamsvPkKVxBLx012IzzgVoDPqTcXrGmkxA6LhY0K2aT6VEkDUCknwGplUp8NWQM8Ym53DnqCK3fR600XYUW1i6g');


function CheckoutWrapper(props) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}



function PlansPage (){
    const dispatch = useDispatch();
    const stripe = useStripe();
    const elements = useElements();
    const paymentResults = useSelector(state => state.payment)
    const [ authPayResponse, setAuthPayResponse] = useState({})
    const [ loading, setLoading ] = useState( false )
    const plans = [
    { name: 'Basic', amount: 10 },
    { name: 'Pro', amount: 20 },
    ];

    const [selectedPlan, setSelectedPlan] = useState(null);

    const handlePlan = async (planId) => {
        setLoading( true )
        // dispatch(handleAuthorizePayment({planId}))

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
            billing_details: { email: 'tarun@web1experts.com', name: 'Tarun' },
        });

        if (error) {
            alert(error.message);
            return setLoading(false);
        }
    }
    

    useEffect(() => {
        setLoading( false )
        if( paymentResults.authorizeData && Object.keys(paymentResults.authorizeData).length > 0 ){
            doAuthPayment(paymentResults.authorizeData)
        }
    }, [ paymentResults ])

    const doAuthPayment = (data) => {
        const options = {
            key: process.env.RAZORPAY_KEY,
            currency: "INR",
            order_id: data.order_id,
            customer_id: data.customer_id,
            handler: function (response) {
                setAuthPayResponse({
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    signature: response.razorpay_signature
                })
                alert("Payment ID: " + response.razorpay_payment_id);
                alert("Order ID: " + response.razorpay_order_id);
                alert("Signature: " + response.razorpay_signature);
            },
            theme: {
                color: "#3399cc"
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    }

    return (
        <>
            <div className='team--page dashboard--page'>
                <div className='page--wrapper p-md-3 py-3 pt-5 mt-3 text-center'>
                    <Container fluid>
                    <h2>Plans</h2>
                    <div className="btn--group">
                        {/* <Button type="button" variant="primary" onClick={() => handlePlan('a')} disabled={loading}>
                            { loading ? 'Please wait...' : 'Plan A'}
                        </Button>
                        <Button type="button" variant="outline-primary" onClick={() => handlePlan('b')} disabled={loading}>
                            { loading ? 'Please wait...' : 'Plan B'}
                        </Button> */}

                        {plans.map(plan => (
                            <button key={plan.name} onClick={() => setSelectedPlan(plan)}>
                                Choose {plan.name} - ${plan.amount}
                            </button>
                        ))}

                        {selectedPlan && (
                            <CheckoutWrapper
                                email="user@example.com"
                                name="John Doe"
                                selectedPlanAmount={selectedPlan.amount}
                            />
                        )}
                    </div>
                    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
    </form>
                    </Container>
                </div>
            </div>
        </>
    )
}

export default PlansPage;