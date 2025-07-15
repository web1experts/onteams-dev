import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import {  Modal, Form, ListGroup, Card} from 'react-bootstrap';
import { FaCheck, FaCircle } from "react-icons/fa";
export function BadgesModal({badgesData: {name, options, label}, toggleBadges,showBadges , handleSelect, value}){
  
  const [search, setSearch] = useState('');
  const dispatch = useDispatch()
    const [statusModalState, setStatusModalState] = useState(showBadges !== null ? true : false)
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };


  const filteredStatuses = options.filter(status => 
    status.label.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <><Modal show={statusModalState} onHide={()=> toggleBadges(null)} centered size="md" className="status--modal">
              <Modal.Header closeButton>
                  <Modal.Title>Set {label}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                  <Form>
                      <Form.Group>
                          <Form.Control type="text" placeholder="Search here" onChange={handleSearchChange} />
                      </Form.Group>
                  </Form>
                  <ListGroup className="status--list">
                  {
                    filteredStatuses.map(status => (
                      <ListGroup.Item key={`status-${status.value}`} className={value == status.value ? "status--active": ""} onClick={() => {
                        handleSelect({ target: { name: `custom_field[${name}]`, value: status.value } });
                        toggleBadges(null)
                      }}>
                          <span style={{'marginRight': '.5rem'}}>
                            <FaCircle style={{ color: status.color }}></FaCircle>
                          </span>
                          
                          <p data-kkk={`${value} === ${status.value}`}>{status.label} {value === status.value && <FaCheck />}</p>
                      </ListGroup.Item>
                    ))}
                      
                  </ListGroup>
              </Modal.Body>
          </Modal>
          </>
  )
}