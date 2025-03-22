import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const CommunityDiscussions = () => {
  const location = useLocation();
  const communityName = location.state?.communityName;
  console.log(communityName);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/community/getcommunitydiscussion/${communityName}`
        );
        setDiscussions(response.data.discussions || []);
      } catch (err) {
        setError("Failed to fetch discussions");
      } finally {
        setLoading(false);
      }
    };
    if (communityName) {
      fetchDiscussions();
    }
  }, [communityName]);

  const handleSendMessage = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      alert("Please enter both title and message.");
      return;
    }

    const newDiscussion = {
      patient: { name: "Anonymous" },
      title: newTitle,
      content: newMessage,
      date: new Date(),
    };

    try {
      const response = await axios.post(
        `http://localhost:3000/api/community/addnewdiscussion/${communityName}`,
        {
          title: newTitle,
          content: newMessage,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setDiscussions([...discussions, newDiscussion]);
        setNewTitle("");
        setNewMessage("");
      } else {
        toast.error("Failed to send message.");
      }
    } catch (error) {
      console.error("Error posting discussion:", error);
      toast.error("Something went wrong");
    }
  };

  if (loading)
    return <div className="text-center text-[#f47f62]">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.2) 1px, transparent 1px), 
                            linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative z-10 bg-gradient-to-b  from-[#fbd8cf] to-[#FFFFFF] bg-opacity-90 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <h1
            className="text-3xl text-center mb-7 font-bold text-[#c94a4a] cursor-pointer hover:scale-110 transition duration-300 ease-in-out tracking-widest"
            style={{ fontFamily: "Pixelcraft, sans-serif" }}
          >
            Community: {communityName}
          </h1>

          {discussions.length === 0 ? (
            <p className="text-gray-600">No discussions available.</p>
          ) : (
            discussions.map((discussion) => (
              <div
                key={discussion._id}
                className="bg-white rounded-lg shadow-sm mb-6 p-8 border border-gray-100"
              >
                <div className="text-[#f47f62] font-medium mb-3">
                  by {discussion.patient?.name || "Anonymous"}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {discussion.title}
                </h2>
                <p className="text-gray-700 mb-5 leading-relaxed">
                  {discussion.content}
                </p>
                <div className="text-red-500 font-medium">
                  Date: {new Date(discussion.date).toLocaleDateString()}
                </div>
              </div>
            ))
          )}

          <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2 border rounded-lg mb-3"
            />
            <textarea
              className="w-full p-3 border rounded-lg"
              rows="3"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={handleSendMessage}
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDiscussions;
