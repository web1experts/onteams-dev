import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "react-bootstrap";
import { useToast } from "../../context/ToastContext";
export default function ConfirmPayment({invoiceData, closeConfirmation}) {
  const stripe = useStripe();
  const elements = useElements();
    const addToast = useToast();
  const confirmStripePayment = async () => {
     if (!stripe || !invoiceData?.client_secret) return;
    const { error } = await stripe.confirmCardPayment(
        invoiceData.client_secret,
        );

        if (error) {
          addToast(error.message, 'danger');
          closeConfirmation()
          return;
        }
        addToast('Your subscription has been updated.', 'success');
        closeConfirmation()
       
  }


  return (
    <button onClick={confirmStripePayment} className="btn btn-primary">
     Confirm & Continue
    </button>
  );
}
