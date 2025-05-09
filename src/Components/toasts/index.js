import React, { useState, useEffect } from 'react';
import { CLEAR_MESSAGES } from '../../redux/actions/types';
import { useDispatch, useSelector } from "react-redux";
import { getSingleMemberByUserAndCompanyId, Listmembers } from '../../redux/actions/members.action';
import { useToast } from '../../context/ToastContext';
import { setAuthorization } from '../../helpers/api';
import { REFRESH_DASHBOARDS } from '../../redux/actions/types';
export default function ToastAlerts() {
    const addToast = useToast();
    const apiResultAuth = useSelector(state => state.auth);
    const apiResultMember = useSelector(state => state.member);
    const apiResultProject = useSelector(state => state.project);
    const apiResultClient = useSelector(state => state.client);
    const workspace = useSelector(state => state.workspace)
    const apiResultTask = useSelector(state => state.task);
    const apiResultHoliday = useSelector( state => state.holiday);
    const apiPermission = useSelector( state => state.permissions)
    const dispatch = useDispatch();
    const { currentMember } = useSelector(state => state.member);
    const reportState = useSelector((state) => state.reports)
    const [loggedIn, setLoggedIn] = useState(false);

    const refreshDashboards = () => ({
      type: REFRESH_DASHBOARDS,
    });
  

    useEffect(() => {
      if(
         apiResultAuth.token_msg && apiResultAuth.token_msg !== "" ){ 
          addToast(apiResultAuth.token_msg, 'danger');
          handleClearMessages()
      }
      if(reportState.message ){ 
          addToast(reportState.message, reportState.message_variant);
          handleClearMessages()
      }
      if( apiResultAuth.message ){ 
          addToast(apiResultAuth.message, apiResultAuth.message_variant);
        handleClearMessages()
      }
        
        if( workspace.message ){ 
            addToast(workspace.message, workspace.message_variant);
            handleClearMessages()
            
        }

        if( workspace.success){
          dispatch(refreshDashboards());
          setAuthorization()
          dispatch(Listmembers())
          dispatch(getSingleMemberByUserAndCompanyId())
        }
        
      
        if(apiResultMember.message){
          
            addToast(apiResultMember.message, apiResultMember.message_variant)

            if( apiResultMember.invite){
              dispatch(refreshDashboards());
            }
            handleClearMessages()
        }

        if(apiPermission.message){
          
          addToast(apiPermission.message, apiPermission.message_variant)

          handleClearMessages()
        }
      
      
        if(apiResultClient.message){
            addToast(apiResultClient.message, apiResultClient.message_variant);
          handleClearMessages()
        }
        if(apiResultProject.message){
            addToast(apiResultProject.message, apiResultProject.message_variant);
            handleClearMessages()
        }
        if(apiResultTask.message){
          addToast(apiResultTask.message, apiResultTask.message_variant);
          handleClearMessages()
        }
        if(apiResultHoliday.message){
          addToast(apiResultHoliday.message, apiResultHoliday.message_variant);
          handleClearMessages()
        }
    
      },[apiResultMember,reportState, apiResultProject, apiResultAuth, apiResultClient, workspace, currentMember, loggedIn, apiResultTask,apiResultHoliday,apiPermission, dispatch]);

      const clearMessages = () => ({
        type: CLEAR_MESSAGES,
    });
    
      const handleClearMessages = async () => {
        //setTimeout(async function(){
            await dispatch(clearMessages());
       // }, 2500)
       
    };

    return null;
  
}