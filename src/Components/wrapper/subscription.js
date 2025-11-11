import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { parseIfValidJSON } from "../../helpers/commonfunctions";
import { Navigate, useLocation, matchPath } from "react-router-dom";

import PlansPage from "../subscriptions/Plans";
import SubscriptionPlans from "../subscriptions/subscriptionPlans";

const SubscriptionGuard = ({ children }) => {
  const location = useLocation();
  
  // From Redux (or wherever your subscription data lives)
  const activeSubscription = useSelector(
    (state) => state.subscription?.activeSubscription
  );
const hideSidebarRoutes = [
    '/login',
    '/signup',
    '/',
    '/forgot-password',
    '/404',
    '/reset-password/:token',
    '/account-setup/:token',
    '/accept-invite/:token',
    '/member-signup/:token',
    
]

// ✅ Check if the current route matches any of the patterns
  const shouldHideSidebar = hideSidebarRoutes.some((route) =>
    matchPath({ path: route, end: true }, location.pathname)
  );

  // ✅ Return children directly if path matches one of the routes
  if (shouldHideSidebar) {
    return children;
  }
  const encryptedCompany = localStorage.getItem('current_dashboard');
    let companyData;
    if (encryptedCompany && encryptedCompany !== "") {
        const decryptedCompany = parseIfValidJSON(encryptedCompany);
        companyData = (decryptedCompany) ? decryptedCompany : null
    }else{
      return children;
    }
    

  const localSub = companyData?.subscription;

  // Helper function: determine if user has active subscription
  const hasActiveSubscription =
    activeSubscription?.status === "active" ||
    localSub?.status === "active" ||
    activeSubscription?.planId ||
    localSub?.planId;

  const isOnPlansPage =  location.pathname.startsWith("/account-setup");

  // --- Helper function to check if a trial is expired ---
  const isTrialExpired = (subscription) => {
    if (subscription?.planId === "trial" && subscription?.createdAt) {
      const trialStart = new Date(subscription.createdAt);
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialStart.getDate() + 14);
      const now = new Date();
      return now > trialEnd;
    }
    return false;
  };

  // --- Trial Expiry Check (Redux or Local) ---
  const trialExpired =
    isTrialExpired(activeSubscription) || isTrialExpired(localSub);

  if (trialExpired) {
    return <SubscriptionPlans />;
  }

  // If not subscribed and not on /plans → redirect to /plans
  if (!hasActiveSubscription && !isOnPlansPage) {
    return <PlansPage />
    // return <Navigate to="/plans" replace />;
  }

  // If subscribed and already on /plans → optional redirect
  // if (hasActiveSubscription && isOnPlansPage) {
  //   return <Navigate to="/dashboard" replace />;
  // }

  // Otherwise, allow access
  return children;
};

export default SubscriptionGuard;
