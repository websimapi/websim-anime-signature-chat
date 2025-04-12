import { createImageBackground } from './imageProcessor.js';

let isDrawing = false;
let context;
let canvas;

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('signatureCanvas');
  context = canvas.getContext('2d');
  
  // Set canvas background to white
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  setupCanvas();
  setupGenerateButton();
});

function setupCanvas() {
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
}

function startDrawing(e) {
  isDrawing = true;
  draw(e);
}

function draw(e) {
  if (!isDrawing) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  context.lineWidth = 2;
  context.lineCap = 'round';
  context.lineTo(x, y);
  context.stroke();
  context.beginPath();
  context.moveTo(x, y);
}

function stopDrawing() {
  isDrawing = false;
  context.beginPath();
}

function setupGenerateButton() {
  const generateBtn = document.getElementById('generateBtn');
  generateBtn.addEventListener('click', generateAnimeCharacter);
}

async function generateAnimeCharacter() {
  const signatureDataUrl = canvas.toDataURL();
  
  // Analyze signature with AI
  const completion = await websim.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Analyze the signature drawing and create a detailed anime character description based on the lines, curves, and patterns."
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: signatureDataUrl }
          }
        ]
      }
    ]
  });

  const characterDescription = completion.content;
  
  // Generate anime character image with white background
  const imagePrompt = `${characterDescription}, anime style, white background, high quality, detailed`;
  const result = await websim.imageGen({
    prompt: imagePrompt,
    width: 512,
    height: 512
  });

  // Process the image to make background transparent
  const processedImage = await createImageBackground(result.url);
  
  // Display the processed image
  const characterContainer = document.getElementById('characterContainer');
  characterContainer.innerHTML = '';
  characterContainer.appendChild(processedImage);
  
  // Add character's first message
  const chatContainer = document.getElementById('chatContainer');
  const message = document.createElement('div');
  message.className = 'chat-message';
  message.textContent = `Hello! I was born from your signature. ${characterDescription}`;
  chatContainer.appendChild(message);
}

