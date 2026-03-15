import React from 'react';

const ClientDashboardPage = () => {
  return (
    <section>
      <h2>Client Dashboard</h2>
      <header className="dashboard-header">
        <a href="#find-trainer">Find Trainer</a>
        <a href="#my-sessions">My Sessions</a>
        <a href="#progress">Progress</a>
        <a href="#settings">Settings</a>
      </header>

      <div className="widget-grid">
        <article className="widget-card" id="my-sessions">
          <h3>Book Upcoming Sessions</h3>
          <p>Book or reschedule your next 1:1 training slots with available trainers.</p>
        </article>

        <article className="widget-card">
          <h3>Assigned Workouts & Meal Plans</h3>
          <p>Review active plans uploaded by your trainer and mark tasks complete.</p>
        </article>

        <article className="widget-card" id="progress">
          <h3>Track Progress</h3>
          <p>Log weight, reps, body metrics, and weekly check-ins in one timeline.</p>
        </article>
      </div>
    </section>
  );
};

export default ClientDashboardPage;
