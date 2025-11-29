import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import './EventForm.css';

export default function EventForm({ initial = {}, onSave }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initial.title || '');
  const [description, setDescription] = useState(initial.description || '');
  const [date, setDate] = useState(initial.date ? initial.date.slice(0,16) : '');
  const [location, setLocation] = useState(initial.location || '');
  const [maxAttendees, setMaxAttendees] = useState(initial.maxAttendees || 0);
  const [allowRequests, setAllowRequests] = useState(initial.allowRequests ?? true);
  const [category, setCategory] = useState(initial.category || 'general');
  const [tags, setTags] = useState(initial.tags?.join(', ') || '');
  const [imageUrl, setImageUrl] = useState(initial.imageUrl || '');


  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      storage.logout();
      navigate('/login');
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      title, 
      description, 
      date: new Date(date).toISOString(), 
      location, 
      maxAttendees: Number(maxAttendees), 
      allowRequests,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      imageUrl: imageUrl || undefined
    };
    onSave(payload);
  };

  return (
    <form className="event-form-enhanced" onSubmit={submit}>
      <button type="button" className="btn-logout" onClick={handleLogout}>
        <span className="material-symbols-outlined">logout</span>
        Logout
      </button>
      <div className="form-header">
        <div className="form-icon">
          <span className="material-symbols-outlined">event</span>
        </div>
        <h2 className="form-title">{initial.title ? 'Edit Event' : 'Create New Event'}</h2>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label className="form-label">
            <span className="material-symbols-outlined">title</span>
            Event Title
            <span className="required">*</span>
          </label>
          <input 
            className="form-input" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Enter a catchy event title..." 
            required 
          />
          <span className="char-count">{title.length}/100</span>
        </div>

        <div className="form-group full-width">
          <label className="form-label">
            <span className="material-symbols-outlined">description</span>
            Description
          </label>
          <textarea 
            className="form-textarea" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Describe your event in detail..."
            rows="5"
          />
          <span className="char-count">{description.length}/500</span>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="material-symbols-outlined">schedule</span>
            Date & Time
            <span className="required">*</span>
          </label>
          <input 
            className="form-input" 
            type="datetime-local" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="material-symbols-outlined">location_on</span>
            Location
          </label>
          <input 
            className="form-input" 
            value={location} 
            onChange={e => setLocation(e.target.value)} 
            placeholder="e.g., Main Hall, Room 101"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="material-symbols-outlined">category</span>
            Category
          </label>
          <select 
            className="form-select" 
            value={category} 
            onChange={e => setCategory(e.target.value)}
          >
            <option value="general">General</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="social">Social</option>
            <option value="sports">Sports</option>
            <option value="academic">Academic</option>
            <option value="cultural">Cultural</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="material-symbols-outlined">group</span>
            Max Attendees
          </label>
          <input 
            className="form-input" 
            type="number" 
            min="0" 
            value={maxAttendees} 
            onChange={e => setMaxAttendees(e.target.value)} 
            placeholder="0 = unlimited"
          />
          <span className="input-hint">Leave 0 for unlimited capacity</span>
        </div>

        <div className="form-group full-width">
          <label className="form-label">
            <span className="material-symbols-outlined">image</span>
            Event Image URL
          </label>
          <input 
            className="form-input" 
            value={imageUrl} 
            onChange={e => setImageUrl(e.target.value)} 
            placeholder="https://example.com/image.jpg"
            type="url"
          />
          {imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
        </div>

        <div className="form-group full-width">
          <label className="form-label">
            <span className="material-symbols-outlined">label</span>
            Tags
          </label>
          <input 
            className="form-input" 
            value={tags} 
            onChange={e => setTags(e.target.value)} 
            placeholder="education, networking, tech (comma-separated)"
          />
          {tags && (
            <div className="tags-preview">
              {tags.split(',').map((tag, i) => tag.trim() && (
                <span key={i} className="tag-chip">{tag.trim()}</span>
              ))}
            </div>
          )}
        </div>

        <div className="form-group full-width">
          <label className="form-label-checkbox">
            <input 
              type="checkbox" 
              className="form-checkbox"
              checked={allowRequests} 
              onChange={e => setAllowRequests(e.target.checked)} 
            />
            <span className="checkbox-label">
              <span className="material-symbols-outlined">mail</span>
              Allow students to send activity requests
            </span>
          </label>
        </div>
      </div>
      
      <div className="form-footer">
        <button className="btn-save" type="submit">
          <span className="material-symbols-outlined">save</span>
          Save Event
        </button>
        <button className="btn-preview" type="button" onClick={() => alert('Preview feature coming soon!')}>
          <span className="material-symbols-outlined">visibility</span>
          Preview
        </button>
      </div>
    </form>
  );
}