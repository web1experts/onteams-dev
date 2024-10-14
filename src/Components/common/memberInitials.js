import React, { useState, useEffect,useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Button, Modal, Form, FloatingLabel, ListGroup, Dropdown } from "react-bootstrap";
import { FaBold, FaChevronDown, FaItalic, FaPlus, FaRegTrashAlt, FaUpload, FaEllipsisV, FaCheck, FaPlusCircle, FaTimes } from "react-icons/fa";
import { MdFileDownload, MdOutlineClose } from "react-icons/md";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { togglePopups, updateStateData } from "../../redux/actions/common.action";
import {  ASSIGN_MEMBER, ACTIVE_FORM_TYPE, PROJECT_FORM, CURRENT_PROJECT, EDIT_PROJECT_FORM, TASK_FORM } from "../../redux/actions/types";
import { updateProject } from "../../redux/actions/project.action";
import { updateTask } from "../../redux/actions/task.action";
export const MemberInitials = React.memo(( props ) => {
    const dispatch = useDispatch()
    const [ members, setMembers ]= useState([])
    const commonstate = useSelector( state => state.common)
    const active_formtype = useSelector( state => state.common.active_formtype)
    const projectform = useSelector( state => state.common.projectForm)

    const removeMember = (member) => {

        switch (props.type) {
            case 'project':
                
                if( props.postId !== "new"){
                    const membersdata = commonstate.editProjectForm['members']
                    delete membersdata[member]
                    dispatch(updateStateData(EDIT_PROJECT_FORM, { members: membersdata || {} }))
                }else if(props.postId === "new"){
                    const membersdata = projectform['members']
                    delete membersdata[member]
                    dispatch(updateStateData(PROJECT_FORM, { members: membersdata || {} }))
                }

                break;
            case 'task':
                if( props.postId !== "new"){
                   
                    const updatedSelectedMembers = { ...commonstate.taskForm.members };
                    delete updatedSelectedMembers[member];
                    dispatch(updateTask(props.postId, {members: Object.keys(updatedSelectedMembers)}))
                }
                break;
            default:
                break;
        }
        
    };

    const handleRemoveMember = async (memberId, targetelement = null) => {
        switch (props.type) {
            case 'project':
                try {
                    const targetElement = document.getElementById(targetelement);
            
                    if (targetElement) {
                        // Disable the button or make it non-interactive
                        targetElement.classList.add('disabled-pointer');
                    }
                    
                    const currentMembers = members;
                    

                    // if( props.postId !== "new"){
                        const updatedMembers = currentMembers
                        .filter(member => member._id !== memberId)
                        .map(member => member._id);
                        await dispatch(updateProject(props?.postId, { members: updatedMembers, remove_member: true }));
                    // }else{
                    //     const updatedMembers = currentMembers
                    //     .filter(member => member._id !== memberId)
                    //     .map(member => member._id);
                    //     await dispatch(updateProject(props?.postId, { members: updatedMembers, remove_member: true }));
                    // }
            
                    if (targetElement) {
                        // Re-enable the button or make it interactive again
                        targetElement.classList.remove('disabled-pointer');
                    }
            
                } catch (error) {
                    console.error("Error removing member:", error);
            
                    // Ensure target element is re-enabled even if there's an error
                    const targetElement = document.getElementById(targetelement);
                    if (targetElement) {
                        targetElement.classList.remove('disabled-pointer');
                    }
                }
            break;
    
            default:
                break;
        }
    };

    useEffect(() => {
        if( props.members ){ console.log('members list:: 0', props.members)
            setMembers( props.members)
        }
    }, [props ])

    const Initials = ({ id, children, title }) => {
        return (
            <OverlayTrigger overlay={<Tooltip id={id}>{title}</Tooltip>}>
                {children}
            </OverlayTrigger>

        )
    };

    return (
        <>
        
            { members && members.length > 0 && Array.isArray(members) ?  (
                <>
                <ListGroup horizontal className="members--list">
                {
                    (props.showall && props.showall === true) ? (
                        members.map((member, memberIndex) => (
                            <ListGroup.Item action key={`member-${memberIndex}`}>
                                <Initials title={member.name} id={`member-${member._id}`}>
                                    <span className={`team--initial nm-${member.name?.substring(0, 1).toLowerCase()}`}>
                                        {member.name?.substring(0, 1).toUpperCase()}
                                    </span>
                                </Initials>
                                {props.showRemove && (
                                    <span
                                        className="remove-icon"
                                        id={`member--${props.postId}-${member._id}`}
                                         onClick={() => 
                                            // props.onMemberClick(member._id)
                                            {
                                                if( props.postId === "new" || !props.directUpdate){
                                                    removeMember(member._id)
                                                }else if( props.postId !== "new" && props.directUpdate === true){
                                                    handleRemoveMember(member._id)
                                                    // props.onMemberClick(id, true)
                                                }
                                            }
                                        }
                                        
                                    >
                                        <MdOutlineClose />
                                    </span>
                                )}
                            </ListGroup.Item>
                        ))
                    ) : (
                        <>
                            {members.slice(0, members.length > 5 ? 4 : 5).map((member, memberIndex) => (
                                <ListGroup.Item action key={`member-${memberIndex}`}>
                                    <Initials title={member.name} id={`member-${member._id}`}>
                                        <span className={`team--initial nm-${member.name?.substring(0, 1).toLowerCase()}`}>
                                            {member.name?.substring(0, 1).toUpperCase()}
                                        </span>
                                    </Initials>
                                    {props.showRemove && (
                                        <span
                                            className="remove-icon"
                                            id={`member--${props.postId}-${member._id}`}
                                            onClick={() => 
                                                // props.onMemberClick(member._id)
                                                {
                                                    if( props.postId === "new"){
                                                        removeMember(member._id)
                                                    }else{
                                                        handleRemoveMember(member._id)
                                                        // props.onMemberClick(id, true)
                                                    }
                                                }
                                            }
                                        >
                                            <MdOutlineClose />
                                        </span>
                                    )}
                                </ListGroup.Item>
                            ))}
                            
                            {members.length > 5 && (
                                <ListGroup.Item key={`more-member-${props.postId}`} className="more--member">
                                    <span>+{members.slice(4).length}</span>
                                </ListGroup.Item>
                            )}
                        </>
                    )
                }

                    
                    {
                        props.showAssignBtn && props.showAssignBtn === true && 

                        props.type === "project" ?

                            <ListGroup.Item key={`assign-members-${props.postId}`} className="add--member">
                                <Button variant="primary" onClick={() => { { dispatch(updateStateData(ASSIGN_MEMBER, true)); dispatch(togglePopups('members', true)) } }}><FaPlus /></Button>
                            </ListGroup.Item>
                        :
                        <></>
                    }
                    </ListGroup>
                </>
            )

            :
                //members && members.length > 0 && typeof members === "object" &&
                <>
                {
                    (props.showall && props.showall === true) ? (
                        Object.entries(members).map(([id, name], memberindex) => (
                            <ListGroup.Item action key={`member-${props.postId}-${memberindex}`}>
                                <Initials title={name} id={`member-${id}-${memberindex}`}>
                                    <span className={`team--initial nm-${name.substring(0, 1).toLowerCase()}`}>{name?.substring(0, 1).toUpperCase()}</span>
                                </Initials>
                                {props.showRemove && (
                                    <span
                                        className="remove-icon"
                                        id={`member-${props.postId}-${id}`}
                                        onClick={() =>{ 
                                            if( props.postId === "new" || props.directUpdate === false){
                                                removeMember(id)
                                            }else{
                                                handleRemoveMember(id)
                                                // props.onMemberClick(id, true)
                                              }  
                                            }
                                        } 
                                           
                                    >
                                        <MdOutlineClose />
                                    </span>
                                )}
                            </ListGroup.Item>
                        ))
                    ) : (
                        <>
                        {Object.entries(members).slice(0, Object.entries(members).length > 6 ? 5 : 6).map(([id, name], memberindex) => (
                            <ListGroup.Item action key={`member-${props.postId}-${memberindex}`}>
                                <Initials title={name} id={`member-${id}-${memberindex}`}>
                                    <span className={`team--initial nm-${name.substring(0, 1).toLowerCase()}`}>{name?.substring(0, 1).toUpperCase()}</span>
                                </Initials>
                                {props.showRemove && (
                                    <span
                                        className="remove-icon"
                                        id={`member-${props.postId}-${id}`}
                                        onClick={() => { 
                                            if( props.postId === "new" || props.directUpdate === false){
                                                removeMember(id)
                                            }else{
                                                handleRemoveMember(id)
                                                // props.onMemberClick(id, true)
                                              }  
                                            }
                                        }
                                    >
                                        <MdOutlineClose />
                                    </span>
                                )}
                            </ListGroup.Item>
                        ))}
                        {Object.entries(members).length > 6 && (
                            <ListGroup.Item key={`more-member-${props.postId}`} className="more--member">
                                <span className="d-none d-xl-block">+{Object.entries(members).slice(5).length}</span>
                                <span className="d-block d-xl-none">+{Object.entries(members).slice(3).length}</span>
                            </ListGroup.Item>
                        )}
                        </>
                    )
                }
                </>
        
            }
       
        </>
    )
})