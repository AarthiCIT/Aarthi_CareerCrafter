import { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken } from '../lib/api';

const AuthContext = createContext(null);

const SESSION_KEY = 'cc_session';

function roleToBackend(role) {
  // UI uses 'job_seeker' / 'employer', the backend enum uses 'JOB_SEEKER' / 'EMPLOYER'.
  return role === 'employer' ? 'EMPLOYER' : 'JOB_SEEKER';
}

function roleFromBackend(role) {
  return String(role || '').toLowerCase();
}

function toProfile(userResponseDTO) {
  return {
    id: userResponseDTO.id,
    full_name: userResponseDTO.fullName,
    email: userResponseDTO.email,
    role: roleFromBackend(userResponseDTO.role),
    education_details: userResponseDTO.educationDetails,
    professional_details: userResponseDTO.professionalDetails,
    company_name: userResponseDTO.companyName,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId) {
    const data = await api.users.getById(userId);
    setProfile(toProfile(data));
    return data;
  }

  useEffect(() => {
    (async () => {
      const token = getToken();
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if (token && session?.id) {
        try {
          setUser({ id: session.id, email: session.email });
          await loadProfile(session.id);
        } catch {
          setToken(null);
          localStorage.removeItem(SESSION_KEY);
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  async function signUp(email, password, role, fullName, educationDetails, professionalDetails, companyName, securityQuestion, securityAnswer) {
    return api.users.register({
      fullName,
      email,
      password,
      role: roleToBackend(role),
      educationDetails,
      professionalDetails,
      companyName,
      securityQuestion,
      securityAnswer,
    });
  }

  async function signIn(email, password) {
    const jwt = await api.users.login({ email, password });
    setToken(jwt.token);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: jwt.userId, email: jwt.email }));
    setUser({ id: jwt.userId, email: jwt.email });
    const fullUser = await loadProfile(jwt.userId);
    return { user: fullUser, role: roleFromBackend(jwt.role) };
  }

  async function signOut() {
    setToken(null);
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setProfile(null);
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
