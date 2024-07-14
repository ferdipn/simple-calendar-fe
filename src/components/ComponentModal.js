import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'
import axios from 'axios'

import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const ComponentModal = ({ show, handleClose, selectedSlotData, fetchEvents }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [title, setTitle] = useState('');
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');

    useEffect(() => {
        if (show) {

            fetchDataFromAPI();
            setStartDate(selectedSlotData?.start);
            setEndDate(selectedSlotData?.end);
            setTitle(selectedSlotData?.title || '');
            setSelectedOption(selectedSlotData.assign_to);

        }
    }, [show, selectedSlotData]);

    const fetchDataFromAPI = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/users');
            setOptions(response.data.data); 
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            let response
            if (!selectedSlotData.id) {
                response = await axios.post('http://localhost:3001/api/events', {
                    start: startDate,
                    end: endDate,
                    title: title,
                    assign_to: selectedOption
                });
            } else {

                response = await axios.put(`http://localhost:3001/api/events/${selectedSlotData.id}`, {
                    start: startDate,
                    end: endDate,
                    title: title,
                    assign_to: selectedOption
                });
            }
            fetchEvents();
            resetForm()
            handleClose()
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleDelete = async () => {
        if (selectedSlotData.id && window.confirm('Are you sure you want to delete this event?')) {
            await axios.delete(`http://localhost:3001/api/events/${selectedSlotData.id}`);

            fetchEvents();
            resetForm()
            handleClose()
        }

    }

    const resetForm = () => {
        setStartDate('');
        setEndDate('');
        setTitle('');
        setSelectedOption('');
    }


    const closeModal = () => {
        resetForm()
        handleClose()
    }
    
    if (!show) return null;

    return (
        <Modal show={show} 
            onHide={handleClose} 
            style={{
                position: 'absolute',
                left: '50%',
                top:'50%',
                transform: 'translate(-50%, -50%)'
            }}
        centered>
            <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
                <Modal.Title>{selectedSlotData.id ? 'Update Event' : 'Add Event'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="startDate">
                    <Form.Label>Start Date</Form.Label>
                    <Datetime
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                        inputProps={{ 
                            placeholder: 'Select Start Date and Time',
                            required: true 
                         }}
                    />
                </Form.Group>
                <Form.Group controlId="endDate">
                    <Form.Label>End Date</Form.Label>
                    <Datetime
                        value={endDate}
                        onChange={(date) => setEndDate(date)}
                        inputProps={{ 
                            placeholder: 'Select End Date and Time',
                            required: true 
                        }}
                    />
                </Form.Group>
                <Form.Group controlId="title">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        placeholder='Input title..'
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="selectOption">
                    <Form.Label>Select Option</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        required
                    >
                    <option value="">Select an option...</option>
                    {options.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                    </Form.Control>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                {selectedSlotData.id 
                    ? (<Button variant="danger" type="button" onClick={handleDelete}>
                        Delete
                    </Button>)
                    : ''
                }
                <Button variant="primary" type="submit">
                    Submit
                </Button>
                <Button variant="secondary" onClick={closeModal}>
                Close
                </Button>
            </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ComponentModal;