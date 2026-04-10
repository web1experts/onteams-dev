import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert } from "react-bootstrap";
import { FiCalendar, FiCheckCircle, FiClock, FiUsers } from "react-icons/fi";
import { BsExclamationTriangle } from "react-icons/bs";
import { getActiveSubscriptionDetails, cancelSchedule, getScheduledPlan } from "../../redux/actions/subscription.action";
import { getPlans, planNames } from "../../helpers/plans";
import { AlertDialog } from "../modals";
import { currentMemberProfile } from "../../helpers/auth";
import Spinner from 'react-bootstrap/Spinner';
import { getOption, getAllOptions } from "../../redux/actions/option.actions";
const PlanOverview = () => {
  const dispatch = useDispatch()
   const navigate = useNavigate()
  const [plans, setPlans] = useState({})
  const optionState = useSelector((state) => state.option)
  const [stripePromise, setStripePromise] = useState(null)
  const [stripeMode, setStripeMode] = useState( 'sandbox')
  const [options, setOptions] = useState({stripe_mode: 'sandbox', stripe_trial_days: 14})
  const memberProfile = currentMemberProfile();
   const [showdialog, setShowDialog] = useState(false);
  const [spinner, setSpinner] = useState(true);
  const subscriptionState = useSelector((state) => state.subscription);
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [scheduledSub, setScheduledSub] = useState(null)
  useEffect(() => {
    setSpinner(true)
    // dispatch(getOption('stripe_mode'))
    dispatch(getAllOptions())
    dispatch(getActiveSubscriptionDetails())
    dispatch(getScheduledPlan())
  }, [])

  useEffect(() => {
    if(optionState?.option?.key === 'stripe_mode'){
      setStripeMode(optionState?.option.value || 'sandbox')
    }
  }, [optionState?.option])

  useEffect(() => {
      setOptions(optionState?.optionSet)
      setStripeMode(optionState?.optionSet?.stripe_mode || 'sandbox')
    }, [optionState?.optionSet])

  useEffect(() => {
    setPlans(getPlans(stripeMode))
  }, [stripeMode])

  useEffect(() => {
    if(subscriptionState.activeSubscription && subscriptionState.activeSubscription?.plandId === 'free' || subscriptionState?.activeSubscription?.plandId === 'trial'){
      setActiveSubscription(subscriptionState.activeSubscription)
      setTimeout(() => {
        setSpinner(false)
      },700)
    }else{
      getActiveSubscriptionDetails(subscriptionState.activeSubscription?.subscriptionId)
    }
  }, [subscriptionState.activeSubscription])

  useEffect(() => {
    setScheduledSub(subscriptionState.scheduledSubscription)
  }, [subscriptionState.scheduledSubscription])

   useEffect(() => {
    const subscriptionData = subscriptionState?.subscriptionData;
    if (subscriptionData) {
      const subscriptionDetails = subscriptionData?.subscriptionDetails;
      const planId = subscriptionDetails?.plan_id;

      if (planId) {
        // Find the matching plan from any billing cycle
        const matchedPlan = Object.values(plans)
          .flat()
          .find((p) => p.id === planId);

        // Create a safe copy before updating
        const updatedData = {
          ...subscriptionData,
          subscriptionDetails: {
            ...subscriptionDetails,
            plan_info: matchedPlan || null,
          },
        };

        setActiveSubscription(updatedData);
      } else {
        setActiveSubscription(subscriptionData);
      }
    }
    setTimeout(() => {
        setSpinner(false)
      },700)
  }, [subscriptionState.subscriptionData]);

  useEffect(() => {
    if(subscriptionState.subscriptionCancel === 0){
      navigate(0)
    }
    
  }, [subscriptionState.subscriptionCancel])

  const doCancelSchedule = () => {
    setShowDialog(true)
  }

  const handleCancelSchedule = () => {
    dispatch(cancelSchedule(activeSubscription?.subscriptionId))
    setShowDialog(false)
  }

  
  return (
    <div className="team--page plan--overview--page">
      <div className="page--wrapper py-5 pt-5 h-100">
          <Container>
            <div className="text-center mb-4">
              <h2 className="mb-3">Your Plan</h2>
              <p className="mb-0">Manage your subscription and view billing details</p>
            </div>
            
          {
                (spinner === true) ? (
                <Spinner animation="border" />)
              :
            <div className="bg-white rounded-4 shadow border p-4 mb-4">
              
              <Card className="border-0 mb-0">
                {activeSubscription?.planId === 'free' || activeSubscription?.planId === 'trial' ?
                  <Card.Header className="bg-gradient-blue text-white d-flex justify-content-between align-items-center rounded-4 p-4 mb-4 shadow">
                    <div className="d-flex gap-2 align-items-center">
                      <h3 className="mb-0 fw-bold">{activeSubscription?.planId === 'free' ? 'Free': 'Trial'} Plan</h3>
                      <h4 className="m-0 d-flex gap-2 align-items-center text-capitalize"><FiCheckCircle />Active</h4>
                    </div>
                    <div className="d-flex gap-2 align-items-end flex-column">
                      <h6 className="mb-0 fw-bold text-uppercase">Price per Member</h6>
                      <h3 className="fw-bold mb-0 display-6 d-flex gap-1 align-items-end flex-column">
                        <span>FREE </span>
                      </h3>
                    </div>
                  </Card.Header>
                  :
                  <Card.Header className="bg-gradient-blue text-white d-xl-flex justify-content-between align-items-center rounded-4 p-4 mb-4 shadow">
                    <div className="d-flex gap-2 align-items-center justify-content-center justify-content-xl-start mb-2 mb-xl-0">
                      <h3 className="mb-0 fw-bold">{planNames[activeSubscription?.planId]} Plan</h3>
                      <h4 className="m-0 d-flex gap-2 align-items-center text-capitalize"><FiCheckCircle /> {activeSubscription?.subscriptionDetails?.status}</h4>
                    </div>
                    <div className="d-flex gap-2 align-items-center align-items-xl-end flex-column">
                      <h6 className="mb-0 fw-bold text-uppercase">Price per Member</h6>
                      <h3 className="fw-bold mb-0 display-6 d-flex gap-1 align-items-end flex-column">
                        <span>
                          {
                            (activeSubscription?.subscriptionDetails?.currency?.toLowerCase() === 'usd') ? 
                            '$'
                            :
                            '₹'
                          }
                          
                          {(activeSubscription?.subscriptionDetails?.items?.data[0]?.plan?.amount) ? (activeSubscription?.subscriptionDetails?.items?.data[0]?.plan?.amount / 100): ''} 
                          <small className="fs-5 fw-normal">
                            /{`${activeSubscription?.subscriptionDetails?.items?.data?.[0]?.plan?.interval ?? 'month'}`}
                          </small>
                          </span>
                          <span className="fs-6 fw-normal">billed {`${activeSubscription?.subscriptionDetails?.items?.data?.[0]?.plan?.interval_count ?? 1} 
                              ${activeSubscription?.subscriptionDetails?.items?.data?.[0]?.plan?.interval ?? 'month'}`}
                          </span>
                      </h3>
                    </div>
                  </Card.Header>
                }

                <Card.Body className="p-0">
                  {activeSubscription?.planId === 'free' || activeSubscription?.planId === 'trial' ?
                    <Row className="mb-0">
                      <Col md={4} className="mb-md-3 mb-0">
                        <div className="plan--status bg-white rounded-4 p-4 border border-1 shadow-sm h-100">
                          <div className="status--title d-flex align-items-center gap-2 mb-3">
                            <span className="status--icon status--icon--blue"><FiUsers /></span>
                            <p className="mb-0 fw-semibold">Team Size</p>
                          </div>
                          <h4 className="mb-0 fw-bold fs-3">{activeSubscription?.quantity || 0}</h4>
                        </div>
                      </Col>
                      
                    </Row>
                    :
                    <Row className="mb-0">
                      <Col xl={4} className="mb-md-3 mb-0">
                        <div className="plan--status bg-white rounded-4 p-4 border border-1 shadow-sm h-100">
                          <div className="status--title d-flex align-items-center gap-2 mb-3">
                            <span className="status--icon status--icon--blue"><FiUsers /></span>
                            <p className="mb-0 fw-semibold">Team Size</p>
                          </div>
                          <h4 className="mb-0 fw-bold fs-5">{activeSubscription?.subscriptionDetails?.items?.data[0]?.quantity || activeSubscription?.quantity || 0}</h4>
                        </div>
                      </Col>
                      <Col xl={4} className="mb-md-3 mb-0">
                        <div className="plan--status bg-white rounded-4 p-4 border border-1 shadow-sm h-100">
                          <div className="status--title d-flex align-items-center gap-2 mb-3">
                            <span className="status--icon status--icon--green"><FiCalendar /></span>
                            <p className="mb-0 fw-semibold">Billing Cycle</p>
                          </div>
                          <h4 className="mb-0 fw-bold fs-5 text-capitalize">{activeSubscription?.subscriptionDetails?.items?.data[0]?.plan?.interval_count} {activeSubscription?.subscriptionDetails?.items?.data[0]?.plan?.interval}</h4>
                        </div>
                      </Col>
                      <Col xl={4} className="mb-md-3 mb-0">
                        <div className="plan--status bg-white rounded-4 p-4 border border-1 shadow-sm h-100">
                          <div className="status--title d-flex align-items-center gap-2 mb-3">
                            <span className="status--icon status--icon--grey"><FiClock /></span>
                            <p className="mb-0 fw-semibold">Next Billing</p>
                          </div>
                          <h4 className="mb-0 fw-bold fs-5">{
                            (activeSubscription?.subscriptionDetails?.items?.data[0]?.current_period_end) ?
                          new Date(activeSubscription?.subscriptionDetails?.items?.data[0]?.current_period_end * 1000)?.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                          : ''
                        }</h4>
                        </div>
                      </Col>
                    </Row>
                  }

                 
                   {(scheduledSub && memberProfile?.role?.slug === "owner" ) && (
                    <div className="mt-4 bg-amber rounded-4 p-4">
                      <div className="d-flex align-items-start gap-3">
                          <div className="p-2 bg-amber-icon rounded-3"><BsExclamationTriangle /> </div>
                          <div className="flex-1">
                              <h5 className="fw-bold text-secondary mb-2">Scheduled Plan Cancel</h5>
                              <p className="text-sm mb-1">Your plan will be canceled at the end of your current billing cycle.</p>
                              <p className="text-sm mb-0"><small className="text-secondary">Effective Date: {new Date(scheduledSub?.cancel_at * 1000)?.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}</small></p>
                          </div>
                          <Button variant="warning" onClick={doCancelSchedule} className="ms-auto">Cancel</Button>
                      </div>
                    </div>)
                  }
                </Card.Body>
              </Card>
            </div>
            }
            <AlertDialog
              showdialog={showdialog}
              toggledialog={setShowDialog}
              msg="Are you sure you want to cancel your subscription cancellation schedule?"
              callback={handleCancelSchedule}
            />
          </Container>
      </div>
    </div>

  );
};

export default PlanOverview;