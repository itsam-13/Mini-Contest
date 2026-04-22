import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

let stompClient = null;

export function connectWebSocket(onConnect) {
  if (stompClient?.connected) {
    onConnect?.(stompClient);
    return stompClient;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('WebSocket connected');
      onConnect?.(stompClient);
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame.headers['message']);
    },
  });

  stompClient.activate();
  return stompClient;
}

export function disconnectWebSocket() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

export function subscribeToTopic(topic, callback) {
  if (stompClient?.connected) {
    return stompClient.subscribe(topic, (msg) => {
      callback(JSON.parse(msg.body));
    });
  }
  return null;
}

export { stompClient };
