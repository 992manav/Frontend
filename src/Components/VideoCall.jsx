import { useEffect, useState } from "react";
import {
  CallingState,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import { useNavigate } from "react-router-dom";

const apiKey = 'mmhfdzb5evj2';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL09iaS1XYW5fS2Vub2JpIiwidXNlcl9pZCI6Ik9iaS1XYW5fS2Vub2JpIiwidmFsaWRpdHlfaW5fc2Vjb25kcyI6NjA0ODAwLCJpYXQiOjE3NDI1Nzg0NjksImV4cCI6MTc0MzE4MzI2OX0.Ja5GzxeK7kkwq3943hdOpXn4MWQvbyLN6yU-tvTCR6M';
const userId = 'Obi-Wan_Kenobi';
const callId = 'zBTMtesmRqzX';
// Set up the user object
const user = {
  id: userId,
  name: "James",
  image: "",
};

export function VideoCall() {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  useEffect(() => {
    const newClient = new StreamVideoClient({ apiKey, user, token });
    const newCall = newClient.call("default", callId);

    newCall
      .join({ create: true })
      .then(() => {
        setClient(newClient);
        setCall(newCall);
      })
      .catch((err) => {
        console.error("Failed to join the call", err);
      });

    return () => {
      if (newCall) {
        newCall.leave().catch((err) => {
          console.error("Failed to leave the call", err);
        });
      }
      if (newClient) {
        newClient.disconnectUser();
      }
    };
  }, []);

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-[#C7E9FF]">
        <div className="text-black font-medium">Connecting to call...</div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <MyUI />
      </StreamCall>
    </StreamVideo>
  );
}

export const MyUI = () => {
  const navigate = useNavigate();
  const call = useCall();
  const { useCallCallingState, useParticipants, useLocalParticipant } =
    useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-[#C7E9FF]">
        <div className="text-black font-medium">Joining call...</div>
      </div>
    );
  }

  const toggleAudio = async () => {
    if (localParticipant) {
      await call?.microphone.toggle();
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = async () => {
    if (localParticipant) {
      await call?.camera.toggle();
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = async () => {
    if (call) {
      await call.leave(); // Leave the call
      await new Promise((resolve) => setTimeout(resolve, 4000)); // Wait for 4 seconds

      navigate("/"); // Navigate to home page

      setTimeout(() => {
        window.close(); // Close window after a delay to ensure navigation happens
      }, 500); // Small delay to allow navigation
    }
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-screen bg-[#C7E9FF] text-black">
      {/* Header */}
      <div className="w-full p-4 flex justify-between items-center bg-white shadow-md">
        <h2 className="text-xl font-medium">
          Meeting Room: {call.id.slice(-4)}
        </h2>
        <div className="text-sm font-medium bg-[#C7E9FF] px-3 py-1 rounded-full">
          {participants.length} Participant
          {participants.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="flex space-x-6 pt-20 ">
        <button
          onClick={toggleAudio}
          className={`px-4 py-2 rounded-md flex items-center justify-center font-medium ${
            isMuted ? "bg-red-100 text-red-600" : "bg-[#89ffce] text-black"
          } hover:opacity-90 transition-all`}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={toggleVideo}
          className={`px-4 py-2 rounded-md flex items-center justify-center font-medium ${
            isVideoOff ? "bg-red-100 text-red-600" : "bg-[#19a3ff] text-black"
          } hover:opacity-90 transition-all`}
        >
          {isVideoOff ? "Start Video" : "Stop Video"}
        </button>

        <button
          onClick={() => {
            endCall()
          }}
          className="px-4 py-2 rounded-md bg-red-600 text-white flex items-center justify-center font-medium hover:bg-red-700 transition-all"
        >
          End Call
        </button>
      </div>
      {/* Video grid */}
      <div className="flex-1 w-full p-6 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-h-full">
          {participants.map((participant) => (
            <div
              key={participant.sessionId}
              className="relative bg-black rounded-lg overflow-hidden shadow-lg"
              style={{
                height: "300px",
                width: "100%",
              }}
            >
              <ParticipantView
                participant={participant}
                className="w-full h-full"
                fit="cover"
                trackType="videoTrack"
                autoFit={true}
              />
              <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white px-3 py-1 m-2 rounded-full text-sm">
                {participant.name || participant.userId}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full bg-white p-4 shadow-md flex justify-center"></div>
    </div>
  );
};
