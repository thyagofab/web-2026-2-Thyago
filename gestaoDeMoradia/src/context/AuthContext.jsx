import { useState, useEffect } from 'react';
import { AuthContext } from './authContextInstance';
import { authenticateWithCognito, respondToNewPasswordChallenge } from '../services/cognitoAuth';
import { DEMO_ACCOUNTS } from './authConstants';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sgm_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authTokens, setAuthTokens] = useState(() => {
    try {
      const stored = localStorage.getItem('sgm_auth_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [challenge, setChallenge] = useState(null); // Para 'NEW_PASSWORD_REQUIRED'
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sgm_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sgm_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (authTokens) {
      localStorage.setItem('sgm_auth_tokens', JSON.stringify(authTokens));
    } else {
      localStorage.removeItem('sgm_auth_tokens');
    }
  }, [authTokens]);

  /**
   * Realiza login no Cognito ou fallback para demo se for credencial de demonstração
   */
  const login = async (username, password) => {
    setLoading(true);
    setAuthError(null);
    setChallenge(null);

    // 1. Verifica se é uma das contas de teste rápido demonstrativo
    const demoAccount = DEMO_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === username.trim().toLowerCase()
    );

    if (demoAccount && (password === demoAccount.password || password === '123456' || password === 'demo')) {
      const userObj = {
        id: `user-${demoAccount.role}`,
        email: demoAccount.email,
        nome: demoAccount.nome,
        role: demoAccount.role,
        roleLabel: demoAccount.roleLabel,
        campus: demoAccount.campus,
        campusNome: demoAccount.campusNome,
        matricula: demoAccount.matricula || null,
        curso: demoAccount.curso || null,
        isDemo: true,
      };
      setCurrentUser(userObj);
      setLoading(false);
      return { success: true, user: userObj };
    }

    // 2. Autenticação real com AWS Cognito
    try {
      const result = await authenticateWithCognito(username.trim(), password);

      if (result.challenge === 'NEW_PASSWORD_REQUIRED') {
        setChallenge({
          type: 'NEW_PASSWORD_REQUIRED',
          session: result.session,
          username: result.username,
        });
        setLoading(false);
        return { success: false, requiresNewPassword: true };
      }

      const userObj = {
        id: result.profile.email,
        email: result.profile.email,
        nome: result.profile.nome || username,
        role: result.profile.role,
        roleLabel:
          result.profile.role === 'gestor_proae'
            ? 'Gestor PROAE (Central)'
            : result.profile.role === 'gestor_coae'
            ? 'Gestor COAE (Campus Local)'
            : 'Morador (Discente)',
        campus: result.profile.campus,
        matricula: result.profile.matricula || null,
        groups: result.profile.groups || [],
        isDemo: false,
      };

      setCurrentUser(userObj);
      setAuthTokens({
        accessToken: result.accessToken,
        idToken: result.idToken,
        refreshToken: result.refreshToken,
      });

      setLoading(false);
      return { success: true, user: userObj };
    } catch (err) {
      console.error('Erro no login Cognito:', err);
      let friendlyMessage = err.message || 'Erro ao realizar login.';
      if (friendlyMessage.includes('SECRET_HASH')) {
        friendlyMessage =
          'O App Client do Cognito na AWS está configurado com Client Secret. Para SPA/React, utilize um App Client público (sem secret) ou configure VITE_COGNITO_CLIENT_SECRET.';
      } else if (friendlyMessage.includes('NotAuthorizedException') || friendlyMessage.includes('Incorrect username or password')) {
        friendlyMessage = 'Usuário ou senha incorretos no AWS Cognito.';
      } else if (friendlyMessage.includes('UserNotFoundException')) {
        friendlyMessage = 'Usuário não encontrado no AWS Cognito.';
      } else if (friendlyMessage.includes('ROLE_NOT_CONFIGURED')) {
        friendlyMessage =
          'Usuário autenticado, mas sem cargo configurado no Cognito. Solicite a inclusão no grupo PROAE, COAE ou MORADOR.';
      }
      setAuthError(friendlyMessage);
      setLoading(false);
      return { success: false, error: friendlyMessage };
    }
  };

  /**
   * Responde ao desafio de nova senha inicial do Cognito
   */
  const completeNewPassword = async (newPassword) => {
    if (!challenge) return { success: false, error: 'Nenhum desafio pendente.' };
    setLoading(true);
    setAuthError(null);

    try {
      const result = await respondToNewPasswordChallenge(challenge.username, newPassword, challenge.session);
      const userObj = {
        id: result.profile.email,
        email: result.profile.email,
        nome: result.profile.nome || challenge.username,
        role: result.profile.role,
        campus: result.profile.campus,
        isDemo: false,
      };

      setCurrentUser(userObj);
      setAuthTokens({
        accessToken: result.accessToken,
        idToken: result.idToken,
        refreshToken: result.refreshToken,
      });
      setChallenge(null);
      setLoading(false);
      return { success: true, user: userObj };
    } catch (err) {
      setAuthError(err.message || 'Erro ao definir nova senha.');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Logout
   */
  const logout = () => {
    setCurrentUser(null);
    setAuthTokens(null);
    setChallenge(null);
    localStorage.removeItem('sgm_auth_user');
    localStorage.removeItem('sgm_auth_tokens');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authTokens,
        isAuthenticated: !!currentUser,
        role: currentUser?.role || null,
        campus: currentUser?.campus || 'todos',
        loading,
        authError,
        challenge,
        login,
        logout,
        completeNewPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
