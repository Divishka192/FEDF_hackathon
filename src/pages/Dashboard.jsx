import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { storage } from '../services/storage';
import EventForm from '../components/EventForm';
import './Dashboard.css';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const user = storage.getCurrentUser();
  const navigate = useNavigate();

  const load = async () => {
    const list = await storage.getEvents();
    setEvents(list);
    
    if (user.role === 'student') {
      const requests = await storage.getMyRequests(user.id);
      setMyRequests(requests);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload) => {
    try {
      const ev = { ...payload, createdBy: user.id };
      await storage.createEvent(ev);
      toast.success('Event created');
      setShowCreate(false);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleUpdate = async (patch) => {
    try {
      await storage.updateEvent(editing.id, patch);
      toast.success('Updated');
      setEditing(null);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    await storage.deleteEvent(id);
    toast.success('Deleted');
    load();
  };

  // Filter and search events
  const filteredEvents = events.filter(ev => {
    const matchesCategory = filterCategory === 'all' || ev.category === filterCategory;
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get student stats
  const myEvents = events.filter(ev => ev.attendees.includes(user.id));
  const upcomingEvents = filteredEvents.filter(ev => new Date(ev.date) > new Date() && !ev.completed);
  const pastEvents = filteredEvents.filter(ev => new Date(ev.date) <= new Date() || ev.completed);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="material-symbols-outlined">dashboard</span>
            {user.role === 'teacher' ? 'Event Management' : 'My Dashboard'}
          </h1>
          <p className="welcome-text">Welcome back, <strong>{user.name}</strong></p>
        </div>
      </div>

      {user.role === 'student' && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <span className="material-symbols-outlined">event</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{myEvents.length}</div>
              <div className="stat-label">My Events</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon upcoming">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{upcomingEvents.length}</div>
              <div className="stat-label">Upcoming</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon requests">
              <span className="material-symbols-outlined">pending</span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{myRequests.filter(r => r.status === 'pending').length}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon completed">
              <span className="material-symbols-outlined"></span>
            </div>
            <div className="stat-content">
              <div className="stat-value">{pastEvents.filter(ev => ev.attendees.includes(user.id)).length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>
      )}

      {user.role === 'teacher' && (
        <div className="teacher-actions">
          <button className="btn btn-create" onClick={() => setShowCreate(s => !s)}>
            <span className="material-symbols-outlined">{showCreate ? 'close' : 'add'}</span>
            {showCreate ? 'Close' : 'Create Activity'}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/events/requests')}>
            <span className="material-symbols-outlined">list_alt</span>
            All Requests
          </button>
        </div>
      )}

      {showCreate && <EventForm onSave={handleCreate} />}

      <div className="filters-section">
        <div className="search-bar">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filters">
          {['all', 'general', 'workshop', 'seminar', 'social', 'sports', 'academic', 'cultural'].map(cat => (
            <button
              key={cat}
              className={`filter-chip ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {user.role === 'student' && myRequests.length > 0 && (
        <div className="my-requests-section">
          <h3 className="section-title">
            <span className="material-symbols-outlined">mail</span>
            My Requests
          </h3>
          <div className="requests-grid">
            {myRequests.slice(0, 3).map(req => {
              const event = events.find(e => e.id === req.activity);
              return (
                <div key={req.id} className={`request-card-mini ${req.status}`}>
                  <div className="request-event-name">{event?.title || 'Unknown Event'}</div>
                  <div className="request-status-badge">{req.status}</div>
                  <div className="request-date">{new Date(req.requestedAt).toLocaleDateString()}</div>
                </div>
              );
            })}
          </div>
          {myRequests.length > 3 && (
            <button className="btn-view-all" onClick={() => navigate('/requests')}>
              View All Requests
            </button>
          )}
        </div>
      )}

      <div className="events-section">
        <div className="section-header">
          <h3 className="section-title">
            <span className="material-symbols-outlined">event</span>
            {user.role === 'student' ? 'Available Events' : 'All Activities'}
            <span className="count-badge">{filteredEvents.length}</span>
          </h3>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined">event_busy</span>
            <p>No events found</p>
          </div>
        ) : (
          <ul className="events-list">
            {filteredEvents.map(ev => {
              const isParticipant = ev.attendees.includes(user.id);
              const isPast = new Date(ev.date) < new Date();
              const isFull = ev.maxAttendees > 0 && ev.attendees.length >= ev.maxAttendees;
              const myRequest = myRequests.find(r => r.activity === ev.id);
              
              return (
                <li key={ev.id} className="event">
                  {ev.imageUrl && (
                    <div className="event-image">
                      <img src={ev.imageUrl} alt={ev.title} onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                  <div className="event-main">
                    <div className="event-header">
                      <Link to={`/events/${ev.id}`} className="event-title">{ev.title}</Link>
                      {ev.category && <span className="event-category">{ev.category}</span>}
                      {ev.completed && <span className="event-badge completed">Completed</span>}
                      {isFull && !ev.completed && <span className="event-badge full">Full</span>}
                    </div>
                    <p className="event-description">{ev.description?.substring(0, 120)}{ev.description?.length > 120 ? '...' : ''}</p>
                    <div className="event-meta">
                      <div className="meta-item">
                        <span className="material-symbols-outlined">schedule</span>
                        {new Date(ev.date).toLocaleDateString()} at {new Date(ev.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="meta-item">
                        <span className="material-symbols-outlined">location_on</span>
                        {ev.location || 'TBA'}
                      </div>
                      <div className="meta-item">
                        <span className="material-symbols-outlined">group</span>
                        {ev.attendees.length}{ev.maxAttendees ? ` / ${ev.maxAttendees}` : ''} attendees
                      </div>
                    </div>
                    {ev.tags && ev.tags.length > 0 && (
                      <div className="event-tags">
                        {ev.tags.map((tag, i) => (
                          <span key={i} className="event-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="event-actions">
                    {user.role === 'student' && (
                      <>
                        {isParticipant ? (
                          <span className="participant-badge">
                            Registered
                          </span>
                        ) : myRequest ? (
                          <span className={`request-status-badge ${myRequest.status}`}>
                            {myRequest.status === 'pending' && <span className="material-symbols-outlined">pending</span>}
                            {myRequest.status === 'approved' && <span className="material-symbols-outlined">check</span>}
                            {myRequest.status === 'rejected' && <span className="material-symbols-outlined">close</span>}
                            {myRequest.status}
                          </span>
                        ) : (
                          <button 
                            className="btn btn-join" 
                            onClick={() => {
                              storage.createRequest(ev.id, user.id).then(() => {
                                toast.success('Request submitted');
                                load();
                              }).catch(e => toast.error(e.message));
                            }}
                            disabled={isFull || isPast || !ev.allowRequests}
                          >
                            <span className="material-symbols-outlined">person_add</span>
                            {isFull ? 'Full' : isPast ? 'Past' : 'Request to Join'}
                          </button>
                        )}
                        <Link to={`/events/${ev.id}`} className="btn btn-view">
                          <span className="material-symbols-outlined">visibility</span>
                          View Details
                        </Link>
                      </>
                    )}

                    {user.role === 'teacher' && ev.createdBy === user.id && (
                      <>
                        <button className="btn btn-edit" onClick={() => setEditing(ev)}>
                          <span className="material-symbols-outlined">edit</span>
                          Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(ev.id)}>
                          <span className="material-symbols-outlined">delete</span>
                          Delete
                        </button>
                        {!ev.completed && (
                          <button className="btn btn-complete" onClick={async () => {
                            await storage.updateEvent(ev.id, { completed: true });
                            toast.success('Marked completed');
                            load();
                          }}>
                            <span className="material-symbols-outlined">flag</span>
                            Complete
                          </button>
                        )}
                        <Link to={`/events/${ev.id}/requests`} className="btn btn-outline">
                          <span className="material-symbols-outlined">list_alt</span>
                          Requests
                        </Link>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {editing && (
        <div className="modal">
          <div className="modal-card">
            <h3>Edit Activity</h3>
            <EventForm initial={editing} onSave={handleUpdate} />
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}