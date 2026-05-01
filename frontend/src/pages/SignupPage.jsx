import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Flex, Heading, RadioCards, Text, TextArea, TextField } from '@radix-ui/themes';
import { useRole } from '../auth/RoleContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { role, signup, login } = useRole();
  const [authMode, setAuthMode] = useState('signup');
  const [signupChoice, setSignupChoice] = useState('client');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [trainerEmail, setTrainerEmail] = useState('');
  const [trainerPassword, setTrainerPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role === 'client') navigate('/client', { replace: true });
    if (role === 'trainer') navigate('/trainer', { replace: true });
  }, [role, navigate]);

  const navigateForRole = (nextRole) => {
    navigate(nextRole === 'client' ? '/client' : '/trainer');
  };

  const onSignup = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    const payload =
      signupChoice === 'client'
        ? {
            username: clientName,
            email: clientEmail,
            password: clientPassword,
            role: 'client',
          }
        : {
            username: trainerName,
            email: trainerEmail,
            password: trainerPassword,
            role: 'trainer',
          };

    try {
      const user = await signup(payload);
      navigateForRole(user.role);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const user = await login({ email: loginEmail, password: loginPassword });
      navigateForRole(user.role);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex direction="column" gap="4" className="signup-page" justify={"center"}>
      <Heading size="6">{authMode === 'signup' ? 'Sign Up' : 'Log In'}</Heading>
      <Text color="gray">
        {authMode === 'signup' ? 'Choose your role to continue.' : 'Use your email and password to access your dashboard.'}
      </Text>

      <Flex gap="2">
        <Button variant={authMode === 'signup' ? 'solid' : 'soft'} type="button" onClick={() => setAuthMode('signup')}>
          Sign Up
        </Button>
        <Button variant={authMode === 'login' ? 'solid' : 'soft'} type="button" onClick={() => setAuthMode('login')}>
          Log In
        </Button>
      </Flex>

      {statusMessage ? <Text color="red">{statusMessage}</Text> : null}

      {authMode === 'signup' ? (
        <>
          <RadioCards.Root value={signupChoice} onValueChange={setSignupChoice}>
            <Flex gap={"2"}>
              <RadioCards.Item value="client">
                <Flex direction="column" gap="1">
                  <Text weight="bold">Client</Text>
                  <Text size="1" color="gray">
                    Find trainers, book sessions, track progress.
                  </Text>
                </Flex>
              </RadioCards.Item>
              <RadioCards.Item value="trainer">
                <Flex direction="column" gap="1">
                  <Text weight="bold">Trainer</Text>
                  <Text size="1" color="gray">
                    Manage clients, plans, schedule, and payments.
                  </Text>
                </Flex>
              </RadioCards.Item>
            </Flex>
          </RadioCards.Root>

          {signupChoice === 'client' && (
            <form className="stack-form" onSubmit={onSignup}>
              <TextField.Root placeholder="Name" value={clientName} onChange={(event) => setClientName(event.target.value)} />
              <TextField.Root type="email" placeholder="Email" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} />
              <TextField.Root type="password" placeholder="Password" value={clientPassword} onChange={(event) => setClientPassword(event.target.value)} />
              <TextArea placeholder="Fitness goals" rows={3} />
              <TextField.Root placeholder="Training styles (e.g. strength, HIIT)" />
              <TextField.Root placeholder="Budget (monthly)" />

              <Card className="verify-box">
                <Flex direction="column" gap="1">
                  <Text weight="bold">Verification</Text>
                  <Text size="1" color="gray">
                    Complete email and phone verification after signup.
                  </Text>
                </Flex>
              </Card>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Client Account'}
              </Button>
            </form>
          )}
          {signupChoice === 'trainer' && (
            <form className="stack-form" onSubmit={onSignup}>
              <TextField.Root placeholder="Name" value={trainerName} onChange={(event) => setTrainerName(event.target.value)} />
              <TextField.Root type="email" placeholder="Email" value={trainerEmail} onChange={(event) => setTrainerEmail(event.target.value)} />
              <TextField.Root type="password" placeholder="Password" value={trainerPassword} onChange={(event) => setTrainerPassword(event.target.value)} />
              <TextField.Root placeholder="Certifications" />
              <TextField.Root placeholder="Experience (years)" />
              <TextField.Root placeholder="Specialties" />
              <TextField.Root placeholder="Pricing" />

              <label className="field-label">
                Upload profile photo
                <input type="file" accept="image/*" />
              </label>
              <label className="field-label">
                Upload intro video
                <input type="file" accept="video/*" />
              </label>

              <Card className="verify-box">
                <Flex direction="column" gap="1">
                  <Text weight="bold">Verification</Text>
                  <Text size="1" color="gray">
                    Complete email and phone verification after signup.
                  </Text>
                </Flex>
              </Card>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Trainer Account'}
              </Button>
            </form>
          )}
        </>
      ) : (
        <form className="stack-form" onSubmit={onLogin}>
          <TextField.Root type="email" placeholder="Email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} />
          <TextField.Root type="password" placeholder="Password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </Button>
        </form>
      )}
    </Flex>
  );
};

export default SignupPage;
