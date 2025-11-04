import React, { useState, useEffect } from "react";
import { parseIfValidJSON } from "../../helpers/commonfunctions";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const SubscriptionGuard = ({ children }) => {
  const location = useLocation();
  
  // From Redux (or wherever your subscription data lives)
  const activeSubscription = useSelector(
    (state) => state.subscription?.activeSubscription
  );

  const encryptedCompany = localStorage.getItem('current_dashboard');
    let companyData;
    if (encryptedCompany && encryptedCompany !== "") {
        const decryptedCompany = parseIfValidJSON(encryptedCompany);
        companyData = (decryptedCompany) ? decryptedCompany : null
    }
    

  const localSub = companyData?.subscription;

  // Helper function: determine if user has active subscription
  const hasActiveSubscription =
    activeSubscription?.status === "active" ||
    localSub?.status === "active" ||
    activeSubscription?.planId ||
    localSub?.planId;

  const isOnPlansPage =  location.pathname.startsWith("/account-setup");
console.log('isOnPlansPage ', isOnPlansPage)
  // If not subscribed and not on /plans → redirect to /plans
  if (!hasActiveSubscription && !isOnPlansPage) {
    return <Navigate to="/plans" replace />;
  }

  // If subscribed and already on /plans → optional redirect
  // if (hasActiveSubscription && isOnPlansPage) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  // Otherwise, allow access
  return children;
};

export default SubscriptionGuard;
