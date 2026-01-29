import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert } from "react-bootstrap";
import { FiArrowUpRight, FiCalendar, FiCheckCircle, FiClock, FiUsers, FiSettings, FiDownload } from "react-icons/fi";
import { BsExclamationTriangle } from "react-icons/bs";
import { BiFile } from "react-icons/bi";
import { getActiveSubscriptionDetails, cancelSchedule, getScheduledPlan } from "../../redux/actions/subscription.action";
import { plans } from "../../helpers/plans";
import { AlertDialog } from "../modals";
import { currentMemberProfile } from "../../helpers/auth";
const PlanOverview = () => {
  const dispatch = useDispatch()
   const navigate = useNavigate()

   const planNames =  {
      'price_1Sd5xOSZtJkrH95e6De3lu49': 'Pro',
      'price_1SseHESZtJkrH95eo0T8FSjF': 'Pro',
      'price_1SseGYSZtJkrH95encqmjvOc': 'Pro',
      'price_1Sd5xcSZtJkrH95eunkuqn5L': 'Elite',
      'price_1SseEhSZtJkrH95einCYWefE': 'Elite',
      'price_1SseEMSZtJkrH95eK49kldme': 'Elite'
   }

  const memberProfile = currentMemberProfile();
   const [showdialog, setShowDialog] = useState(false);
  const [spinner, setSpinner] = useState(true);
  const subscriptionState = useSelector((state) => state.subscription);
  const [activeSubscription, setActiveSubscription] = useState(null)
  const [scheduledSub, setScheduledSub] = useState(null)
  useEffect(() => {
    setSpinner(true)
    dispatch(getActiveSubscriptionDetails())
    dispatch(getScheduledPlan())
  }, [])

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
            {/* <div className="bg-gradient-to-br text-white rounded-4 p-4 mb-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-4">
                  <div className="p-3 upgrade--icon rounded-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-sparkles w-8 h-8"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                  </div>
                  <h4 className="fw-bold mb-0">Upgrade to yearly billing and save ₹6,000 in a year</h4>
                </div>
                <Button variant="light" className="fw-bold shadow d-inline-flex align-items-center gap-2">Upgrade Now <FiArrowUpRight /></Button>
              </div>
            </div> */}

            <div className="bg-white rounded-4 shadow border p-4 mb-4">
              {/* Plan Card */}
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
                        <span>₹{(activeSubscription?.subscriptionDetails?.items?.data[0]?.plan?.amount / 100)} 
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
                          <h4 className="mb-0 fw-bold fs-5">{new Date(activeSubscription?.subscriptionDetails?.items?.data[0]?.current_period_end * 1000)?.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}</h4>
                        </div>
                      </Col>
                    </Row>
                  }

                  {/* <div className="text-center">
                    <Button variant="primary" href="/manage-plans" className="px-4 w-100 fw-bold py-3"><FiSettings /> Manage Plan</Button>
                  </div> */}
                  {/* <div className="mt-4 bg-amber rounded-4 p-4">
                    <div className="d-flex align-items-start gap-3">
                        <div className="p-2 bg-amber-icon rounded-3"><FiClock /></div>
                        <div className="flex-1">
                            <h5 className="fw-bold text-secondary mb-2">14 Days Remaining in Trial</h5>
                            <p className="text-sm mb-0">Submit your billing information — you won’t be billed until your trial period ends on <span className="fw-bold text-secondary">8 November 2025</span>.</p>
                        </div>
                    </div>
                  </div> */}
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
            

            {/* Billing History 
            <div className="bg-white rounded-4 shadow border p-4 mb-4">
              <Card className="border-0">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-dark rounded-3 d-flex align-items-center justify-content-center billing--title--icon"><BiFile /></div>
                  <div className="billing--title">
                    <h4 className="fw-bold mb-1">Billing History</h4>
                    <p className="mb-0">View and download all your invoices</p>
                  </div>
                  <Badge bg="secondary" className="ms-auto bg-light text-dark px-3 py-2 fw-bold fs-6 rounded-2">3 Invoices</Badge>
                </div>
                <div className="mb-4 bg-amber rounded-4 p-4">
                  <div className="d-flex align-items-start gap-3">
                      <div className="p-2 bg-amber-icon rounded-3"><BiFile /></div>
                      <div className="flex-1">
                          <h5 className="fw-bold text-secondary mb-2">Pending Invoice</h5>
                          <p className="text-sm mb-1">Invoice #INV-2025-001</p>
                          <p className="text-sm mb-0"><small className="text-muted">Due Date: 11 Nov 2025</small></p>
                      </div>
                      <div className="d-flex text-end flex-column gap-0 ms-auto">
                        <p className="text-sm mb-0"><small>Amount Due</small></p>
                        <h5 className="fw-bold fs-3 mb-1">₹1,000</h5>
                        <Button variant="primary">Make Payment</Button>
                      </div>
                  </div>
                </div>
                <ListGroup variant="flush" className="gap-3">
                  {[
                    {
                      id: "INV-2024-001",
                      date: "1 Oct 2024 - 31 Oct 2024",
                      amount: "₹1,000",
                      status: "Paid",
                      latest: true,
                    },
                    {
                      id: "INV-2024-002",
                      date: "1 Sept 2024 - 30 Sept 2024",
                      amount: "₹1,000",
                      status: "Paid",
                    },
                    {
                      id: "INV-2024-003",
                      date: "1 Aug 2024 - 31 Aug 2024",
                      amount: "₹800",
                      status: "Paid",
                    },
                  ].map((invoice, i) => (
                    <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center border border-1 rounded-4 p-4"
                    >
                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <div className="bg-light text-dark rounded-3 d-flex align-items-center justify-content-center billing--title--icon"><BiFile /></div>
                        <div className="invoice--title d-flex align-items-start justify-content-center gap-1 flex-column">
                          <div className="fw-bold fs-5 d-flex align-items-center gap-2">{invoice.id} {invoice.latest && (<Badge bg="light" className="px-2 py-1 rounded-pill fw-bold fs-7 text-uppercase" text="primary">Latest</Badge>)}</div>
                          <div className="text-muted"><FiCalendar/> {invoice.date}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <h4 className="fw-bold fs-3 mb-0">{invoice.amount}</h4>
                        <Badge bg="success"><FiCheckCircle/> {invoice.status}</Badge>
                        <Button variant="dark" size="sm"><FiDownload /> Download</Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </div>*/}
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