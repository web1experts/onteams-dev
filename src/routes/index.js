import React from "react";
import { Navigate } from 'react-router-dom';
import LoginPage from "../Components/Auth/LoginPage";
import SignUpPage from "../Components/Auth/SignUp";
import ForgotPassword from "../Components/Auth/ForgotPassword";
import AccountSetup from "../Components/Auth/AccountSetup";
import WorkspaceSetup from "../Components/Auth/WorkspaceSetup";
import ResetPassword from "../Components/Auth/ResetPassword";
import TeamMembersPage from "../Components/TeamMembers/TeamMembers";
import Workspace from "../Components/workspaces";
import ClientsPage from "../Components/Clients/ClientsPage";
import ProjectsPage from "../Components/Projects/ProjectsPage"
import HolidaysPage from "../Components/Holidays/HolidaysPage";
import AttendancePage from "../Components/Attendance/AttendancePage";
import Invite from "../Components/invite";
import InvitationList from "../Components/invite/invitationslist"
import MemberSignUp from "../Components/Auth/MemberSignup";
import InvoicePage from "../Components/Invoice/InvoicePage";
import ReportsPage from "../Components/Reports/ReportsPage";
import TimeTrackingPage from "../Components/TimeTracking/TimeTrackingPage";
import SettingPage from "../Components/Settings/SettingPage";
import DashboardPage from "../Components/Dashboard/DashboardPage";
import DesktopPage from "../Components/Desktop/DesktopPage";
import ManualTime from "../Components/Reports/ManualTime";
import PlansPage from "../Components/subscriptions/Plans";
const commonRouter = [
    {
        type: 'page',
        name: 'invite',
        key: 'INVITE',
        component: <Invite />,
        route: '/accept-invite/:token'
    },
    {
        type: 'page',
        name: 'membersignup',
        key: 'MEMBERSIGNUP',
        component: <MemberSignUp />,
        route: '/member-signup/:token'
    },
]
const publicRoutes = [
    ...commonRouter,
    {
        type: 'page',
        name: 'Login',
        key: 'LOGIN',
        component: <LoginPage/>,
        route: '/',
    },
    {
        type: 'page',
        name: 'Login',
        key: 'LOGIN',
        component: <LoginPage/>,
        route: '/login',
    },
    {
        type: 'page',
        name: 'Signup',
        key: 'SIGNUP',
        component: <SignUpPage/>,
        route: '/signup',
    },
    {
        type: 'page',
        name: 'Forgot',
        key: 'FORGOT_PASSWORD',
        component: <ForgotPassword/>,
        route: '/forgot-password',
    },
    {
        type: 'page',
        name: 'Reset',
        key: 'RESET_PASSWORD',
        component: <ResetPassword/>,
        route: '/reset-password/:token',
    },
    {
        type: 'page',
        name: 'Account Setup',
        key: 'ACCOUNT_SETUP',
        component: <AccountSetup/>,
        route: '/account-setup/:token',
    },
    {
        type: "other",
        name: 'Un Match',
        key: 'UN_MATCH',
        component: <Navigate to="/login" />,
        route: "*"
    },
    {
        type: 'page',
        name: 'Onteams',
        key: 'ONTEAMS',
        component: <DesktopPage/>,
        route: '/onteamsio',
    },
];

const privateRoutes = [
    ...commonRouter,
    
    {
        type: "other",
        name: 'Un Match',
        key: 'UN_MATCH',
        component: <Navigate to="/dashboard" />,
        route: "*"

    },
    {
        type: 'page',
        name: 'Manual Time Approve',
        key: 'MANUAL_TIME_APPROVE',
        component: <ManualTime />,
        route: '/manual-time'
    },
    {
        type: 'page',
        name: 'Account Setup',
        key: 'ACCOUNT_SETUP',
        component: <AccountSetup/>,
        route: '/account-setup/:token',
    },
    {
        type: 'page',
        name: 'Workspace Setup',
        key: 'WORKSPACE_SETUP',
        component: <WorkspaceSetup/>,
        route: '/workspace-setup',
    },
    {
        type: 'page',
        name: 'Workspace',
        key: 'WORKSPACE',
        component: <Workspace/>,
        route: '/workspace',
    },
    {
        type: 'page',
        name: 'Team Members',
        key: 'TEAM_MEMBERS',
        component: <TeamMembersPage/>,
        route: '/team-members',
        module: 'members'
    },
    {
        type: 'page',
        name: 'Clients',
        key: 'CLIENTS',
        component: <ClientsPage/>,
        route: '/clients',
        module: 'clients'
    },
    {
        type: 'page',
        name: 'Projects',
        key: 'PROJECTS',
        component: <ProjectsPage/>,
        route: '/projects',
        module: 'projects'
    },
    {
        type: 'page',
        name: 'Invitations',
        key: 'INVITATIONS',
        component: <InvitationList/>,
        route: '/invitations',
    },
    {
        type: 'page',
        name: 'Holidays',
        key: 'HOLIDAYS',
        component: <HolidaysPage/>,
        route: '/holidays',
        module: 'holidays'
    },
    {
        type: 'page',
        name: 'Attendance',
        key: 'ATTENDANCE',
        component: <AttendancePage/>,
        route: '/attendance',
        module: 'attendance'
    },
    {
        type: 'page',
        name: 'Invoice',
        key: 'INVOICE',
        component: <InvoicePage/>,
        route: '/invoice',
    },
    {
        type: 'page',
        name: 'Reports',
        key: 'REPORTS',
        component: <ReportsPage/>,
        route: '/reports',
        module: 'reports'
    },
    {
        type: 'page',
        name: 'Time Tracking',
        key: 'TIME_TRACKING',
        component: <TimeTrackingPage/>,
        route: '/time-tracking',
        module: 'tracking'
    },
    {
        type: 'page',
        name: 'Setting',
        key: 'SETTING',
        component: <SettingPage/>,
        route: '/setting',
    },
    {
        type: 'page',
        name: 'Dashboard',
        key: 'DASHBOARD',
        component: <DashboardPage/>,
        route: '/dashboard',
    },
    {
        type: 'page',
        name: 'Onteams',
        key: 'ONTEAMS',
        component: <DesktopPage/>,
        route: '/onteamsio',
    },
    {
        type: 'page',
        name: 'Plans',
        key: 'PLANS',
        component: <PlansPage />,
        route: '/plans'
    }
];
const hideSidebarRoutes = [
    '/login',
    '/signup',
    '/',
    '/forgot-password',
    '/404',
    '/reset-password/:token',
    '/account-setup/:token',
    '/accept-invite/:token',
    '/member-signup/:token'
]

export { publicRoutes, privateRoutes, hideSidebarRoutes };