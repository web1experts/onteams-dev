import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegCheckCircle } from "react-icons/fa";
import { Container } from "react-bootstrap";
import { parseIfValidJSON } from "../../helpers/commonfunctions";
import { planNames, planPrices } from "../../helpers/plans";
function SuccessPage() {
    const navigate = useNavigate()

    useEffect(() => {
        const company_dashboard = localStorage.getItem('current_dashboard');
        let companyData;
        if (company_dashboard && company_dashboard !== "") {
            const decryptedCompany = parseIfValidJSON(company_dashboard);
            companyData = (decryptedCompany) ? decryptedCompany : null
        }
        
        const localSub = companyData?.subscription;
        let subObj = {currency: 'INR'}
        if(localSub?.planId !== 'free' || localSub?.planId !== 'trial'){
            subObj['plan'] = planNames[localSub.planId] || null;
            const planPrice = planPrices[localSub?.planId] || 0;
            subObj['value'] = (planPrice / 100).toFixed(2);
        }
        if(localSub?.interval){
            subObj['billing_cycle'] = localSub?.interval?.toUpperCase() || null;
        }

        if(localSub?.currency){
            subObj['currency'] = localSub?.currency || 'INR';
        }
        if (window.gtag) {
            window.gtag('event', 'payment_completed', subObj);
        }

        if (window.fbq) {
            // Meta Pixel Purchase Event
            window.fbq('track', 'PaymentCompleted', subObj);
        }

    },[])


  return (
    <>
        <div className="team--page subscription--page success--page">
            <div className="page--wrapper px-md-2 pb-4 pt-4 py-5 pt-5 text-center h-100">
                <Container>
                    <span className="circle--check"><FaRegCheckCircle /></span>
                    <h2 className="text-center mb-1">Welcome to Prime Teams!</h2>
                    <p className="text-center mb-4">Your payment has been processed successfully and your subscription is now active.</p>
                    <Link className="btn btn-primary" to="/dashboard">Go to Dashboard</Link>
                </Container>
            </div>
        </div>
    </>
  )
}

export default SuccessPage;
  