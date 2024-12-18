/**
 *  Defined Each API URL as keys to use in project
 */
const apiKeys = {
    login: "/auth/login",
    register: "/auth/register",
    memberRegister: "/auth/member-register",
    account_setup: "/auth/account_setup",
    otpRequest:'/auth/otp/request',
    user_workspaces: '/auth/workspaces',
    emailverifyRequest: '/auth/email-verify/',
    otpverify:'/auth/otp/verify',
    resetPassword:'/auth/password/reset',
    project: "/projects",
    task: "/tasks",
    member: "/members",
    client: "/clients",
    forgotpassword: "auth/forgot-password",
    checkmail: '/members/checkmail',
    leavecompany: '/members/leave-company',
    invites: '/invites',
    workspace: '/workspace',
    company_member_data: '/members/single-member',
    roles: '/roles',
    ownership: '/workspace/transfer',
    workflow: '/workflows',
    activity: '/activity',
    profile: 'auth/profile',
    holidays: '/holidays'
};
  
export default apiKeys;