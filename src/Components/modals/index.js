import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { updateOwnership } from '../../redux/actions/workspace.action';
import useFilledClass from "../customHooks/useFilledclass";
import {updateProject} from "../../redux/actions/project.action"
import { Button, Modal, Form, ListGroup, FloatingLabel, Dropdown } from "react-bootstrap";
import { selectboxObserver } from "../../helpers/commonfunctions";
import { FaCheck, FaPlusCircle, FaTimesCircle, FaUpload, FaRegTrashAlt, FaEllipsisV, FaTrashAlt } from "react-icons/fa";
import fileIcon from './../../images/file-icon-image.jpg'
import { ListWorkflows } from '../../redux/actions/workflow.action';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { updateStateData, togglePopups } from '../../redux/actions/common.action';
import { SELECTED_STATUS, SELECTED_MEMBERS, PROJECT_FORM } from '../../redux/actions/types';
import { MdFileDownload, MdFilterList, MdOutlineClose, MdSearch } from "react-icons/md";
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
  const [showStatus, setStatusShow] = useState(false);
  const [formtype, setFormType] = useState(false)
  const [selected, setSelected] = useState('')
  useFilledClass('.form-floating .form-control');
  const [search, setSearch] = useState('');
  const dispatch = useDispatch()
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const statuses = [
    { key: 'in-progress', label: 'In Progress', circleClass: 'progress--circle' },
    { key: 'on-hold', label: 'On Hold', circleClass: 'hold--circle' },
    { key: 'completed', label: 'Completed', circleClass: 'complete--circle' },
  ];

  const filteredStatuses = statuses.filter(status => 
    status.label.toLowerCase().includes(search.toLowerCase())
  );
  useEffect(() =>{
    if( commonState?.projectForm?.status ){
      setSelected(commonState.projectForm.status)
    }
  },[commonState.projectForm]);

  useEffect(() => {
    if(commonState.active_formtype){
      setFormType(commonState.active_formtype)
    }
    
  }, [ commonState.active_formtype])

  useEffect(() => {
    setStatusShow(modalstate)
  }, [modalstate])

  return (
    <>
      {/*--=-=Status Modal**/}
      <Modal show={showStatus} onHide={props.onhide} centered size="md" className="status--modal">
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
                        <ListGroup.Item key={`status-${status.key}`} className={selected == status.key ? "status--active": ""} onClick={() => {
                          setSelected(status.key);
                          // props.callback(status.key)
                          // dispatch( updateStateData(SELECTED_STATUS, status.key))
                          if(formtype === 'project'){
                            dispatch( updateStateData(PROJECT_FORM, { 'status': status.key} ))
                           
                          }else if(formtype === 'task'){

                          }
                          dispatch(togglePopups('status', false))
                          }}>
                            <span className={`${status.circleClass} status--circle`}></span>
                            <p>{status.label} {selected === status.key && <FaCheck />}</p>
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
  const [ members, setMembers ] = useState([])
  const commonState = useSelector( state => state.common)
  const [formtype, setFormType] = useState(false)
  const [showAssign, setAssignShow] = useState(false);
  const handleAssignClose = () => setAssignShow(false);
  const dispatch = useDispatch()
  const [ currentmembers, setCurrentMembers ] = useState([])
  const [selectedMembers, setSelectedMembers] = useState({});
  const [search, setSearch] = useState('');

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if( commonState.allmembers){
      setMembers(commonState.allmembers)
    }
  },[ commonState.allmembers])


  useEffect(() => {
    if(commonState.active_formtype){
      setFormType(commonState.active_formtype)
    }
    
  }, [ commonState.active_formtype])

  useEffect(() => {
    if( commonState.selectedMembers){
      setSelectedMembers(commonState.selectedMembers)
    }
  },[ commonState.selectedMembers])

  useEffect(() =>{
    if( commonState?.projectForm?.members ){ console.log('ehelhr:: ', commonState.projectForm.members)
      // setSelectedMembers(commonState.projectForm.members)
      // Assume `members` is an array of objects and `commonState.projectForm.members` is an array of IDs
      const selectedMembers = members.reduce((acc, member) => {
        // Check if the member ID is present in `commonState.projectForm.members`
        if (commonState.projectForm.members.includes(member._id)) {
          // Add the member to the result object with `id` as key and `name` as value
          acc[member._id] = member.name;
        }
        return acc;
      }, {});
      console.log('selectedMembers:::: ', selectedMembers)
      // Set the selected members
      setSelectedMembers(selectedMembers);
    }
  },[commonState.projectForm]);

  let filteredMembers = []
  //useEffect(() => { console.log(props.members)
    if(members && members.length > 0){
      filteredMembers = members.filter(member => 
        member.name.toLowerCase().includes(search.toLowerCase())
      );
    }
  //},[props.members])

  // useEffect(() => {
  //   if(props.currentProject && Object.keys(props.currentProject).length > 0){
  //     const mm_arr = [];
  //     //const mm_obj = {}
  //     if( props.currentProject.members && props.currentProject.members.length > 0 ){
  //       props.currentProject.members.forEach((member, index) => {
  //         mm_arr.push(member._id)
  //         //mm_obj[member._id] = member.name
  //       })
  //     }
     
  //     setCurrentMembers( mm_arr)
  //     setSelectedMembers( props.currentProject.members || [])
  //   }
    
  // }, [props.currentProject])

  // useEffect(() => {
  //   if(props.selectedMembers && Object.keys(props.selectedMembers).length > 0){ 
  //     const mm_arr = Object.keys(props.selectedMembers);
  //     setCurrentMembers( mm_arr)
  //     setSelectedMembers( props.selectedMembers)
  //   } else if(props.selectedMembers && Object.keys(props.selectedMembers).length === 0){
  //     setCurrentMembers( [])
  //     setSelectedMembers( {})
  //   }
    
  // }, [ props.selectedMembers])
  
  useEffect(() => {
    setAssignShow(modalstate)
  }, [modalstate])


  useFilledClass('.form-floating .form-control');
  const handleDone = () => {
    const membersarr = []
    // selectedMembers.forEach(member => {
    //   membersarr.push( member._id )
    //   props.selectCallback(member);
    // });

    /*
    Object.entries(selectedMembers).forEach(([id, name]) => {
      membersarr.push(id);
      props.selectCallback({ _id: id, name: name });
    });
    setSelectedMembers({}); // Clear selected members after adding
    setCurrentMembers([]);

    if( props.currentProject && Object.keys(props.currentProject).length > 0 && props?.isedit !== true){
      dispatch(updateProject(props.currentProject._id, { members: membersarr }))
    }
    props.handleAssignClose(); // Close modal after done*/
    dispatch( updateStateData(SELECTED_MEMBERS, selectedMembers))
    dispatch( togglePopups( 'members', false ))
  };

  const handleMemberSelect = (member) => {
    // Check if member is already selected
    if (!selectedMembers[member._id]) {
       
        // setSelectedMembers(prevSelectedMembers => ({ ...prevSelectedMembers, [member._id]: member.name }));
        // setCurrentMembers(prevcurrentMembers => [...prevcurrentMembers, member._id]);
        dispatch(updateStateData(PROJECT_FORM, {
          ...commonState.projectForm,
          members: [...(commonState.projectForm.members || []), member._id] // Append new ID to members array
        }));
    } else {
        handleRemove(member._id);
    }
};

  const handleRemove = (memberId) => {
      dispatch(updateStateData(PROJECT_FORM, {
        ...commonState.projectForm,
        members: (commonState.projectForm.members || []).filter(id => id !== memberId) // Remove the matched memberId
      }));

      // setSelectedMembers(prevMembers => {
      //     const updatedMembers = { ...prevMembers };
      //     delete updatedMembers[memberId];
      //     return updatedMembers;
      // });
      // setCurrentMembers(prevMembers => prevMembers.filter(id => id !== memberId));
      // Call any remove logic or callback function here if needed
  };


  return (
    // <Modal show={showAssign} onHide={() => {setSelectedMembers({});setCurrentMembers([]);props.handleAssignClose()}} centered size="md" className="status--modal assign--task--modal">
    <Modal show={showAssign} onHide={() => {setSelectedMembers({});setCurrentMembers([]);dispatch(togglePopups('members', false))}} centered size="md" className="status--modal assign--task--modal">
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
          {selectedMembers && Object.keys(selectedMembers).length > 0 &&
            Object.entries(selectedMembers).map(([id, name], index) => (
                <ListGroup.Item key={`listkey-${index}`} onClick={() => handleRemove(id)}>
                    <span><img src="../images/default.jpg" alt="" /></span>
                    <p>{name} <FaTimesCircle /></p>
                </ListGroup.Item>
            ))
          }

          </ListGroup>
          <ListGroup className="status--list">
          {
              filteredMembers && filteredMembers.length > 0 && (
                filteredMembers.map((member, idx) => (
                <ListGroup.Item  key={`listkey-${idx}`} onClick={() => handleMemberSelect(member)} className={Object.keys(selectedMembers).length > 0 && selectedMembers[member._id] ? "status--active": ""}>
                    <span><img src="../images/default.jpg" alt="" /></span>
                    <p>{ member.name } 
                      {
                         Object.keys(selectedMembers).length > 0 && selectedMembers[member._id] && 
                          <FaCheck />
                      }
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

export const  WorkFlowModal =  React.memo((props) => {
  const dispatch = useDispatch()
  const modalstate = useSelector(state => state.common.workflowmodal);
  const commonState = useSelector( state => state.common)
  const [formtype, setFormType] = useState(false)
  const [showWorkflow, setWorkflowShow] = useState(false);
  const [fields, setFields] = useState({})
  const [ error, setErrors ] = useState({})
  const [showEdit, setEditShow] = useState(false);
  const [showAdd, setAddShow] = useState(false);
  const [ workflows, setWorkflows] = useState([])
  const [ selectedWorkflow, setSelectedWorkflow] = useState({})
  const[ filteredWorkflows , setFilteredWorkflows ] = useState([])
  const workflowstate = useSelector(state => state.workflow)
  const [search, setSearch] = useState('');
  const [ selectedTab, setSelectedTab] = useState({})
  // Memoize handlers to prevent unnecessary re-creations
  const handleWorkflowClose = useCallback(() => {
    dispatch( togglePopups( 'workflow', false ))
     if( props.toggle){
    props.toggle(false)
  }}, []);
  const handleWorkflowShow = useCallback(() => setWorkflowShow(true), []);
  const handleEditClose = useCallback(() => setEditShow(false), []);
  const handleEditShow = useCallback((index,tab) => { setSelectedTab({index, tab}); setEditShow(true)}, []);
  const handleAddClose = useCallback(() => setAddShow(false), []);
  const handleAddShow = useCallback(() => setAddShow(true), []);

  useEffect( () => {
    dispatch(ListWorkflows())
  }, [])

  // useEffect(() =>{
  //   if( commonState?.projectForm?.workflow ){
  //     setSelected(commonState.projectForm.status)
  //   }
  // },[commonState.projectForm]);

  useEffect(() => {
    if(commonState.active_formtype){
      setFormType(commonState.active_formtype)
    }
    
  }, [ commonState.active_formtype])

  useEffect(() => {
    setWorkflowShow(modalstate)
  }, [modalstate])

  useEffect(() =>{
    // if( props.showWorkflow ){
      setWorkflowShow( props.showWorkflow || false  )
    // }

    if( props.selectedworkflow && Object.keys(props.selectedworkflow).length > 0 ) {
      setSelectedWorkflow({
        _id: props.selectedworkflow._id,
        title: props.selectedworkflow.title,
        tabs: props.selectedworkflow.tabs
      })
    }
  }, [ props ])

  useEffect(() => {
    if( workflowstate && workflowstate.workflows && workflowstate.workflows.length > 0){
      setWorkflows( workflowstate.workflows )
      // if (props.selectedworkflow) {
      //   // Create a merged array with selectedWorkflow at the first index
      //   const mergedWorkflows = [props.selectedworkflow, ...workflowstate.workflows];
        
      //   // Update the state with the merged array
      //   setFilteredWorkflows(mergedWorkflows);
      // } else {
        setFilteredWorkflows(workflowstate.workflows)
      // }
      

      // if( !props.selectedworkflow || Object.keys(props.selectedworkflow).length === 0 ){
      //   setSelectedWorkflow(workflowstate.workflows[0])
      // }
    }
  }, [ workflowstate ])

  const handleChange = ({ target: { name, value} }) => {
    setFields({ ...fields, [name]: value });
    setErrors({ ...error, [name]: '' })
  };  

  const handleSelectworkflow = (workflow) => {
    setSelectedWorkflow( workflow )
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    let filteredflows = [];
    if( workflows && workflows.length > 0 ){ console.log('search here')
      filteredflows = workflows.filter(workflow => 
        workflow.title.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredWorkflows(filteredflows)
    }
  };

  const handleSelect = () => {
    dispatch(updateStateData( PROJECT_FORM, { workflow: selectedWorkflow}))
    dispatch( togglePopups('workflow', false))
    // if( props.handleSelect ){
    //   props.handleSelect(selectedWorkflow);
    // }
    // if( props.toggle){
    //   props.toggle(false)
    // }
  }

  const saveWorkstep = (e) => {
    e.preventDefault();
    if(!fields['workspace_title'] || fields['workspace_title'] === ""){
      setErrors({...error, ['workspace_title']: 'Title is required'})
    }

    // setSelectedWorkflow({
    //   ...selectedWorkflow,
    //   tabs: [...selectedWorkflow.tabs, {title: fields['workspace_title'], _id: false, order: selectedWorkflow.tabs.length}]
    // });
    // Create the new tab object
    // Get the last tab and its order
    const lastTab = selectedWorkflow.tabs[selectedWorkflow.tabs.length - 1];
    const newOrder = lastTab ? lastTab.order - 1 : 0; // If there's no last tab, start with order 0

    // Create the new tab object
    const newTab = {
      title: fields['workspace_title'],
      _id: false,
      order: newOrder,
    };

    // Create a new array with the new tab inserted before the last tab
    const updatedTabs = [
      ...selectedWorkflow.tabs.slice(0, -1), // All tabs except the last one
      newTab, // Insert the new tab
      lastTab // Add the last tab
    ];

    // Update the state with the new array
    setSelectedWorkflow({
      ...selectedWorkflow,
      tabs: updatedTabs.map((tab, index) => ({ ...tab, order: index })) // Update all orders to ensure correct order sequence
    });

    setAddShow( false )
    setFields({})
    setErrors({})
  }

  const updateWorkstep = (e) => {
    e.preventDefault();
    if(!fields['workspace_title'] || fields['workspace_title'] === ""){
      setErrors({...error, ['workspace_title']: 'Title is required'})
    }

    setSelectedWorkflow({
      ...selectedWorkflow,
      tabs: selectedWorkflow.tabs.map((item, index) => {
        if (index === selectedTab?.index) {
          // Check if the item is an object
          if (typeof item === 'object' && item !== null) {
            // Return updated object with the new title
            return { ...item, title: fields['workspace_title'] };
          } else {
            // Return the updated simple value
            return fields['workspace_title'];
          }
        }
        // Return the item unchanged if index does not match
        return item;
      }),
    });
    
    setEditShow( false )
    setFields({})
    setErrors({})
  }

  const showError = (name) => {
    if (error[name]) return (<span className="error">{error[name]}</span>)
    return null
  }

  const handleDragEnd = (result) => {
    const { source, destination } = result;
  
    // Do nothing if dropped outside the list
    if (!destination || destination.index === source.index) return;

    const isDropInvalid =
      destination.index === 0 || destination.index === selectedWorkflow.tabs.length - 1;

    if (isDropInvalid) return;
  
    // Rearrange the array based on drag result
    const reorderedTabs = Array.from(selectedWorkflow.tabs);
    const [removed] = reorderedTabs.splice(source.index, 1);
    reorderedTabs.splice(destination.index, 0, removed);
  
    // Check if reorderedTabs is an array of objects
    if (typeof reorderedTabs[0] === 'object' && reorderedTabs[0] !== null) {
      // Update the order key for each tab
      reorderedTabs.forEach((tab, index) => {
        tab.order = index; // Update the order key based on position
      });
    }
  
    // Update the tabs in selectedWorkflow
    const updatedWorkflow = {
      ...selectedWorkflow,
      tabs: reorderedTabs
    };
  
    // Set the new state
    setSelectedWorkflow(updatedWorkflow);
  };
  

   
  return (
    <>      
      <Modal show={showWorkflow} onHide={handleWorkflowClose} centered size="lg" className="add--workflow--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Workflows</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                        <Form.Group className="mb-3 form-group">
                            <Form.Label>Select Workflow</Form.Label>
                            <Dropdown className="select--dropdown">
                                <Dropdown.Toggle variant="success">
                                  {/* { 
                                    selectedWorkflow?._id && selectedWorkflow?._id === props?.selectedworkflow?._id ? 
                                      'Current Workflow'
                                    : */}
                                  {
                                    selectedWorkflow?.title || 'Select'

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
                                          props.selectedworkflow &&
                                          <Dropdown.Item onClick={() => handleSelectworkflow(props.selectedworkflow)} className={ (selectedWorkflow && selectedWorkflow?._id === props.selectedworkflow._id ) ? 'selected--option' : ''} > Current Workflow { (selectedWorkflow && selectedWorkflow?._id === props.selectedworkflow._id ) ? <FaCheck /> : null }</Dropdown.Item>
                                        }

                                        {
                                          filteredWorkflows.length > 0 &&
                                          filteredWorkflows.map(workflow => (
                                            <Dropdown.Item onClick={() => handleSelectworkflow(workflow)} className={ (selectedWorkflow && selectedWorkflow?._id === workflow._id ) ? 'selected--option' : ''} >{workflow.title} { (selectedWorkflow && selectedWorkflow?._id === workflow._id ) ? <FaCheck /> : null }</Dropdown.Item>
                                          ))
                                        }
                                    </div>
                                </Dropdown.Menu>
                            </Dropdown>
                           
                        </Form.Group>
                        <Form.Group className="mb-0 form-group" >
                            <Form.Label><strong>Taskboard setup</strong></Form.Label>
                            <p>Add, remove, reorder and rename the worksteps to reflect the way you work.</p>
                            {
                              Object.keys(selectedWorkflow).length > 0 && showWorkflow &&
                            <>
                            <DragDropContext onDragEnd={handleDragEnd}>
                                  <Droppable droppableId="droppabletabs" type="droppableTabsItem" direction="horizontal">
                                    {(provided) => (
                                      <ListGroup
                                        className="workflow--list"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                      >
                                        {Object.keys(selectedWorkflow).length > 0 &&
                                          selectedWorkflow.tabs.map((tab, index) => (
                                            <Draggable
                                              key={`tabitem-${index}`}
                                              draggableId={`tab-${index}-${Date.now()}`} // Unique draggableId
                                              index={index}
                                              isDragDisabled={
                                                index === 0 || index === selectedWorkflow.tabs.length - 1
                                              } // Disable drag for first and last items
                                            >
                                              {(provided) => (
                                                <ListGroup.Item
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  className="border--top--plan"
                                                >
                                                  {typeof tab === 'object' && tab !== null ? (
                                                    <>
                                                      {tab.title}
                                                      <small
                                                        type="button"
                                                        title={tab.title}
                                                        onClick={() => handleEditShow(index, tab.title)}
                                                      >
                                                        Edit
                                                      </small>
                                                    </>
                                                  ) : (
                                                    <>
                                                      {tab}
                                                      <small
                                                        type="button"
                                                        title="Filter"
                                                        onClick={() => handleEditShow(index, tab)}
                                                      >
                                                        Edit
                                                      </small>
                                                    </>
                                                  )}
                                                </ListGroup.Item>
                                              )}
                                            </Draggable>
                                          ))}
                                        {provided.placeholder}
                                      </ListGroup>
                                    )}
                                  </Droppable>
                                </DragDropContext>

                            
                              <ListGroup.Item>
                                  <Button variant="primary" onClick={handleAddShow}><FaPlusCircle /> Add New</Button>
                              </ListGroup.Item>
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
                            <Form.Control type="text" name='workspace_title' value={fields['workspace_title'] || selectedTab?.tab || ''}  onChange={handleChange} />
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
})

export const FilesModal = () => {
  const modalstate = useSelector(state => state.common.filesmodal);
  const previewmodalstate = useSelector(state => state.common.previewfilesmodal);
  const commonState = useSelector( state => state.common)
  const [formtype, setFormType] = useState(false)
  const dispatch = useDispatch()
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [filetoPreview, setFiletoPreview] = useState(null);
  const [showPreview, setPreviewShow] = useState(false);
  const [ showfileModal, setShowfilemodal] = useState( false )
  const handlePreviewClose = () => setPreviewShow(false);
  const [fields, setFields] = useState({ images: [] });
  const [errors, setErrors] = useState({ title: '' });
  const handlePreviewShow = (file) => {
      setFiletoPreview(file)
      setPreviewShow(true)
  };
  const onDrop = useCallback(acceptedFiles => {
    handleSelectedFiles(acceptedFiles)  
  }, [])

  useEffect(() => {
    if( commonState.projectForm){
        setFields(commonState.projectForm)
    }
  },[ commonState.projectForm])

  useEffect(() => {
    setShowfilemodal(modalstate)
  }, [modalstate])

  useEffect(() => {
    setPreviewShow( previewmodalstate)
  },[ previewmodalstate ])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
  useEffect(() => {
    if(commonState.active_formtype){
      setFormType(commonState.active_formtype)
    }
  }, [ commonState.active_formtype])

  const handleUploadClose = () => {
    dispatch( togglePopups('files', false))
  }

  const handleSelectedFiles = (acceptedFiles) => { console.log('acceptedFiles: ', acceptedFiles)
    setSelectedFiles((prevSelectedFiles) => {
        // Filter out duplicates by comparing file names or other unique properties
        const uniqueFiles = Array.from(new Set([...prevSelectedFiles, ...acceptedFiles]));

        return uniqueFiles;
    });
  };

  useEffect(() => {
    if (selectedFiles?.length > 0) {
        // setFields({ ...fields, images: selectedFiles });
        dispatch( updateStateData(PROJECT_FORM,  { images: selectedFiles}))
        const previews = [];
        for (let i = 0; i < selectedFiles.length; i++) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileExtension = selectedFiles[i].name.split('.').pop().toLowerCase();
                previews.push({
                    src: e.target.result,
                    file: selectedFiles[i],
                    mimetype: fileExtension,
                    filename: selectedFiles[i].name,
                    _id: i
                });
                if (previews.length === selectedFiles.length) {
                    setImagePreviews(previews);
                }
            };
            reader.readAsDataURL(selectedFiles[i]);
        }
    }else{
        // const { images, ...updatedFields } = fields;
        dispatch( updateStateData(PROJECT_FORM,  { images: []}))
        // setFields(updatedFields);           
    }
  }, [selectedFiles])

  const handleRemove = (indexToRemove) => {
    // Filter out the file to remove from both selectedFiles and imagePreviews
    const updatedSelectedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    const updatedImagePreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(updatedSelectedFiles);
    setImagePreviews(updatedImagePreviews);
  };

  const handleRemovefiles = (id) => {
    let previousfiles = fields['images']
    const updatedFiles = previousfiles.filter(file => file !== id);
    dispatch( updateStateData(PROJECT_FORM, { images: updatedFiles}))
    // setFields({ ...fields, ['files']: updatedFiles })
  }

  const handleattachfiles = () => {
    dispatch( updateStateData(PROJECT_FORM, { images: selectedFiles}))
    handleUploadClose()
  }

  const renderPreview = (type, preview, index) => {
    console.log(type)
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
                <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
            </div>
        ),
        video: (
            <div className="preview--cell">
                <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                {
                    type !== "new" &&
                    <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                }
                <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
            </div>
        ),
        pdf: (
            <div className="preview--cell">
                <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                {
                    type !== "new" &&
                    <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                }

                <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
            </div>
        ),
        other: (
            <div className="preview--cell">
                <p onClick={() => handlePreviewShow({ src, _id, mimetype, filename: preview?.filename || `Preview file-${index}` })}>{preview?.filename || `Preview file-${index}`}</p>
                {
                    type !== "new" &&
                    <Button variant="secondary" className="ms-auto"><a target="_blank" className="btn-secondary" download={preview?.filename} href={src}><MdFileDownload /></a></Button>
                }

                <Button variant="primary" onClick={() => type === "new" ? handleRemove(index) : handleRemovefiles(_id)}><FaRegTrashAlt /></Button>
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
                    <Form.Label className="file--upload" htmlFor="attachments-new" onClick="handleLabelClick(event)">
                        <span><FaUpload /></span>
                        <p>Drop your files here or <strong>browsesee</strong></p>
                    </Form.Label>
                </Form.Group>

            </Form>
            <div className="preview--grid">
                {imagePreviews.map((preview, index) => (
                    <div key={`uploaded-preview-${index}`} className="file-preview">{renderPreview('new', preview, index)}</div>
                ))}
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => { setSelectedFiles([]); setImagePreviews([]); handleUploadClose(); }}>Cancel</Button>
            <Button variant="primary" onClick={handleattachfiles}>Attach</Button>
        </Modal.Footer>
    </Modal>

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
}




export const addTask = React.memo(( props ) => {
  const [showTask, setTaskShow] = useState(false);
  const handleTaskClose = () => setTaskShow(false);
  const handleTaskShow = () => setTaskShow(true);

  
  return (
    <>
    {/* <Modal show={showTask} onHide={handleTaskClose} centered size="lg" className="add--member--modal add--task--modal">
                <Modal.Header closeButton>
                    <Modal.Title>Create New Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="project--form">
                        <div className="project--form--inputs">
                            <Form>
                                <Form.Group className="mb-0 form-group">
                                    <FloatingLabel label="Task Title *">
                                        <Form.Control type="text" placeholder="Task Title" />
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label>
                                        <small>Status</small>
                                        <div className="status--modal" onClick={handleStatusShow}>
                                            <span className="hold--circle status--circle"></span> On Hold <FaChevronDown />
                                        </div>
                                    </Form.Label>
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label>
                                        <div className="assign--modal" onClick={handleAssignShow}>
                                            <span className="member--icon"><img src="../images/default.jpg" alt="..." /></span>
                                            <label>
                                                <small>Assigned to</small>
                                                <span className="modal--pop">Assign the task</span>
                                            </label>
                                        </div>
                                    </Form.Label>
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label className="w-100 m-0">
                                        <small>Description</small>
                                        <strong className="add-descrp" onClick={setIsDescEditor}><FiFileText /> Add a description</strong>
                                        <div className={isdescEditor ? 'text--editor show--editor' : 'text--editor'}>
                                            <textarea className="form-control" placeholder="Add a title"  rows="2"></textarea>
                                            <ul className="editor--options">
                                                <li><a href="javascript:;"><FaBold /></a></li>
                                                <li><a href="javascript:;"><FaItalic /></a></li>
                                            </ul>
                                        </div>
                                    </Form.Label>
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label>
                                        <small>Start/Due Date</small>
                                    </Form.Label>
                                    <Row>
                                        <Col sm={12} lg={6}>
                                            <Form.Control type="date" name="startdate" />
                                        </Col>
                                        <Col sm={12} lg={6} className="mt-3 mt-lg-0">
                                            <Form.Control type="date" name="enddate" />
                                        </Col>
                                    </Row>
                                </Form.Group>
                                <Form.Group className="mb-0 form-group">
                                    <Form.Label className="w-100 m-0">
                                        <small>Subtasks</small>
                                        <strong className="add-descrp" onClick={handleTaskEditor}><FaPlusCircle /> Add subtasks</strong>
                                        <div className={isTaskEditor ? 'subtask--editor show--editor' : 'subtask--editor'}>
                                            <textarea className="form-control" rows="1" placeholder="Add subtask"></textarea>
                                        </div>
                                    </Form.Label>
                                </Form.Group>
                            </Form>
                        </div>
                        <div className="project--form--actions">
                            <h4>Actions</h4>
                            <ListGroup>
                                <ListGroup.Item onClick={handleAssignShow}><FaPlus /> Assign to</ListGroup.Item>
                                <ListGroup.Item onClick={handleUploadShow}><GrAttachment /> Attach files</ListGroup.Item>
                                <div className="output--file-preview">
                                    <div className="preview--grid">
                                       
                                        {imagePreviews.map((preview, index) => (
                                            <div key={`uploaded-preview-${index}`} className="file-preview">{renderPreview('new', preview, index)}</div>
                                        ))}
                                    </div>
                                </div>
                                <ListGroup.Item onClick={handleDeleteShow} className="text-danger"><FaRegTrashAlt /> Delete task</ListGroup.Item>
                            </ListGroup>
                            <Button variant="primary">Save</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal> */}
    </>
  )
})