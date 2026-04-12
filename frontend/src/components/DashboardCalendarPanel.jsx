import React, { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Badge, Button, Card, Flex, Heading, IconButton, Text, TextArea, TextField } from '@radix-ui/themes';
import { Cross1Icon } from '@radix-ui/react-icons';
import {
  cancelTrainerSession,
  createClientSessionBooking,
  createTrainerSession,
  DEFAULT_CLIENT_ID,
  DEFAULT_TRAINER_ID,
  fetchAvailableTrainerSessions,
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
  location: event.extendedProps.location,
  status: event.extendedProps.status,
});

const DashboardCalendarPanel = ({ role }) => {
  const seedEvents = role === 'trainer' ? trainerBaseEvents : clientBaseEvents;
  const [events, setEvents] = useState(seedEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadEvents = role === 'trainer' ? fetchTrainerSessions : fetchAvailableTrainerSessions;

    loadEvents()
      .then((rows) => {
        if (!isMounted) return;
        setEvents(rows);
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
  }, [role]);

  useEffect(() => {
    setFormTitle(selectedEvent?.title || '');
    setFormDescription(selectedEvent?.description || '');
  }, [selectedEvent]);

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
      location: 'Choose format',
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

    if (role === 'client') {
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

    setIsSaving(true);
    setStatusMessage('');

    try {
      const savedEvent = selectedEvent.id.startsWith('draft-')
        ? await createTrainerSession({
            start: selectedEvent.start,
            end: selectedEvent.end,
            trainerId: selectedEvent.trainerId || DEFAULT_TRAINER_ID,
            title: formTitle,
            description: formDescription,
          })
        : await updateTrainerSession({
            sessionId: Number(selectedEvent.sessionId),
            start: selectedEvent.start,
            end: selectedEvent.end,
            trainerId: selectedEvent.trainerId || DEFAULT_TRAINER_ID,
            title: formTitle,
            description: formDescription,
            status: toApiStatus(selectedEvent.status),
          });

      setEvents((currentEvents) =>
        selectedEvent.id.startsWith('draft-')
          ? [...currentEvents.filter((event) => event.id !== selectedEvent.id), savedEvent]
          : currentEvents.map((event) => (event.id === selectedEvent.id ? savedEvent : event)),
      );
      setSelectedEvent(savedEvent);
      setIsDialogOpen(false);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSession = async () => {
    if (role !== 'trainer' || !selectedEvent || selectedEvent.id.startsWith('draft-')) {
      return;
    }

    setIsSaving(true);
    setStatusMessage('');

    try {
      const cancelledEvent = await cancelTrainerSession(Number(selectedEvent.sessionId));
      setEvents((currentEvents) =>
        currentEvents.map((event) => (event.id === selectedEvent.id ? cancelledEvent : event)),
      );
      setSelectedEvent(cancelledEvent);
      setIsDialogOpen(false);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const persistCalendarUpdate = async (info) => {
    if (role !== 'trainer' || info.event.id.startsWith('draft-')) {
      setSelectedEvent(buildSelectedEvent(info.event));
      setIsDialogOpen(true);
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
        status: toApiStatus(info.event.extendedProps.status),
      });
      setEvents((currentEvents) =>
        currentEvents.map((event) => (event.id === info.event.id ? updatedEvent : event)),
      );
      setSelectedEvent(updatedEvent);
      setStatusMessage('');
    } catch (error) {
      info.revert();
      setStatusMessage(error.message);
    }
  };

  return (
    <div className="dashboard-calendar-panel">
      <Card className="calendar-shell">
        <Flex justify="between" align="center" wrap="wrap" gap="3" className="calendar-panel-header">
          <div>
            <Heading size="5">{role === 'trainer' ? 'Schedule Manager' : 'Booking Calendar'}</Heading>
            <Text color="gray">
              {role === 'trainer'
                ? 'Create slots, edit titles and descriptions, and cancel sessions from one calendar.'
                : 'Review available trainer slots and book the one that fits your schedule.'}
            </Text>
          </div>
          <Badge color={role === 'trainer' ? 'violet' : 'blue'}>{events.length} items</Badge>
        </Flex>
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
          selectMirror
          nowIndicator
          select={addDraftSession}
          eventClick={(info) => {
            setSelectedEvent(buildSelectedEvent(info.event));
            setIsDialogOpen(true);
          }}
          eventDrop={persistCalendarUpdate}
          eventResize={persistCalendarUpdate}
        />
      </Card>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Flex direction="column" gap="4">
              <div>
                <Flex justify="between" align="center">
                  <Dialog.Title asChild>
                    <Heading size="5">{role === 'trainer' ? 'Schedule Details' : 'Session Details'}</Heading>
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <IconButton variant="ghost" color="gray">
                      <Cross1Icon />
                    </IconButton>
                  </Dialog.Close>
                </Flex>
                <Text color="gray">
                  {role === 'trainer'
                    ? 'Set the session title, add a description, save updates, or cancel the slot.'
                    : 'Review the trainer session details before you book it.'}
                </Text>
              </div>

              {selectedEvent ? (
                <Flex direction="column" gap="3" className="session-detail-stack">
                  <Flex justify="between" align="start" gap="3">
                    <div style={{ flex: 1 }}>
                      {role === 'trainer' ? (
                        <TextField.Root value={formTitle} onChange={(event) => setFormTitle(event.target.value)} />
                      ) : (
                        <Text weight="bold">{selectedEvent.title}</Text>
                      )}
                    </div>
                    <Text color="gray">{new Date(selectedEvent.start).toLocaleString()}</Text>
                  </Flex>

                  {role === 'trainer' ? (
                    <div>
                      <Text size="2" color="gray">
                        Description
                      </Text>
                      <TextArea value={formDescription} onChange={(event) => setFormDescription(event.target.value)} />
                    </div>
                  ) : (
                    selectedEvent.description ? <Text color="gray">{selectedEvent.description}</Text> : null
                  )}

                  <div className="session-meta-row">
                    <Text color="gray">{selectedEvent.coachLabel}</Text>
                    <Text>{selectedEvent.coachName}</Text>
                  </div>
                  <div className="session-meta-row">
                    <Text color="gray">Location</Text>
                    <Text>{selectedEvent.location}</Text>
                  </div>
                  <div className="session-meta-row">
                    <Text color="gray">Status</Text>
                    <Badge
                      color={
                        selectedEvent.status === 'Confirmed'
                          ? 'green'
                          : selectedEvent.status === 'Pending'
                            ? 'amber'
                            : 'gray'
                      }
                    >
                      {selectedEvent.status}
                    </Badge>
                  </div>
                  <Flex justify="between" gap="3" wrap="wrap">
                    {role === 'trainer' && !selectedEvent.id.startsWith('draft-') && selectedEvent.status !== 'Cancelled' ? (
                      <Button variant="soft" color="red" disabled={isSaving} onClick={handleCancelSession}>
                        {isSaving ? 'Cancelling...' : 'Cancel Session'}
                      </Button>
                    ) : null}
                    <Button variant="soft" disabled={isSaving} onClick={handleSave}>
                      {role === 'trainer'
                        ? selectedEvent.id.startsWith('draft-')
                          ? (isSaving ? 'Saving...' : 'Create Availability Slot')
                          : (isSaving ? 'Saving...' : 'Save Changes')
                        : (isSaving ? 'Booking...' : 'Book Session')}
                    </Button>
                  </Flex>
                </Flex>
              ) : null}
            </Flex>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default DashboardCalendarPanel;
