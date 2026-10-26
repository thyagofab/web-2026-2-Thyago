/**
 * Cliente WebSocket autenticado com o API Gateway (thyagochat).
 * O idToken do Cognito é enviado via query string (?token=), validado no $connect.
 */
const WS_URL = import.meta.env?.VITE_WS_URL || 'wss://api.thyago.soneca.web.ufersa.dev.br';

export function createChatSocket(idToken, { onOpen, onMessage, onClose, onError } = {}) {
  const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(idToken)}`);

  ws.onopen = () => onOpen?.();
  ws.onclose = (e) => onClose?.(e);
  ws.onerror = (e) => onError?.(e);
  ws.onmessage = (e) => {
    try {
      onMessage?.(JSON.parse(e.data));
    } catch {
      onMessage?.({ type: 'answer', message: e.data });
    }
  };

  return {
    send: (message) => ws.send(JSON.stringify({ action: 'sendMessage', message })),
    close: () => ws.close(),
    get readyState() {
      return ws.readyState;
    },
  };
}
