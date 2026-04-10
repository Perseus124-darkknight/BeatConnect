import { BeatConnectAI } from '../../widget-src/core/BeatConnectAI.js';

const mockWS = {
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1
};

global.WebSocket = jest.fn().mockImplementation(() => mockWS);
global.WebSocket.OPEN = 1;

describe('BeatConnectAI Core SDK', () => {
  let sdk;

  beforeEach(() => {
    sdk = new BeatConnectAI({
        chatEndpoint: 'http://localhost:3000/api/chat',
        isPro: true
    });
  });

  test('should initialize with correct endpoints', () => {
    expect(sdk.config.chatEndpoint).toBe('http://localhost:3000/api/chat');
    expect(sdk.wsEndpoint).toBe('ws://localhost:3000');
  });

  test('should handle context loading and clearing', () => {
    const mockContext = [{ role: 'user', content: 'hello' }];
    sdk.loadContext(mockContext);
    expect(sdk.getContext()).toEqual(mockContext);
    
    sdk.clearContext();
    expect(sdk.getContext()).toEqual([]);
  });

  test('should derive WebSocket endpoint correctly from different URLs', () => {
    const sdk2 = new BeatConnectAI({ chatEndpoint: 'https://api.beatconnect.io/api/chat' });
    expect(sdk2.wsEndpoint).toBe('wss://api.beatconnect.io');
  });

  test('should toggle voice mode state', () => {
    const initialState = sdk.isVoiceModeEnabled;
    const newState = sdk.toggleVoiceMode();
    expect(newState).toBe(!initialState);
    expect(sdk.isVoiceModeEnabled).toBe(newState);
  });

  test('sendMessage should call ws.send with correct payload', async () => {
    // Clear previous calls
    mockWS.send.mockClear();
    
    await sdk.sendMessage({ message: 'Hello AI' });
    
    expect(mockWS.send).toHaveBeenCalled();
    const payload = JSON.parse(mockWS.send.mock.calls[0][0]);
    expect(payload.type).toBe('chat');
    expect(payload.prompt).toBe('Hello AI');
  });
});
