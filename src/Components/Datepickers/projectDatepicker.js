import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { Modal, Form, Row, Button } from "react-bootstrap";
import { updateStateData, togglePopups } from '../../redux/actions/common.action';
import { EDIT_PROJECT_FORM,  PROJECT_FORM } from '../../redux/actions/types';
import {DatePicker, Calendar,  DateObject } from "react-multi-date-picker";

const ProjectDatePicker = (props) => {
    const dispatch = useDispatch()
    const commonState = useSelector( state => state.common)
    const [start_date, setStartDate ] = useState('')
    const [due_date, setDueDate ] = useState('')
    const [startpicker, setStartPicker] = useState( false )
    const [datevalue, setDateValue] = useState('')

    useEffect(() => {
        if (datevalue instanceof DateObject) {
            setDueDate(datevalue.format("YYYY-MM-DD"));
        }else if (datevalue.length) {
            setStartDate(datevalue[0]?.format("YYYY-MM-DD"));
            setDueDate(datevalue[1]?.format("YYYY-MM-DD"));
        }

    }, [datevalue])

    useEffect(() => {
        if( typeof start_date !== "undefined"  && start_date !== ""){ console.log('yes true')
            setStartPicker(true)
        }
        
    },[start_date])
    useEffect(() => {
        if( props.isShow === true){
            switch (commonState.active_formtype) {
                case 'project':
                    
                    setStartDate(commonState.projectForm?.start_date)
                    setDueDate(commonState.projectForm?.due_date)

                    if(commonState.projectForm?.start_date !== "" && commonState.projectForm?.due_date){

                    }

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


    const handleChange = (e) => {
        setStartPicker(e.target.checked)
        if(e.target.checked === false){
            const formType = commonState.active_formtype === 'project' ? PROJECT_FORM : EDIT_PROJECT_FORM;
            dispatch(updateStateData(formType, { ['start_date']: "" }));
        }
        
    }
    const handleDatevalue = () => {
        let start_date = '';
        let due_date = '';

        if (startpicker && datevalue.length) {
            start_date = datevalue[0]?.format("YYYY-MM-DD") || '';
            due_date = datevalue[1]?.format("YYYY-MM-DD") || '';
        } else if (!startpicker && datevalue instanceof DateObject) {
            due_date = datevalue.format("YYYY-MM-DD");
        }

        const formType = commonState.active_formtype === 'project' ? PROJECT_FORM : EDIT_PROJECT_FORM;
        dispatch(updateStateData(formType, { start_date, due_date }));
    };

    return (
        <Modal show={props.isShow} onHide={() => { props.close( false )}} centered size="md" className="date--picker--modal">
                <Modal.Header closeButton>
                   <Modal.Title>Select start or due date</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Form.Group className="mb-3 col-sm-12 col-md-6">
                            <Form.Label className='d-flex align-items-center' >
                                <Form.Check className='form-check' onChange={handleChange} checked={startpicker || (start_date !== undefined && start_date !== "") ? true : false}></Form.Check>
                                Start date
                            </Form.Label>
                            <Form.Control type="input" placeholder='DD/MM/YYYY' value={ start_date ? new Date(start_date).toISOString().split('T')[0] :  ''} name="startdate" onKeyDown={(e) => {e.preventDefault()}} />
                        </Form.Group>
                        <Form.Group className="mb-3 col-sm-12 col-md-6">
                            <Form.Label>Due date</Form.Label>
                            <Form.Control type="input" value={ due_date ? new Date(due_date).toISOString().split('T')[0] :  ''} name="duedate" placeholder='DD/MM/YYYY' onKeyDown={(e) => {e.preventDefault()}} />
                        </Form.Group>
                    </Row>
                    {
                        startpicker === false ? 
                        <Calendar
                            value={due_date}
                            onChange={async (value) => {
                                setDateValue(value)
                            }
                            }    
                        />
                        :
                        <Calendar
                            value={
                                start_date && due_date ?
                                [
                                    start_date ? new DateObject({ date: start_date, format: "YYYY-MM-DD" }) : '', // Parse start date
                                    due_date ? new DateObject({ date: due_date, format: "YYYY-MM-DD" }) : ''    // Parse end date
                                ]
                                : ''
                            }
                            range
                            rangeHover
                            onChange={async (value) => {
                                setDateValue(value)
                            }
                            }  
                        />

                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='primary' onClick={() => { handleDatevalue(); props.close( false )}}>Done</Button>
                </Modal.Footer>
            </Modal> 
    )
}

export default ProjectDatePicker;