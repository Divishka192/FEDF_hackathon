import React, { useEffect, useState } from 'react';
import EventForm from '../components/EventForm';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function EventEdit() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        toast.error('Unable to load event');
      }
    };
    load();
  }, [id]);

  return (
    <div>
      <Toaster />
      {event ? <EventForm initial={event} onSaved={() => navigate('/')} /> : <p>Loading...</p>}
    </div>
  );
}