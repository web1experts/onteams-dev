import React, { useState, useEffect,useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Button, Modal, Form, FloatingLabel, ListGroup, Dropdown } from "react-bootstrap";
import { FaBold, FaChevronDown, FaItalic, FaPlus, FaRegTrashAlt, FaUpload, FaEllipsisV, FaCheck, FaPlusCircle, FaTimes } from "react-icons/fa";
import { MdFileDownload, MdOutlineClose } from "react-icons/md";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { togglePopups, updateStateData } from "../../redux/actions/common.action";
import {  ASSIGN_MEMBER } from "../../redux/actions/types";

export const MemberInitials = React.memo(( props ) => {
    const dispatch = useDispatch()
    const [ members, setMembers ]= useState([])

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
                                        onClick={() => props.onMemberClick(member._id)}
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
                                            onClick={() => props.onMemberClick(member._id)}
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
                                        onClick={() => props.onMemberClick(id, true)}
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
                                        onClick={() => props.onMemberClick(id, true)}
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