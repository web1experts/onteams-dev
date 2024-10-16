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
            dispatch(updateStateData(PROJECT_FORM, { ['start_date']: "" }));
        }
        
    }
    const handleDatevalue = () => {
        let start_date = '';
        let due_date = '';

        if (startpicker && datevalue.length) {
            start_date = datevalue[0]?.format("YYYY-MM-DD");
            due_date = datevalue[1]?.format("YYYY-MM-DD");
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
                            
                            <Form.Label>
                                <Form.Check onChange={handleChange} checked={startpicker || commonState.projectForm?.start_date && commonState.projectForm?.start_date !== "" ? true : false}></Form.Check>
                                Start date
                            </Form.Label>
                            <Form.Control type="input" placeholder='DD/MM/YYYY' value={ commonState?.projectForm?.start_date ? new Date(commonState?.projectForm?.start_date).toISOString().split('T')[0] :  ''} name="startdate" onKeyDown={(e) => {e.preventDefault()}} />
                        </Form.Group>
                        <Form.Group className="mb-3 col-sm-12 col-md-6">
                            <Form.Label>Due date</Form.Label>
                            <Form.Control type="input" value={ commonState?.projectForm?.due_date ? new Date(commonState?.projectForm?.due_date).toISOString().split('T')[0] :  ''} name="duedate" placeholder='DD/MM/YYYY' onKeyDown={(e) => {e.preventDefault()}} />
                        </Form.Group>
                    </Row>
                    {
                        startpicker === false ? 
                        <Calendar
                            value={commonState?.projectForm.due_date}
                            onChange={async (value) => {
                                setDateValue(value)
                            }
                            }    
                        />
                        :
                        <Calendar
                            value={
                                commonState?.projectForm?.start_date && commonState?.projectForm?.due_date ?
                                [
                                    commonState?.projectForm?.start_date ? new DateObject({ date: commonState?.projectForm?.start_date, format: "YYYY-MM-DD" }) : '', // Parse start date
                                    commonState?.projectForm?.due_date ? new DateObject({ date: commonState?.projectForm?.due_date, format: "YYYY-MM-DD" }) : ''    // Parse end date
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