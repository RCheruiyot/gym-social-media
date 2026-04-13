import React, { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Badge, Button, Flex, Heading, IconButton, Text, TextArea, TextField, Dialog } from '@radix-ui/themes';
import { Cross1Icon } from '@radix-ui/react-icons';
import {
  cancelTrainerSession,
  createClientSessionBooking,
  createTrainerSession,
  DEFAULT_CLIENT_ID,
  DEFAULT_TRAINER_ID,
  fetchAvailableTrainerSessions,
  fetchClientSessions,
  fetchTrainerSessions,
  updateTrainerSession,
} from '../api/trainerSessions';

const clientBaseEvents = [
  {
    id: 'c1',
    title: 'Upper Body Power',
    description: 'Power-building block focused on pressing and pulling volume.',
    start: '2026-03-23T07:00:00',
    end: '2026-03-23T08:00:00',
    coachLabel: 'Coach',
    coachName: 'Maya Chen',
    location: 'Virtual',
    status: 'Confirmed',
  },
];

const trainerBaseEvents = [
  {
    id: 't1',
    sessionId: 1,
    title: 'Availability Hold',
    description: 'Open training slot for new client bookings.',
    start: '2026-03-23T10:00:00',
    end: '2026-03-23T10:30:00',
    coachLabel: 'Client',
    coachName: 'Open Slot',
    location: 'Virtual',
    status: 'Pending',
    trainerId: DEFAULT_TRAINER_ID,
  },
];

const toApiStatus = (status) => (status === 'Cancelled' ? 'cancelled' : 'active');

const buildSelectedEvent = (event) => ({
  id: event.id,
  sessionId: event.extendedProps.sessionId ?? event.id.replace(/^trainer-/, ''),
  trainerId: event.extendedProps.trainerId,
  title: event.title,
  description: event.extendedProps.description || '',
  start: event.startStr,
  end: event.endStr || '',
  coachLabel: event.extendedProps.coachLabel,
  coachName: event.extendedProps.coachName,
  trainer: event.extendedProps.trainer || event.extendedProps.coachName,
  location: event.extendedProps.location,
  status: event.extendedProps.status,
});

const SessionCalendar = ({
  role,
  variant = 'dashboard',
  headerTitle,
  headerDescription,
  showHeader = false,
  showItemCount = false,
}) => {
  const seedEvents = role === 'trainer' ? trainerBaseEvents : clientBaseEvents;
  const [events, setEvents] = useState(seedEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = () => {
      if (role === 'trainer') {
        return fetchTrainerSessions();
      }

      return variant === 'sessions' ? fetchClientSessions() : fetchAvailableTrainerSessions();
    };

    loadEvents()
      .then((rows) => {
        if (!isMounted) return;
        const normalizedRows = variant === 'sessions' ? rows.map((event) => ({ ...event, trainer: event.coachName })) : rows;
        setEvents(normalizedRows);
        setStatusMessage('');
      })
      .catch((error) => {
        if (!isMounted) return;
        setEvents([]);
        setStatusMessage(error.message);
      });

    return () => {
      isMounted = false;
    };
  }, [role, variant]);

  useEffect(() => {
    setFormTitle(selectedEvent?.title || '');
    setFormDescription(selectedEvent?.description || '');
    setFormLocation(selectedEvent?.location || '');
    setIsEditingExisting(Boolean(selectedEvent?.id?.startsWith('draft-')));
  }, [selectedEvent]);

  const isDraftSession = Boolean(selectedEvent?.id?.startsWith('draft-'));
  const canEditTrainerFields = role === 'trainer' && (isDraftSession || isEditingExisting);
  const showsClientBookingAction = role === 'client' && variant === 'dashboard';

  const resetFormState = () => {
    setFormTitle(selectedEvent?.title || '');
    setFormDescription(selectedEvent?.description || '');
    setFormLocation(selectedEvent?.location || '');
  };

  const calendarEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        classNames: [`fc-status-${String(event.status || '').toLowerCase()}`],
      })),
    [events],
  );

  const addDraftSession = (selection) => {
    if (role !== 'trainer') return;

    const draftEvent = {
      id: `draft-${selection.startStr}`,
      title: 'Availability Hold',
      description: '',
      start: selection.startStr,
      end: selection.endStr || selection.startStr,
      trainerId: DEFAULT_TRAINER_ID,
      coachLabel: 'Client',
      coachName: 'Open Slot',
      trainer: `Trainer #${DEFAULT_TRAINER_ID}`,
      location: '',
      status: 'Pending',
    };

    setEvents((currentEvents) => [
      ...currentEvents.filter((event) => !event.id.startsWith('draft-')),
      draftEvent,
    ]);
    setSelectedEvent(draftEvent);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEvent) {
      setIsDialogOpen(false);
      return;
    }

    if (showsClientBookingAction) {
      setIsSaving(true);
      setStatusMessage('');

      try {
        await createClientSessionBooking({
          sessionId: selectedEvent.sessionId,
          clientId: DEFAULT_CLIENT_ID,
        });
        setEvents((currentEvents) => currentEvents.filter((event) => event.id !== selectedEvent.id));
        setIsDialogOpen(false);
      } catch (error) {
        setStatusMessage(error.message);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (role !== 'trainer') {
      setIsDialogOpen(false);
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    try {
      const savedEvent = isDraftSession
        ? await createTrainerSession({
            start: selectedEvent.start,
            end: selectedEvent.end,
            trainerId: selectedEvent.trainerId || DEFAULT_TRAINER_ID,
            title: formTitle,
            description: formDescription,
            location: formLocation,
          })
        : await updateTrainerSession({
            sessionId: Number(selectedEvent.sessionId),
            start: selectedEvent.start,
            end: selectedEvent.end,
            trainerId: selectedEvent.trainerId || DEFAULT_TRAINER_ID,
            title: formTitle,
            description: formDescription,
            location: formLocation,
            status: toApiStatus(selectedEvent.status),
          });

      const normalizedSavedEvent = variant === 'sessions' ? { ...savedEvent, trainer: savedEvent.coachName } : savedEvent;

      setEvents((currentEvents) =>
        isDraftSession
          ? [...currentEvents.filter((event) => event.id !== selectedEvent.id), normalizedSavedEvent]
          : currentEvents.map((event) => (event.id === selectedEvent.id ? normalizedSavedEvent : event)),
      );
      setSelectedEvent(normalizedSavedEvent);
      setIsEditingExisting(false);
      setIsDialogOpen(false);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSession = async () => {
    if (role !== 'trainer' || !selectedEvent || isDraftSession) {
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    try {
      const cancelledEvent = await cancelTrainerSession(Number(selectedEvent.sessionId));
      const normalizedCancelledEvent = variant === 'sessions'
        ? { ...cancelledEvent, trainer: cancelledEvent.coachName }
        : cancelledEvent;
      setEvents((currentEvents) =>
        currentEvents.map((event) => (event.id === selectedEvent.id ? normalizedCancelledEvent : event)),
      );
      setSelectedEvent(normalizedCancelledEvent);
      setIsDialogOpen(false);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditing = () => {
    resetFormState();
    setIsEditingExisting(true);
  };

  const handleCancelEditing = () => {
    resetFormState();
    setIsEditingExisting(false);
  };

  const persistCalendarUpdate = async (info) => {
    if (role !== 'trainer' || info.event.id.startsWith('draft-')) {
      if (variant === 'dashboard') {
        setSelectedEvent(buildSelectedEvent(info.event));
        setIsDialogOpen(true);
      }
      return;
    }

    try {
      const updatedEvent = await updateTrainerSession({
        sessionId: Number(info.event.extendedProps.sessionId ?? info.event.id.replace(/^trainer-/, '')),
        start: info.event.startStr,
        end: info.event.endStr || info.event.startStr,
        trainerId: info.event.extendedProps.trainerId || DEFAULT_TRAINER_ID,
        title: info.event.title,
        description: info.event.extendedProps.description || '',
        location: info.event.extendedProps.location || '',
        status: toApiStatus(info.event.extendedProps.status),
      });
      const normalizedUpdatedEvent = variant === 'sessions'
        ? { ...updatedEvent, trainer: updatedEvent.coachName }
        : updatedEvent;
      setEvents((currentEvents) =>
        currentEvents.map((event) => (event.id === info.event.id ? normalizedUpdatedEvent : event)),
      );
      setSelectedEvent(normalizedUpdatedEvent);
      setStatusMessage('');
    } catch (error) {
      info.revert();
      setStatusMessage(error.message);
    }
  };

  const dialogTitle = role === 'trainer' ? 'Schedule Details' : 'Session Details';
  const dialogDescription = role === 'trainer'
    ? 'Set the session title, add a description, save updates, or cancel the slot.'
    : variant === 'dashboard'
      ? 'Review the trainer session details before you book it.'
      : 'Review your booked session details.';

  return (
    <>
      {showHeader ? (
        <Flex justify="between" align="center" wrap="wrap" gap="3" className="calendar-panel-header">
          <div>
            <Heading size="5">{headerTitle}</Heading>
            <Text color="gray">{headerDescription}</Text>
          </div>
          {showItemCount ? <Badge color={role === 'trainer' ? 'violet' : 'blue'}>{events.length} items</Badge> : null}
        </Flex>
      ) : null}

      {statusMessage ? (
        <Text color="red" size="2">
          {statusMessage}
        </Text>
      ) : null}

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        height="auto"
        events={calendarEvents}
        selectable={role === 'trainer'}
        editable={role === 'trainer'}
        selectMirror={variant === 'dashboard'}
        nowIndicator
        select={addDraftSession}
        eventClick={(info) => {
          setSelectedEvent(buildSelectedEvent(info.event));
          setIsDialogOpen(true);
        }}
        eventDrop={persistCalendarUpdate}
        eventResize={persistCalendarUpdate}
      />

      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setIsEditingExisting(false);
          }
        }}
      >
        <Dialog.Content className="dialog-content">
          <Flex direction="column" gap="4">
            <div>
              <Flex justify="between" align="center">
                <Heading size="5">{dialogTitle}</Heading>
                <IconButton variant="ghost" color="gray" onClick={() => { setIsDialogOpen(false); }}>
                  <Cross1Icon />
                </IconButton>
              </Flex>
              <Text color="gray">{dialogDescription}</Text>
            </div>

            {selectedEvent ? (
              <Flex direction="column" gap="3" className="session-detail-stack">
                <Flex justify="between" align="start" gap="3">
                  <div style={{ flex: 1 }}>
                    {canEditTrainerFields ? (
                      <Flex direction="column">
                        <Text size="2" color="gray">
                          Title
                        </Text>
                        <TextField.Root value={formTitle} onChange={(event) => setFormTitle(event.target.value)} />
                      </Flex>
                    ) : (
                      <Text weight="bold">{selectedEvent.title}</Text>
                    )}
                  </div>
                  <Text color="gray">{new Date(selectedEvent.start).toLocaleString()}</Text>
                </Flex>

                {canEditTrainerFields ? (
                  <Flex direction="column" gap="3">
                    <div>
                      <Text size="2" color="gray">
                        Description
                      </Text>
                      <TextArea value={formDescription} onChange={(event) => setFormDescription(event.target.value)} />
                    </div>
                    <div>
                      <Text size="2" color="gray">
                        Location
                      </Text>
                      <TextField.Root value={formLocation} onChange={(event) => setFormLocation(event.target.value)} />
                    </div>
                  </Flex>
                ) : (
                  selectedEvent.description ? <Text color="gray">{selectedEvent.description}</Text> : null
                )}

                <div className="session-meta-row">
                  <Text color="gray">{variant === 'sessions' ? 'Coach' : selectedEvent.coachLabel}</Text>
                  <Text>{variant === 'sessions' ? selectedEvent.trainer : selectedEvent.coachName}</Text>
                </div>
                {role !== 'trainer' && selectedEvent.location ? (
                  <div className="session-meta-row">
                    <Text color="gray">Location</Text>
                    <Text>{selectedEvent.location}</Text>
                  </div>
                ) : null}
                {role !== 'trainer' ? (
                  <div className="session-meta-row">
                    <Text color="gray">Status</Text>
                    <Badge
                      color={
                        selectedEvent.status === 'Confirmed'
                          ? 'green'
                          : selectedEvent.status === 'Pending' || selectedEvent.status === 'Available'
                            ? 'amber'
                            : 'gray'
                      }
                    >
                      {selectedEvent.status}
                    </Badge>
                  </div>
                ) : null}
                <Flex justify="between" gap="3" wrap="wrap">
                  {role === 'trainer' && !isDraftSession && selectedEvent.status !== 'Cancelled' ? (
                    <Button variant="soft" color="red" disabled={isSaving} onClick={handleCancelSession}>
                      {isSaving ? 'Cancelling...' : 'Cancel Session'}
                    </Button>
                  ) : null}
                  <Flex gap="2" wrap="wrap">
                    {role === 'trainer' && !isDraftSession && !isEditingExisting ? (
                      <Button size="1" variant="soft" onClick={handleStartEditing}>
                        Edit Details
                      </Button>
                    ) : null}
                    {role === 'trainer' && !isDraftSession && isEditingExisting ? (
                      <Button variant="soft" color="gray" disabled={isSaving} onClick={handleCancelEditing}>
                        Cancel Edit
                      </Button>
                    ) : null}
                    {showsClientBookingAction ? (
                      <Button variant="soft" disabled={isSaving} onClick={handleSave}>
                        {isSaving ? 'Booking...' : 'Book Session'}
                      </Button>
                    ) : null}
                    {role === 'trainer' && canEditTrainerFields ? (
                      <Button variant="soft" disabled={isSaving} onClick={handleSave}>
                        {isDraftSession
                          ? (isSaving ? 'Saving...' : 'Create Availability Slot')
                          : (isSaving ? 'Saving...' : 'Save Changes')}
                      </Button>
                    ) : null}
                  </Flex>
                </Flex>
              </Flex>
            ) : null}
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

export default SessionCalendar;
