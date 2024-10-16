import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {  Modal} from "react-bootstrap";

import { updateStateData, togglePopups } from '../../redux/actions/common.action';
import { EDIT_PROJECT_FORM,  PROJECT_FORM } from '../../redux/actions/types';
import DatePicker from "react-multi-date-picker";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ProjectDatePicker = (props) => {
    const dispatch = useDispatch()
    const commonState = useSelector( state => state.common)
    const [start_date, setStartDate ] = useState('')
    const [due_date, setDueDate ] = useState('')
    useEffect(() => {
        if( props.isShow === true){
            switch (commonState.active_formtype) {
                case 'project':
                    setStartDate(commonState.projectform?.start_date)
                    setDueDate(commonState.projectform?.due_date)
                    break;
                case 'edit_project':
                    setStartDate(commonState.editProjectForm?.start_date)
                    setDueDate(commonState.editProjectForm?.due_date)
                    break;
                default:
                    break;
            }
        }
    }, [props])
    return (
        <Modal show={props.isShow} onHide={() => { props.close( false )}} centered size="md" className="date--picker--modal">
                <Modal.Header closeButton>
                   
                </Modal.Header>
                <Modal.Body>
                    <DatePicker 
                        name="start_date"
                        id='startdate--picker'
                        value={start_date} 
                        onChange={async (value) => {
                            const date = value.toDate();
                            // Manually format the date to YYYY-MM-DDTHH:mm:ss.sss+00:00 without converting to UTC
                            const year = date.getFullYear();
                            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is zero-indexed
                            const day = date.getDate().toString().padStart(2, '0');
                            const hours = date.getHours().toString().padStart(2, '0');
                            const minutes = date.getMinutes().toString().padStart(2, '0');
                            const seconds = date.getSeconds().toString().padStart(2, '0');
                            const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
                            // Combine into the desired format
                            const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;
                            switch (commonState.active_formtype) {
                                case 'project':
                                    dispatch(updateStateData(PROJECT_FORM, { ['start_date']: formattedDate }));
                                    break;
                                case 'edit_project':
                                    dispatch(updateStateData(EDIT_PROJECT_FORM, { ['start_date']: formattedDate }));
                                    break;
                                default:
                                    break;
                            }
                            
                            
                        }
                        }                    
                        className="form-control"
                        placeholder="dd/mm/yyyy"
                    />
                    <DatePicker 
                        name="due_date"
                        id='duedate--picker'
                        value={due_date} 
                        onChange={async (value) => {
                            const date = value.toDate();
                            // Manually format the date to YYYY-MM-DDTHH:mm:ss.sss+00:00 without converting to UTC
                            const year = date.getFullYear();
                            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is zero-indexed
                            const day = date.getDate().toString().padStart(2, '0');
                            const hours = date.getHours().toString().padStart(2, '0');
                            const minutes = date.getMinutes().toString().padStart(2, '0');
                            const seconds = date.getSeconds().toString().padStart(2, '0');
                            const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
                            // Combine into the desired format
                            const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;
                            switch (commonState.active_formtype) {
                                case 'project':
                                    dispatch(updateStateData(PROJECT_FORM, { ['due_date']: formattedDate }));
                                    break;
                                case 'edit_project':
                                    dispatch(updateStateData(EDIT_PROJECT_FORM, { ['due_date']: formattedDate }));
                                    break;
                                default:
                                    break;
                            }
                            
                        }
                        }                    
                        className="form-control"
                        placeholder="dd/mm/yyyy"
                    />
                </Modal.Body>
            </Modal> 
    )
}

export default ProjectDatePicker;