import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "react-bootstrap";
import { CLEAR_CLIENT_SECRET } from '../../redux/actions/types';
import { useToast } from "../../context/ToastContext";
export default function ConfirmPayment({invoiceData, closeConfirmation}) {
  const stripe = useStripe();
    const dispatch = useDispatch()
  const elements = useElements();
    const addToast = useToast();
    const clearClientSecret = () => ({
        type: CLEAR_CLIENT_SECRET,
    });
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
        await dispatch(clearClientSecret());
        closeConfirmation()
       
  }


  return (
    <button onClick={confirmStripePayment} className="btn btn-primary">
     Confirm & Continue
    </button>
  );
}
