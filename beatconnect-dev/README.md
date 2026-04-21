# BeatConnect

Widget to chat with AI

## Getting started

```
npm i
npm run dev (to start local development)
npm run build (to build a new prod version of this plugin)
```

## How to integrate to any web app

1. **Build the production script**:
   ```bash
   npm run build
   ```
   The generated bundle will be in the `dist/resources/js/` folder.

2. **Embed the script**:
   Include the built script at the end of your HTML `<body>`:
   ```html
   <script src="path/to/chatbot-[hash].js"></script>
   ```

3. **Initialize the widget**:
   Call the global `init` function anywhere after the script is loaded:
   ```javascript
   window.BeatConnectWidget.init({
     chatbotLogo: '',             // Optional: Custom logo URL or Base64
     defaultAvatar: '',           // Optional: Custom user avatar
     welcomeMessage: 'Hello!',    // Optional: Initial greeting
     stream: true,                // Optional: Enable/disable streaming
     model: 'llama3',             // Optional: AI model name
     chatEndpoint: 'https://api.yourdomain.com/chat' // Your API endpoint
   });
   ```

