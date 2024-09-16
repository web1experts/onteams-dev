import React, { useState, useEffect } from 'react';
import { CLEAR_MESSAGES } from '../../redux/actions/types';
import { useDispatch, useSelector } from "react-redux";
import { getSingleMemberByUserAndCompanyId, Listmembers } from '../../redux/actions/members.action';
import { useToast } from '../../context/ToastContext';
import { setAuthorization } from '../../helpers/api';
import { setupDashboards } from '../../helpers/auth';
import { REFRESH_DASHBOARDS } from '../../redux/actions/types';
export default function ToastAlerts() {
    const addToast = useToast();
    const apiResultAuth = useSelector(state => state.auth);
    const apiResultMember = useSelector(state => state.member);
    const apiResultProject = useSelector(state => state.project);
    const apiResultClient = useSelector(state => state.client);
    const workspace = useSelector(state => state.workspace)
    const dispatch = useDispatch();
    const { currentMember } = useSelector(state => state.member);
    const [loggedIn, setLoggedIn] = useState(false);

    const refreshDashboards = () => ({
      type: REFRESH_DASHBOARDS,
    });
  

    useEffect(() => {

      const handleMessages = async () => {

      }

      if(
         apiResultAuth.token_msg && apiResultAuth.token_msg !== "" ){ 
          addToast(apiResultAuth.token_msg, 'danger');
          handleClearMessages()
      }
      if( apiResultAuth.message ){ 
          addToast(apiResultAuth.message, apiResultAuth.message_variant);
        handleClearMessages()
      }
        // if( apiResultAuth.error ){ 
        //     addToast(apiResultAuth.message, 'danger');
        //     handleClearMessages()
          
        // }
        // if(workspace.error){console.log("workspace")
        //     addToast(workspace.message, 'danger');
        //   handleClearMessages()
          
        // }
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
        
        // if(apiResultProject.error){
        //     addToast(apiResultProject.message, 'danger');
        //   handleClearMessages()
        // }
    
        // if(apiResultClient.error){
        //     addToast(apiResultClient.message, 'danger');
        //   handleClearMessages()
        // }
    
        if(apiResultMember.message){
          
            addToast(apiResultMember.message, apiResultMember.message_variant)

            if( apiResultMember.invite){
              dispatch(refreshDashboards());
            }
            handleClearMessages()
        }
      //   if(apiResultMember.error){ console.log("member")
      //     addToast(apiResultMember.message, 'danger');
      //     handleClearMessages()
      // }
      
        if(apiResultClient.message){
            addToast(apiResultClient.message, apiResultClient.message_variant);
          handleClearMessages()
        }
        if(apiResultProject.message){
            addToast(apiResultProject.message, apiResultProject.message_variant);
            handleClearMessages()
        }
    
      },[apiResultMember, apiResultProject, apiResultAuth, apiResultClient, workspace, currentMember, loggedIn, dispatch]);

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