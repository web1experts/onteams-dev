import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "react-bootstrap";

export default function CheckoutForm({mode}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loader, setLoader] = useState( false )
  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    setLoader(true)
    console.log(mode)
    if (mode === "setup") {
      result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: "https://app.primeteams.ai/success",
        },
      });
    } else {
      result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "https://app.primeteams.ai/success",
        },
      });
    }

    if (result?.error) {
      setLoader(false)
      alert(result.error.message);
    }else{
       setLoader(false)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button class="btn btn-primary mt-3" disabled={loader}>{ loader ? 'Please wait...': 'Subscribe'}</button>
    </form>
  );
}
