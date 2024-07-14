'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import ComponentModal from '../components/ComponentModal';
import moment from 'moment'
import axios from 'axios'

import Select from 'react-select';
// Import styles
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Setup the localizer
const localizer = momentLocalizer(moment)

export default function Home() {
    const [isClient, setIsClient] = useState(false)
    const [viewCalendar, setViewCalendar] = useState('month')
    const [events, setEvents] = useState([])
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [filterEventByUsers, setFilterEventByUsers] = useState([]);
    const [searchEvent, setSearchEvent] = useState('');
    const [userListOptions, setUserListOptions] = useState([]);

    useEffect(() => {
        setIsClient(true)
        fetchUserOptions()
    }, [])

    useEffect(() => {
        fetchEvents();
    }, [searchEvent, filterEventByUsers]);

    const fetchEvents = async () => {
        try {

            const response = await axios.get('http://localhost:3001/api/events', {
                params: {
                    search: searchEvent,
                    assign_to: filterEventByUsers.map(item => item.value)
                },
                paramsSerializer: (params) => {
                    return Object.keys(params)
                      .map(key => {
                        if (Array.isArray(params[key])) {
                          return params[key].map(value => `${key}[]=${encodeURIComponent(value)}`).join('&');
                        }
                        return `${key}=${encodeURIComponent(params[key])}`;
                      })
                      .join('&');
                }
            })

            if (response.data) {
                setEvents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    const handleViewChange = (newView) => {
        setViewCalendar(newView)
    }

    const handleNavigate = (newDate, view) => {
        setCurrentDate(newDate);
    };

    const handleSelectEvent = async (event) => {
        setSelectedSlot({
            'id': event.id, 
            'title': event.title,
            'assign_to': event.assign_to,
            'start': new Date(event.start),
            'end': new Date(event.end)
        })
        setShowModal(true)
    };
    
    const handleSelectSlot = ({start, end}) => {
        setSelectedSlot({
            'start': start, 
            'end': end
        })
        setShowModal(true)
    };

    const closeModal = () => {
        setSelectedSlot(null)
        setShowModal(false);
    };

    const handleFilterUserChange = (selectedOptions) => {
        setFilterEventByUsers(selectedOptions)
    };

    const fetchUserOptions = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/users');
            const options = response.data.data.map(user => ({
                value: user.id,
                label: user.name,
            }));
            setUserListOptions(options);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSearch = async (inputValue) => {
        setSearchEvent(inputValue);
    }

    const customStyles = {
        control: (provided, state) => ({
          ...provided,
          border: '1px solid #ccc',
          borderRadius: '4px',
          minHeight: '36px',
          boxShadow: state.isFocused ? '0 0 0 1px #2684FF' : 'none',
        }),
        menu: (provided, state) => ({
          ...provided,
          zIndex: 9999,
        }),
      };
      

    if (!isClient) return null

    return (
        <div style={{background: '#fefefe', padding: '3rem', height: '100vh'}}>
            <div style={{textAlign: 'center', marginBottom: "3rem"}}>
                <h1>Calendar</h1>
            </div>
            <div className='row'>
                <div className="col-2">
                    <span>
                        <input
                            type="text"
                            className='form-control'
                            placeholder="Search events..."
                            value={searchEvent}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </span>
                </div>
                <div className="col-3">
                    <span>
                        <Select
                            value={filterEventByUsers}
                            onChange={handleFilterUserChange}
                            options={userListOptions}
                            isMulti
                            placeholder="Filter by users..."
                            styles={customStyles}
                        />
                    </span>
                </div>
            </div>

            <div style={{ height: '80vh', paddingTop: '2rem' }}>
                <Calendar
                    defaultView='month'
                    events={events}
                    views={['month', 'week', 'day']}
                    view={viewCalendar}
                    onView={handleViewChange}
                    date={currentDate} 
                    onNavigate={handleNavigate}
                    localizer={localizer}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={handleSelectEvent}
                    selectable={true}
                    onSelectSlot={handleSelectSlot}
                    style={{ height: '100%' }}
                    titleAccessor={(event) => (
                        <>
                            <div>{event.title} - <span style={{opacity:"80%"}}>({event.user.name})</span></div>
                        </>
                    )}
                />
            </div>

            <ComponentModal 
                show={showModal} 
                handleClose={closeModal} 
                selectedSlotData={selectedSlot}
                fetchEvents={fetchEvents}
            />
        </div>
    )
}