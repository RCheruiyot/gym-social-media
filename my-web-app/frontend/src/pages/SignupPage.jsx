import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';

const SignupPage = () => {
  const [role, setRole] = useState('client');

  return (
    <section>
      <h2>Sign Up</h2>
      <p>Choose your role to continue.</p>

      <Tabs.Root value={role} onValueChange={setRole} className="tabs-root">
        <Tabs.List className="tabs-list" aria-label="User role">
          <Tabs.Trigger className="tabs-trigger" value="client">
            Client
          </Tabs.Trigger>
          <Tabs.Trigger className="tabs-trigger" value="trainer">
            Trainer
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="client" className="tabs-content">
          <form className="stack-form">
            <input placeholder="Name" required />
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <textarea placeholder="Fitness goals" rows={3} required />
            <input placeholder="Training styles (e.g. strength, HIIT)" required />
            <input placeholder="Budget (monthly)" required />
            <div className="verify-box">
              <strong>Verification</strong>
              <p>Complete email and phone verification after signup.</p>
            </div>
            <button type="submit">Create Client Account</button>
          </form>
        </Tabs.Content>

        <Tabs.Content value="trainer" className="tabs-content">
          <form className="stack-form">
            <input placeholder="Name" required />
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <input placeholder="Certifications" required />
            <input placeholder="Experience (years)" required />
            <input placeholder="Specialties" required />
            <input placeholder="Pricing" required />
            <label className="field-label">
              Upload profile photo
              <input type="file" accept="image/*" />
            </label>
            <label className="field-label">
              Upload intro video
              <input type="file" accept="video/*" />
            </label>
            <div className="verify-box">
              <strong>Verification</strong>
              <p>Complete email and phone verification after signup.</p>
            </div>
            <button type="submit">Create Trainer Account</button>
          </form>
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
};

export default SignupPage;
