import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { updateOwnership } from '../../redux/actions/workspace.action';
import useFilledClass from "../customHooks/useFilledclass";
import {updateProject} from "../../redux/actions/project.action"
import { Button, Modal, Form, ListGroup, FloatingLabel, Dropdown } from "react-bootstrap";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { FaCheck, FaPlusCircle, FaTimesCircle, FaUpload, FaRegTrashAlt, FaEllipsisV, FaTrashAlt, FaRegTimesCircle } from "react-icons/fa";
import fileIcon from './../../images/file-icon-image.jpg'
import { ListWorkflows } from '../../redux/actions/workflow.action';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { updateStateData, togglePopups } from '../../redux/actions/common.action';
import { updateTask } from '../../redux/actions/task.action';
import { PROJECT_FORM, EDIT_PROJECT_FORM } from '../../redux/actions/types';
import { MdFileDownload } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { MdArrowDownward } from "react-icons/md";
import { GrDrag } from "react-icons/gr";
import { dataObject } from '../../helpers/objectdata';
import { useDropzone } from 'react-dropzone'
export function AlertDialog(props) {
  const [open, setOpen] = useState(false);
  const [ loader, setLoader ] = useState(false);
  useFilledClass('.form-floating .form-control');
  useEffect(() => {
    setOpen( props.showdialog )
    setLoader( false )
  },[ props.showdialog])

  const handleClose = () => {
    setOpen(false);
    props.toggledialog( false )
  };

  const handleagree = () =>{
    setLoader( true )
    props.callback()
    // props.toggledialog( false )
  }

  return (
    <Modal
        show={open}
        onHide={handleClose}
        centered
        size="md"
        className="add--member--modal"
    >
        <Modal.Header closeButton>
          <Modal.Title>{props.msg}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={handleClose}>Disagree</Button>
          <Button variant="primary" disabled={loader} onClick={handleagree}>
            { loader ? 'Please wait...' : 'Agree' }
          </Button>
        </Modal.Footer>
      </Modal>
    );
}

export function TransferOnwerShip(props) { 
  useFilledClass('.form-floating .form-control');
  const [open, setOpen] = React.useState(false );
  const [selectedmember, setSelectedmember] = useState(false )
  const currentMember  =  props?.currentMember || {} 
  const [ loader, setLoader ]= useState( false )
  const workspace = useSelector(state => state.workspace)
  const dispatch = useDispatch()
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    props.toggledialog( false )
    setOpen(false);
  };

  const handleMemberChange = ({ target: { name, value } }) => {
    setSelectedmember( value )
  }

  useEffect(() => {
    if( props.showdialog ){
      handleOpen()
    }
  },[ props.showdialog])

  useEffect(() => {
    if( workspace.success ){ 
      handleClose()
    }
  },[workspace])

  const saveOwnership = () => {
    dispatch( updateOwnership({ memberId: selectedmember, companyId: currentMember?.company?._id, removeMemberId: currentMember._id}))
  }

  return (
    <React.Fragment>
      <div className=''>
      <Modal
        show={open}
        onHide={handleClose}
        size="md"
        className="ownwerChildModal"
        onShow={() => selectboxObserver()}
      >
        <Modal.Header closeButton>
          <Modal.Title>Transfer Ownership</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          
          <div className='modalBody'>
           <div className='setStatusWrapper'>
              <form>
                  <div className='modalRow'>
                      <div className='modalCol'> 
                      {
                        props.members && props.members.length > 0 ?
                        <>
                        <div className='form-group'>
                        <label id="demo-simple-select-required-label">Select a member</label>
                        <Form.Select className="form-control custom-selectbox" id="members"
                          value={selectedmember} onChange={handleMemberChange} name="member">
                        
                          {
                            props.members.map(member => (
                              <option value={member._id}>{member.name}</option>
                            ))
                          }
                        </Form.Select>
                        </div>
                        <div>
                        <Button className='primary btn' onClick={saveOwnership} disabled={loader} >{ loader ? 'Please wait..' : 'Transfer'}</Button>
                        </div>
                        </>
                        :
                        <>
                          <h5>
                            You don't have any members.
                        </h5>
                        </>
                      }
                      </div>
                  </div>
              </form>
          </div>
          </div>
          </Modal.Body>
      </Modal>
      </div>
    </React.Fragment>
  );
}

export function StatusModal(props){
  const modalstate = useSelector(state => state.common.statusModal);
  const commonState = useSelector( state => state.common)
  useFilledClass('.form-floating .form-control');
  const [search, setSearch] = useState('');
  const dispatch = useDispatch()
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const refreshstates = (formtype) => { 
    switch (formtype) {
      case 'project':
        const stateObject = {}
        stateObject['status'] = commonState.projectForm.status
        stateObject['formtype'] = formtype
       return stateObject
       
      case 'edit_project':
        
        
        const editstateObject = {}
        editstateObject['status'] = commonState.editProjectForm.status || "in-progress"
        editstateObject['title'] = commonState.editProjectForm.title
        editstateObject['formtype'] = formtype
        
       return editstateObject
    }
  }

  const [statusModalState, setStatusModalState] = useState({})

  const statuses = [
    { key: 'in-progress', label: 'In Progress', circleClass: 'progress--circle' },
    { key: 'on-hold', label: 'On Hold', circleClass: 'hold--circle' },
    { key: 'completed', label: 'Completed', circleClass: 'complete--circle' },
  ];

  const filteredStatuses = statuses.filter(status => 
    status.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if( commonState.active_formtype === "project"){ 
      const updatedState = refreshstates(commonState.active_formtype);
      console.log('yhjaa: ', updatedState)
        setStatusModalState(updatedState);
    }else if( commonState.active_formtype === "edit_project"){
      const updatedState = refreshstates(commonState.active_formtype);
      setStatusModalState(updatedState);
    }
  },[ commonState.projectForm, commonState.editProjectForm])

  

  return (
    <>
      {/*--=-=Status Modal**/}
      <Modal show={modalstate} onHide={() => { dispatch( togglePopups('status', false ))}} centered size="md" className="status--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Set Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Control type="text" placeholder="Search here" value={search} onChange={handleSearchChange} />
                        </Form.Group>
                    </Form>
                    <ListGroup className="status--list">
                    {
                      filteredStatuses.map(status => (
                        <ListGroup.Item key={`status-${status.key}`} className={statusModalState?.status == status.key ? "status--active": ""} onClick={() => {
                          
                          if(statusModalState?.formtype === 'project'){ 
                            dispatch( updateStateData(PROJECT_FORM, { 'status': status.key} ))
                           
                          }else if(statusModalState?.formtype === 'edit_project'){ 
                            if( commonState?.directUpdate === true){
                              dispatch( updateProject(commonState?.currentProject?._id, { 'status': status.key} ))
                            }else{
                              dispatch( updateStateData(EDIT_PROJECT_FORM, { 'status': status.key} ))
                            }
                            
                           
                          }else if(statusModalState?.formtype === 'task'){

                          }
                          dispatch(togglePopups('status', false))
                          }}>
                            <span className={`${status.circleClass} status--circle`}></span>
                            <p>{status.label} {statusModalState?.status === status.key && <FaCheck />}</p>
                        </ListGroup.Item>
                       ))}
                        
                    </ListGroup>
                </Modal.Body>
            </Modal>
    </>
  )
}

export function MemberModal( props){
  const modalstate = useSelector(state => state.common.membersModal);
  const commonState = useSelector( state => state.common);
  const currentTask = useSelector( state => state.task.currentTask);
  const [ members, setMembers ] = useState(commonState.allmembers)
  const currentProject = useSelector(state => state.common.currentProject);
  const [formtype, setFormType] = useState(commonState.active_formtype || false)
  const [showAssign, setAssignShow] = useState(false);
  const dispatch = useDispatch()
  const [selectedMembers, setSelectedMembers] = useState({});
  const [search, setSearch] = useState('');
  const [isEdit, setIsEdit] = useState(false)

  const refreshstates = (formtype) => {
    const stateObject = {selectedMembers: {}}
    switch (formtype) {
      case 'project':
        
        const curerntmembers = Object.keys(commonState.projectForm.members || {})
        stateObject['selectedMembers'] = commonState.allmembers.reduce((acc, member) => {
          // Check if the member ID is present in `commonState.projectForm.members`
         
          if (curerntmembers.includes(member._id)) {
            // Add the member to the result object with `id` as key and `name` as value
            acc[member._id] = member.name;
          }
          return acc;
        }, {});
       return stateObject
        break;
      case 'edit_project':
        const editcurerntmembers = Object.keys(commonState.editProjectForm.members || {})
          stateObject['selectedMembers'] = commonState.allmembers.reduce((acc, member) => {
            // Check if the member ID is present in `commonState.projectForm.members`
          
            if (editcurerntmembers.includes(member._id)) {
              // Add the member to the result object with `id` as key and `name` as value
              acc[member._id] = member.name;
            }
            return acc;
          }, {});
          
        return stateObject
      case 'task_edit':
        const curernttaskmembers = Object.keys(commonState.taskForm.members || {})
        stateObject['selectedMembers'] = commonState.allmembers.reduce((acc, member) => {
          // Check if the member ID is present in `commonState.projectForm.members`
         
          if (curernttaskmembers.includes(member._id)) {
            // Add the member to the result object with `id` as key and `name` as value
            acc[member._id] = member.name;
          }
          return acc;
        }, {});
       return stateObject
          
    }
  }

  const [membersModalState, setMembersModalState] = useState(refreshstates(commonState.active_formtype || false))


  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => { 
    if( modalstate === true ){
      setMembersModalState(refreshstates(commonState.active_formtype))
    }
    
  },[ modalstate])

  useEffect(() => {
    setMembersModalState(refreshstates(commonState.active_formtype))
  },[ commonState?.projectForm?.members, commonState?.editProjectForm?.members])

  
  let filteredMembers = commonState.allmembers

    if(commonState.allmembers && commonState.allmembers.length > 0){
      filteredMembers = commonState.allmembers.filter(member => 
        member.name.toLowerCase().includes(search.toLowerCase())
      );
    }
 
  useEffect(() => {
    setAssignShow(modalstate)
  }, [modalstate])



  useEffect(() => {
    setIsEdit(commonState.assign_members_direct)
},[commonState.assign_members_direct])

  useFilledClass('.form-floating .form-control');
  const handleDone = () => {
    
    if( commonState.active_formtype === "edit_project" && currentProject && Object.keys(currentProject).length > 0 && isEdit === true){
      const memberIds = Object.keys(membersModalState.selectedMembers);
      dispatch(updateProject(currentProject._id, { members: memberIds }))
    }else if( commonState.active_formtype === "task_edit" && currentTask && Object.keys(currentTask).length > 0){ 
      const memberIds = Object.keys(membersModalState.selectedMembers);
      dispatch(updateTask(currentTask._id, { members: memberIds }))
    }else{
      if( dataObject[commonState.active_formtype]){
        dispatch(updateStateData(dataObject[commonState.active_formtype]['state_key'], {
          ...commonState[dataObject[commonState.active_formtype]['form_key']],
          members: membersModalState.selectedMembers // Set the array of member IDs
        }));
      }
    }
    dispatch( togglePopups( 'members', false ))
  };

  const handleMemberSelect = (member) => {
    const isMemberSelected = membersModalState?.selectedMembers?.[member._id];
  
    if (!isMemberSelected) {
      // Add the member if not selected
      handleAddMember(member);
    } else {
      // Remove the member if already selected
      handleRemove(member._id);
    }
  };
  
  const handleAddMember = (member) => {
    setMembersModalState(prevMembersModalState => ({
      ...prevMembersModalState,
      selectedMembers: {
        ...prevMembersModalState?.selectedMembers,
        [member._id]: member.name
      }
    }));
  };
  
  const handleRemove = (memberId) => {
    setMembersModalState(prevMembersModalState => {
      const updatedSelectedMembers = { ...prevMembersModalState.selectedMembers };
      delete updatedSelectedMembers[memberId];
  
      return {
        ...prevMembersModalState,
        selectedMembers: updatedSelectedMembers
      };
    });
  };
  
  
  return (
    
    <Modal show={showAssign} onHide={() => {setSelectedMembers({});dispatch(togglePopups('members', false))}} centered size="md" className="status--modal assign--task--modal">
      <Modal.Header closeButton>
          <Modal.Title>Assign task to</Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <Form>
              <Form.Group>
                <FloatingLabel label="Search here">
                  <Form.Control type="text" placeholder="Search here"  value={search} onChange={handleSearchChange} />
                </FloatingLabel>
              </Form.Group>
          </Form>
          <ListGroup className="added--list">
          {membersModalState?.selectedMembers && Object.keys(membersModalState?.selectedMembers).length > 0 &&
            Object.entries(membersModalState.selectedMembers).map(([id, name], index) => (
                <ListGroup.Item key={`listkey-${index}`} onClick={() => handleRemove(id)}>
                    <span><img src="../images/default.jpg" alt="" /></span>
                    <p>{name} <FaTimesCircle /></p>
                </ListGroup.Item>
            ))
          }

          </ListGroup>
          <ListGroup className="status--list">
            {filteredMembers && filteredMembers.length > 0 && (
              filteredMembers.map((member) => (
                <ListGroup.Item  
                  key={member?._id || `listkey-${member.name}`} 
                  onClick={() => handleMemberSelect(member)} 
                  className={membersModalState?.selectedMembers?.[member?._id] ? "status--active" : ""}
                >
                  <span>
                    <img src={member?.avatar || '../images/default.jpg'} alt={member?.name || 'Default'} />
                  </span>
                  <p>{ member?.name } 
                    {membersModalState?.selectedMembers?.[member?._id] && <FaCheck />}
                  </p>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>

      </Modal.Body>
      <Modal.Footer>
          <Button variant="primary" onClick={handleDone}>Done</Button>
      </Modal.Footer>
  </Modal>
  )
}

export const  WorkFlowModal =  (props) => {
  const dispatch = useDispatch()
  const modalstate = useSelector(state => state.common.workflowmodal);
  const commonState = useSelector( state => state.common)
  const [formtype, setFormType] = useState(commonState.active_formtype || false)
  const [showWorkflow, setWorkflowShow] = useState(false);
  const [fields, setFields] = useState({})
  const [ error, setErrors ] = useState({})
  const [showEdit, setEditShow] = useState(false);
  const [showAdd, setAddShow] = useState(false);
  const [ workflows, setWorkflows] = useState([])
  const [currentflow, setCurrentflow ] = useState(false )
  const [ selectedWorkflow, setSelectedWorkflow] = useState({})
  const[ filteredWorkflows , setFilteredWorkflows ] = useState([])
  const workflowstate = useSelector(state => state.workflow)
  const [search, setSearch] = useState('');
  const [ selectedTab, setSelectedTab] = useState({})

  const refreshstates = (formtype) => {
    const stateObject = {}
    switch (formtype) {
      case 'project':
        if( !commonState.projectForm.workflow){ 
          if( filteredWorkflows.length > 0){
            setCurrentflow(filteredWorkflows[0])
            dispatch(updateStateData( PROJECT_FORM, { workflow: filteredWorkflows[0]}))
          }
        }
        stateObject['workflow'] = commonState.projectForm.workflow || {}
       
       return stateObject
      case 'edit_project':
        stateObject['workflow'] = commonState.editProjectForm.workflow || {}
        
       return stateObject
      break;
      default:
        return {}
    }
  }

  const [workflowModalState, setWorkflowModalState] = useState(refreshstates(commonState.active_formtype || false))

  // Memoize handlers to prevent unnecessary re-creations
  const handleWorkflowClose = useCallback(() => {
    dispatch( togglePopups( 'workflow', false ))
  })
    
  const handleWorkflowShow = useCallback(() => setWorkflowShow(true), []);
  const handleEditClose = useCallback(() => setEditShow(false), []);
  const handleEditShow = useCallback((index,tab) => { setSelectedTab({index, tab}); setFields({...fields, 'workspace_title': tab}); setEditShow(true)}, []);
  const handleAddClose = useCallback(() => setAddShow(false), []);
  const handleAddShow = useCallback(() => setAddShow(true), []);

  useEffect( () => {
    dispatch(ListWorkflows())
  }, [])

  useEffect(() => { 
    if( modalstate === true ){ 
      if( commonState.active_formtype === "edit_project"){ 
        setCurrentflow( commonState.currentProject?.workflow)
        
      }
      
      const updatedState = refreshstates(commonState.active_formtype);
      setWorkflowModalState(updatedState);
      setWorkflowShow(modalstate)
    }
  }, [modalstate])

  useEffect(() => {
    if( workflowstate && workflowstate.workflows && workflowstate.workflows.length > 0){
      setWorkflows( workflowstate.workflows )
      setFilteredWorkflows(workflowstate.workflows)
    }
  }, [ workflowstate ])

  const handleChange = ({ target: { name, value} }) => {
    setFields({ ...fields, [name]: value });
    setErrors({ ...error, [name]: '' })
  };  

  const handleSelectworkflow = (workflow) => {
    setWorkflowModalState(prevWorkflowModalState => {
     
        return {
          ...prevWorkflowModalState,
          workflow: workflow
        };
      
    });
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    let filteredflows = [];
    if( workflows && workflows.length > 0 ){ 
      filteredflows = workflows.filter(workflow => 
        workflow.title.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredWorkflows(filteredflows)
    }
  };

  const handleSelect = () => {
    if( commonState.active_formtype === "edit_project"){
      if( commonState?.directUpdate === true){
        dispatch( updateProject(commonState?.currentProject?._id, { 'workflow': JSON.stringify(workflowModalState['workflow']) }) )
      }else{
        dispatch(updateStateData( EDIT_PROJECT_FORM, { workflow: workflowModalState['workflow']}))
      }
      
    }else{
      dispatch(updateStateData( PROJECT_FORM, { workflow: workflowModalState['workflow']}))
    }
    
    dispatch( togglePopups('workflow', false))
  }

    const saveWorkstep = (e) => {
      e.preventDefault();
    
      // Check if the workspace title field is empty
      if (!fields['workspace_title'] || fields['workspace_title'] === "") {
        setErrors({ ...error, ['workspace_title']: 'Title is required' });
        return; // Exit the function if the title is not valid
      }
    
      // Get the last tab and its order based on the type (object or simple array)
      const lastTab = workflowModalState?.workflow?.tabs.length 
        ? workflowModalState?.workflow?.tabs[workflowModalState?.workflow?.tabs.length - 1] 
        : null;
    
      const lastOrder = (typeof lastTab === 'object' && lastTab?.order !== undefined)
        ? lastTab.order
        : workflowModalState?.workflow?.tabs.length - 1; // Fallback to length-based index if tabs are a simple array
    
      const newOrder = lastTab ? lastOrder + 1 : 0; // Set the order for the new tab
    
      // Create the new tab object
      const newTab = (typeof lastTab === 'object' && lastTab !== null) ? {
        title: fields['workspace_title'],
        _id: false,
        order: newOrder,
      } : fields['workspace_title']; // Use simple title if tabs is a simple array
    
      // Insert the new tab before the last tab
      const updatedTabs = Array.isArray(workflowModalState?.workflow?.tabs)
        ? [
            ...workflowModalState?.workflow?.tabs.slice(0, -1), // All tabs except the last one
            newTab, // Insert the new tab
            lastTab // Add the last tab
          ]
        : [newTab]; // If tabs is empty, start with just the new tab
    
      
    
      // Update the state with the new array
      setWorkflowModalState(prevWorkflowModalState => ({
        ...prevWorkflowModalState,
        workflow: {
          ...prevWorkflowModalState?.workflow,
          tabs: updatedTabs.map((tab, index) => {
            // If tab is an object, update its order; otherwise, return simple tab
            return typeof tab === 'object'
              ? { ...tab, order: index }
              : tab;
          }) // Ensure correct order sequence
        }
      }));
    
      // Reset modal state
      setAddShow(false);
      setFields({});
      setErrors({});
    };
    

    const updateWorkstep = (e) => {
      e.preventDefault();
    
      // Validation for workspace title
      if (!fields['workspace_title'] || fields['workspace_title'] === "") {
        setErrors({ ...error, ['workspace_title']: 'Title is required' });
        return; // Exit if title is missing
      }
    
      // Update workflow modal state
      setWorkflowModalState((prevWorkflowModalState) => {
        // Update the tabs by mapping through the current ones
        const updatedTabs = prevWorkflowModalState?.workflow?.tabs.map((tab, index) => {
          // If the index matches the selected tab, update the title
          if (index === selectedTab?.index) {
            if (typeof tab === 'object' && tab !== null) {
              // Return updated object with the new title
              return { ...tab, title: fields['workspace_title'] };
            } else {
              // Return updated simple value (for string or non-object tabs)
              return fields['workspace_title'];
            }
          }
          // Return the original tab if not the selected one
          return tab;
        });
    
        // Return the new state with updated tabs
        return {
          ...prevWorkflowModalState,
          workflow: {
            ...prevWorkflowModalState?.workflow,
            tabs: updatedTabs.map((tab, index) => {
              // Ensure correct order sequence, but only for object tabs
              if (typeof tab === 'object' && tab !== null) {
                return { ...tab, order: index };
              }
              // Return the tab unchanged if it's not an object
              return tab;
            }),
          },
        };
      });
    
      // Reset state and errors
      setEditShow(false);
      setFields({});
      setErrors({});
    };
    

  const showError = (name) => {
    if (error[name]) return (<span className="error">{error[name]}</span>)
    return null
  }

  const handleDragEnd = (result) => {
    const { source, destination } = result;
  
    // Do nothing if dropped outside the list
    if (!destination || destination.index === source.index) return;

    const isDropInvalid =
      destination.index === 0 || destination.index === workflowModalState?.workflow.tabs.length - 1;

    if (isDropInvalid) return;
  
    // Rearrange the array based on drag result
    const reorderedTabs = Array.from(workflowModalState?.workflow.tabs);
    const [removed] = reorderedTabs.splice(source.index, 1);
    reorderedTabs.splice(destination.index, 0, removed);
  
    // Check if reorderedTabs is an array of objects
    if (typeof reorderedTabs[0] === 'object' && reorderedTabs[0] !== null) {
      // Update the order key for each tab
      reorderedTabs.forEach((tab, index) => {
        tab.order = index; // Update the order key based on position
      });
    }
  
    setWorkflowModalState(prevWorkflowModalState => {
     
      return {
        ...prevWorkflowModalState,
        workflow: {
          ...prevWorkflowModalState?.workflow,
          tabs: reorderedTabs // Update all orders to ensure correct order sequence
        }
      };
    
    });
  };

  const removetab = (indexToRemove) => {
    // Update workflow modal state
    setWorkflowModalState((prevWorkflowModalState) => {
      // Filter out the tab that matches the provided index
      const updatedTabs = prevWorkflowModalState?.workflow?.tabs
        .filter((_, index) => index !== indexToRemove) // Remove the tab with the matching index
        .map((tab, index) => {
          // Reorder the remaining tabs, ensuring correct order sequence
          if (typeof tab === 'object' && tab !== null) {
            return { ...tab, order: index };
          }
          return tab; // Return the tab unchanged if it's not an object
        });
  
      // Return the new state with updated and reordered tabs
      return {
        ...prevWorkflowModalState,
        workflow: {
          ...prevWorkflowModalState?.workflow,
          tabs: updatedTabs, // Set the reordered tabs array
        },
      };
    });
  };
  
  return (
    <>      
      <Modal show={modalstate} onHide={handleWorkflowClose} centered size="lg" className="add--workflow--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Workflows</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  { commonState.active_formtype !== "edit_project" &&
                        <Form.Group className="mb-3 form-group">
                            <Form.Label>Select Workflow</Form.Label>
                            <Dropdown className="select--dropdown">
                                <Dropdown.Toggle variant="success">
                                  { 
                                    workflowModalState?.workflow?._id && workflowModalState?.workflow?._id === currentflow?._id ? 
                                      'Current Workflow'
                                    :
                                    workflowModalState?.workflow && workflowModalState?.workflow?._id ?
                                      <>
                                      {workflowModalState?.workflow?.title}
                                      </>
                                    :
                                    'Select'
                                  }

                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <div className="drop--scroll">
                                        <Form>
                                            <Form.Group className="form-group mb-3">
                                                <Form.Control type="text" placeholder="Search here.."  value={search} onChange={handleSearchChange} />
                                            </Form.Group>
                                        </Form>
                                        {
                                          currentflow && currentflow?._id && commonState.active_formtype === "edit_project" &&
                                          <Dropdown.Item key={`currentflow`} onClick={() => handleSelectworkflow(currentflow)} className={ (workflowModalState?.workflow && workflowModalState?.workflow?._id === currentflow?._id ) ? 'selected--option' : ''} > Current Workflow { (workflowModalState?.workflow && workflowModalState?.workflow?._id === currentflow?._id ) ? <FaCheck /> : null }</Dropdown.Item>
                                        }

                                        {
                                          filteredWorkflows.length > 0 &&
                                          filteredWorkflows.map(workflow => (
                                            <Dropdown.Item key={`flow-${workflow?._id}`} onClick={() => handleSelectworkflow(workflow)} className={ (workflowModalState?.workflow && workflowModalState?.workflow?._id === workflow._id ) ? 'selected--option' : ''} >{workflow.title} { (workflowModalState?.workflow && workflowModalState?.workflow?._id === workflow._id ) ? <FaCheck /> : null }</Dropdown.Item>
                                          ))
                                        }
                                    </div>
                                </Dropdown.Menu>
                            </Dropdown>
                           
                        </Form.Group>
                      }
                        <Form.Group className="mb-0 form-group" >
                            <Form.Label><strong>Taskboard setup</strong></Form.Label>
                            <p>Add, remove, reorder and rename the worksteps to reflect the way you work.</p>
                            {
                              workflowModalState?.workflow && Object.keys(workflowModalState?.workflow).length > 0 && showWorkflow &&
                            <>
                              <ListGroup className='workflow--list'>
                                <DragDropContext onDragEnd={handleDragEnd}>
                                  <Droppable droppableId="droppabletabs" type="droppableTabsItem" direction="horizontal">
                                    {(provided) => (
                                      <ListGroup
                                        className="workflow--list"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                      >
                                        {Object.keys(workflowModalState?.workflow).length > 0 && workflowModalState?.workflow?._id && workflowModalState?.workflow?.tabs?.length > 0 &&
                                          workflowModalState?.workflow?.tabs.map((tab, index) => (
                                           <>
                                           {index == 1 && (
                                              <ListGroup.Item className='border-0 justify-content-center pt-0 pb-0 arrow--icon'>
                                                <MdArrowDownward />
                                              </ListGroup.Item>
                                            )}
                                           {index === workflowModalState?.workflow?.tabs.length - 1 && (
                                              <>
                                              <ListGroup.Item className='border-0 justify-content-center pt-0 pb-0' key={`addflow-btn`}>
                                                <Button variant="primary" onClick={handleAddShow}><FaPlusCircle /> Add New</Button>
                                              </ListGroup.Item>
                                              <ListGroup.Item className='border-0 justify-content-center pt-0 pt-0 pb-0 arrow--icon'>
                                                <MdArrowDownward />
                                              </ListGroup.Item>
                                              </>
                                            )}
                                            <Draggable
                                              key={`tabitem-${index}`}
                                              draggableId={`tab-${index}-${Date.now()}`} // Unique draggableId
                                              index={index}
                                              isDragDisabled={
                                                index === 0 || index === workflowModalState?.workflow?.tabs.length - 1
                                              } // Disable drag for first and last items
                                            >
                                              {(provided) => (
                                                <ListGroup.Item
                                                  key={`tab-item-${index}`}
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  className="border--top--plan"
                                                >
                                                  {typeof tab === 'object' && tab !== null ? (
                                                    <>
                                                      <span className='drag--icon'><GrDrag /></span>
                                                      <span className='nm-b flow--circle'></span> {tab.title}
                                                      <small
                                                        className='ms-auto'
                                                        type="button"
                                                        title={tab.title}
                                                        onClick={() => handleEditShow(index, tab.title)}
                                                      >
                                                        <CiEdit />
                                                      </small>
                                                      {
                                                      index !== 0 && index !==  workflowModalState?.workflow?.tabs.length - 1 &&
                                                        <span className="delete--workstep ms-2" onClick={() => {removetab(index)}}><FaRegTimesCircle /></span>
                                                      }
                                                      
                                                    </>
                                                  ) : (
                                                    <>
                                                      <span className='drag--icon'><GrDrag /></span>
                                                      <span className='nm-r flow--circle'></span> {tab}
                                                      <small
                                                        className='ms-auto'
                                                        type="button"
                                                        title="Filter"
                                                        onClick={() => handleEditShow(index, tab)}
                                                      >
                                                        <CiEdit />
                                                      </small>
                                                      {
                                                      index !== 0 && index !==  workflowModalState?.workflow?.tabs.length - 1 &&
                                                        <span className="delete--workstep ms-2" onClick={() => {removetab(index)}}><FaRegTimesCircle /></span>
                                                      }
                                                      
                                                    </>
                                                  )}
                                                </ListGroup.Item>
                                              )}
                                            </Draggable>
                                            </>
                                          ))}
                                        {provided.placeholder}
                                      </ListGroup>
                                    )}
                                  </Droppable>
                                </DragDropContext>

                                
                              </ListGroup>
                            </>
                        }
                        </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleWorkflowClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSelect}>Select</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showEdit} onHide={handleEditClose} centered size="md" className="add--workflow--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Workstep</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={updateWorkstep}>
                        <Form.Group className="mb-3 form-group">
                            <Form.Label>Workstep Title</Form.Label>
                            <Form.Control type="text" name='workspace_title' value={fields['workspace_title'] || ''}  onChange={handleChange} />
                            {showError('workspace_title')}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleEditClose}>Cancel</Button>
                    <Button variant="primary" onClick={updateWorkstep}>Save</Button>
                </Modal.Footer>
            </Modal>
            {/*--=-=Add Workstep Modal**/}
            <Modal show={showAdd} onHide={handleAddClose} centered size="md" className="add--workflow--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Add a new Workstep</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id='workstepForm' onSubmit={saveWorkstep}>
                        <Form.Group className="mb-3 form-group">
                            <Form.Label>Workstep Title</Form.Label>
                            <Form.Control type="text" name="workspace_title" placeholder="Name your workstep" onChange={handleChange} />
                            {showError('workspace_title')}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleAddClose}>Cancel</Button>
                    <Button onClick={saveWorkstep} variant="primary">Save</Button>
                </Modal.Footer>
            </Modal>
            </>
  )
}

export const FilesModal = () => {
  const modalstate = useSelector(state => state.common.filesmodal);
  const commonState = useSelector( state => state.common)
  const currentTask = useSelector( state => state.task.currentTask);
  const [formtype, setFormType] = useState(false)
  const dispatch = useDispatch()
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [ showfileModal, setShowfilemodal] = useState( false )
  const [fields, setFields] = useState({ images: [] });
  const [filetoPreview, setFiletoPreview] = useState(null);
  const [showPreview, setPreviewShow] = useState(false);

  const refreshstates = (formtype) => { 
    const stateObject = {selectedFiles: []}
    if( dataObject[commonState.active_formtype]){
     
      stateObject['selectedFiles'] = commonState[dataObject[commonState.active_formtype]?.form_key].images || []
    }else{
      stateObject['selectedFiles'] = []
    }
  }

  const [filesModalState, setFilesModalState] = useState(refreshstates(commonState.active_formtype || false))
  
  useEffect(() => {
    const updatedState = refreshstates(commonState.active_formtype);
    setFilesModalState(updatedState);
  }, [commonState.active_formtype]);
  
  const handlePreviewShow = (file) => {
    // dispatch( togglePopups('filepreview', true))
      setFiletoPreview(file)
      setPreviewShow(true)
      
  };
  const onDrop = useCallback(acceptedFiles => {
    handleSelectedFiles(acceptedFiles)  
  }, [])


  useEffect(() => {
    setShowfilemodal(modalstate)
  }, [modalstate])



  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
  useEffect(() => {
    if(commonState.active_formtype){
      setFormType(commonState.active_formtype)
    }
  }, [ commonState.active_formtype])

  const handleUploadClose = () => {
    dispatch( togglePopups('files', false))
  }

  const handleSelectedFiles = (acceptedFiles) => {
 
    setFilesModalState((prevFilesModalState) => {
      const allFiles = [...prevFilesModalState?.selectedFiles || [], ...acceptedFiles];
    
      // Filter out duplicate files based on a unique property (e.g., file.name)
      const uniqueFiles = allFiles.filter(
        (file, index, self) => 
          index === self.findIndex(f => f.name === file.name) // Use `file.name` for uniqueness
      );
    
      // Return the updated state, preserving the previous state structure
      return {
        ...prevFilesModalState,
        selectedFiles: uniqueFiles
      };
    });
    
  };

  useEffect(() => {
    if (filesModalState?.selectedFiles && filesModalState.selectedFiles?.length > 0) {
        const loadPreviews = async () => {
            const previews = await Promise.all(filesModalState.selectedFiles.map((file, index) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const fileExtension = file.name.split('.').pop().toLowerCase();
                        resolve({
                            src: e.target.result,
                            file,
                            mimetype: fileExtension,
                            filename: file.name,
                            _id: index
                        });
                    };
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(file);
                });
            }));
            setImagePreviews(previews);
        };

        loadPreviews();
    } else {
        // Clear the images when no files are selected
        dispatch(updateStateData(PROJECT_FORM, { images: [] }));
    }
}, [filesModalState?.selectedFiles, dispatch]);


  const handleRemove = (indexToRemove) => {
    // Filter out the file to remove from both selectedFiles and imagePreviews
    const updatedSelectedFiles = filesModalState?.selectedFiles.filter((_, index) => index !== indexToRemove);
    const updatedImagePreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
  
    setFilesModalState(prevFilesModalState => ({
      ...prevFilesModalState,   // Spread the previous state to retain other properties
      selectedFiles: updatedSelectedFiles // Update only the `selectedFiles` property
    }));
    setImagePreviews(updatedImagePreviews);
  };


  const handleattachfiles = () => {
    setImagePreviews([]); 
    if( commonState.active_formtype === "task_edit" && filesModalState.selectedFiles.length > 0 && currentTask && Object.keys(currentTask).length > 0){
      const formData = new FormData();
      for (const attach of filesModalState.selectedFiles){
        formData.append('images[]', attach);
      }
      dispatch(updateTask(currentTask._id, formData))
    }else{
      if( dataObject[commonState.active_formtype]){
        dispatch(updateStateData(dataObject[commonState.active_formtype]['state_key'], { images: filesModalState.selectedFiles || []} ));
      }
    }
    
    handleUploadClose()
  }

  const renderPreview = (type, preview, index) => {
 
    const { src, _id } = preview;
    const mimetype = (preview.mimetype) ? preview.mimetype : src.split('.').pop().toLowerCase();

    const previewComponents = {
        image: (
            <div className="preview--cell">
                <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                {
                    type !== "new" &&
                    <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                }
                <Button variant="primary" onClick={ () => handleRemove(index)}><FaRegTrashAlt /></Button>
            </div>
        ),
        video: (
            <div className="preview--cell">
                <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                {
                    type !== "new" &&
                    <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                }
                <Button variant="primary" onClick={ () => handleRemove(index)}><FaRegTrashAlt /></Button>
            </div>
        ),
        pdf: (
            <div className="preview--cell">
                <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                {
                    type !== "new" &&
                    <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                }

                <Button variant="primary" onClick={ () => handleRemove(index)}><FaRegTrashAlt /></Button>
            </div>
        ),
        other: (
            <div className="preview--cell">
                <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                {
                    type !== "new" &&
                    <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                }

                <Button variant="primary" onClick={ () => handleRemove(index)}><FaRegTrashAlt /></Button>
            </div>
        ),
    };

    if (["jpg", "jpeg", "png", "webp"].includes(mimetype)) {
        return previewComponents.image;
    } else if (mimetype === "mp4") {
        return previewComponents.video;
    } else if (mimetype === "pdf") {
        return previewComponents.pdf;
    } else {
        return previewComponents.other;
    }

    return null;
  };


  return (
      <>
      <Modal show={showfileModal} onHide={handleUploadClose} centered size="md" className="upload--status">
        <Modal.Header closeButton>
            <Modal.Title>Attach Files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form {...getRootProps()}>
                <Form.Group>
                    <Form.Control type="file" multiple name="images[]" onChange={(e) => {handleSelectedFiles(Array.from(e.target.files))} } {...getInputProps()} id="attachments-new" />
                    <Form.Label className="file--upload" htmlFor="attachments-new">
                        <span><FaUpload /></span>
                        <p>Drop your files here or <strong>browse</strong></p>
                    </Form.Label>
                </Form.Group>

            </Form>
            <div className="preview--grid" data-length={imagePreviews.length}>
                {imagePreviews.map((preview, index) => (
                    <div key={`uploaded-preview-${index}`} className="file-preview">{renderPreview('new', preview, index)}</div>
                ))}
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => { setFilesModalState({'selectedFiles': []}); setImagePreviews([]); handleUploadClose(); }}>Cancel</Button>
            <Button variant="primary" onClick={handleattachfiles}>Attach</Button>
        </Modal.Footer>
    </Modal>
    <FilesPreviewModal showPreview={showPreview} imagePreviews={imagePreviews}  toggle={setPreviewShow} filetoPreview={filetoPreview} />
    </>
  )
}


export const FilesPreviewModal = React.memo((props) => {
  const commonState = useSelector( state => state.common)
  const [formtype, setFormType] = useState(false)
  const dispatch = useDispatch()
  const [fields, setFields] = useState({ images: [] });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filetoPreview, setFiletoPreview] = useState(null);
  const [showPreview, setPreviewShow] = useState(false);
  const handlePreviewClose = () => {setPreviewShow(false)
    if( props.toggle){
      props.toggle()
    }
  }
  const handlePreviewShow = (file) => {
    dispatch( togglePopups('filepreview', true))
      setFiletoPreview(file)
      setPreviewShow(true)
  };


  useEffect(() => {
    setPreviewShow(props.showPreview)
    
  }, [props.showPreview])

  useEffect(() => {
    setFiletoPreview(props.filetoPreview)
  }, [props.filetoPreview])

  useEffect(() => {
    setImagePreviews(props.imagePreviews)
  },[props.imagePreviews])
 
  useEffect(() => {
    if(commonState.active_formtype){
      setFormType(commonState.active_formtype)
    }
  }, [ commonState.active_formtype])

  const handleRemovefiles = (id) => {
    let previousfiles = fields['images']
    const updatedFiles = previousfiles.filter(file => file !== id);
    if( dataObject[commonState.active_formtype]){
      dispatch( updateStateData(dataObject[commonState.active_formtype]['state_key'], { images: updatedFiles}))
    }
    
    
  }

  return (
    <>
    <Modal show={showPreview} onHide={handlePreviewClose} size="xl" className="file--preview--modal">
      <Modal.Header closeButton>
          <Modal.Title>{filetoPreview?.filename}
              <Dropdown>
                  <Dropdown.Toggle variant="light"><FaEllipsisV /></Dropdown.Toggle>
                  <Dropdown.Menu>
                      <Dropdown.Item href={filetoPreview?.src} target="_blank" download><MdFileDownload /> Download</Dropdown.Item>
                      <Dropdown.Item href="#/action-2" onClick={() => handleRemovefiles(filetoPreview?._id)}><FaTrashAlt /> Delete file</Dropdown.Item>
                  </Dropdown.Menu>
              </Dropdown>
          </Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <div className="file--flex">
              <ListGroup>
                  
                  { imagePreviews.map((preview, index) => (
                      <>
                      
                      <ListGroup.Item key={`preview-key-new-${index}`} onClick={() => setFiletoPreview({ mimetype: preview.mimetype,src: preview.src,  _id: index, filename: preview?.filename || `Preview file-${index}` })} className={index === filetoPreview?._id ? "selected--file" : ''}>
                          {preview?.filename}
                      
                      </ListGroup.Item> </>
                  ))}
              </ListGroup>
              <div className="file--preview">
                  
                  {
                      
                      ["jpg", "jpeg", "png", "webp", "gif", "ico"].includes(filetoPreview?.mimetype) ?
                          <img src={filetoPreview?.src} alt=".." />
                          :
                          filetoPreview?.mimetype === "mp4" ?
                              <video src={filetoPreview?.src} alt={`video--file`} width="200" controls />
                              :
                              filetoPreview?.mimetype === "pdf" ?
                                  <embed src={filetoPreview?.src} type="application/pdf" width="200" height="200" />
                                  :
                                  <>
                                      <img src={fileIcon} alt=".." width="100" height="100" /> <br />
                                  </>
                  }
              </div>
          </div>
      </Modal.Body>
  </Modal>
    </>
  )
})




export const addTask = React.memo(( props ) => {
  const [showTask, setTaskShow] = useState(false);
  const handleTaskClose = () => setTaskShow(false);
  const handleTaskShow = () => setTaskShow(true);

  
  return (
    <>
   
    </>
  )
})