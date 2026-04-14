const API = "https://your-backend.onrender.com";

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const typing = document.getElementById("typing");

let recognition;

// 💬 SEND MESSAGE
async function sendMsg() {
  const text = input.value.trim();
  if (!text) return;

  const msgDiv = addMessage(text, "user", "✓"); // delivered
  input.value = "";

  typing.style.display = "block";

  try {
    const res = await fetch(API + "/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text,
        userId: "user1"
      })
    });

    const data = await res.json();

    typing.style.display = "none";

    addMessage(data.reply, "ai");

    // seen tick update
    msgDiv.querySelector(".tick").innerText = "✓✓";

    playVoice(data.reply);

  } catch (err) {
    typing.style.display = "none";
    addMessage("Error", "ai");
  }
}

// 🧠 ADD MESSAGE
function addMessage(text, type, tick = "") {
  const div = document.createElement("div");
  div.classList.add("msg", type);

  div.innerHTML = `
    ${text}
    ${type === "user" ? `<span class="tick">${tick}</span>` : ""}
  `;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  return div;
}

// 🔊 VOICE OUTPUT
async function playVoice(text) {
  const res = await fetch(API + "/voice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  const blob = await res.blob();
  const audio = new Audio(URL.createObjectURL(blob));
  audio.play();
}

// 🎤 VOICE INPUT (Speech-to-Text)
function startVoice() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Voice not supported");
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";

  recognition.start();

  recognition.onresult = function(event) {
    const speech = event.results[0][0].transcript;
    input.value = speech;
  };
}

// 📞 CALL
async function startCall() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const pc = new RTCPeerConnection();

  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  pc.ontrack = (e) => {
    document.getElementById("remoteAudio").srcObject = e.streams[0];
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await fetch(API + "/offer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(offer)
  });

  alert("Calling...");
}