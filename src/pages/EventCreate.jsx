import React from 'react';
import EventForm from '../components/EventForm';
import { useNavigate } from 'react-router-dom';

export default function EventCreate() {
  const navigate = useNavigate();
  return <EventForm onSaved={() => navigate('/')} />;
}