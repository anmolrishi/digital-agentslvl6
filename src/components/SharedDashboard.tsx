import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { RetellWebClient } from "retell-client-js-sdk";
import { motion } from "framer-motion";
import { Podcast } from "lucide-react";
import { Mode } from './ModeSelector';

const webClient = new RetellWebClient();
const YOUR_API_KEY = "key_1d2025c27c6328b3f9840255e4df";
const CLOUD_FUNCTION_BASE_URL = "https://us-central1-digital-agents-c8c36.cloudfunctions.net";

const saveCallAnalytics = async (userId: string, callId: string, mode: Mode) => {
  console.log(`[Analytics] Starting analytics save for call ${callId}`);
  console.log(`[Analytics] User ID: ${userId}, Mode: ${mode}`);

  try {
    let analyticsData = null;
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 5000;

    while (attempts < maxAttempts) {
      console.log(`[Analytics] Attempt ${attempts + 1}/${maxAttempts} to fetch call data`);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempts += 1;

      const response = await fetch(
        `https://api.retellai.com/v2/get-call/${callId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${YOUR_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        console.error(`[Analytics] HTTP error fetching call data: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      analyticsData = await response.json();
      console.log(`[Analytics] Received data:`, analyticsData);
      
      if (analyticsData && Object.keys(analyticsData).length > 0) {
        console.log(`[Analytics] Valid data received on attempt ${attempts}`);
        break;
      }
      
      console.log(`[Analytics] Empty or invalid data received, retrying...`);
    }

    if (!analyticsData) {
      console.error(`[Analytics] Failed to get valid analytics data after ${maxAttempts} attempts`);
      throw new Error("Failed to get analytics data after maximum attempts");
    }

    console.log(`[Analytics] Saving to Cloud Function...`);
    const response = await fetch(
      `${CLOUD_FUNCTION_BASE_URL}/saveModeDashboardAnalyticsHttp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, callId, analyticsData, mode })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[Analytics] Cloud Function error:`, errorData);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${JSON.stringify(
          errorData
        )}`
      );
    }

    const result = await response.json();
    console.log(`[Analytics] Save successful:`, result);
  } catch (error) {
    console.error("[Analytics] Error in saveCallAnalytics:", error);
    if (error instanceof Error) {
      console.error("[Analytics] Error details:", {
        message: error.message,
        stack: error.stack
      });
    }
  }
};

export default function SharedDashboard() {
  const { userId, mode } = useParams<{ userId: string; mode: Mode }>();
  const [searchParams] = useSearchParams();
  const isEmbedded = searchParams.get('embed') === 'true';
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [agentData, setAgentData] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<
    "not-started" | "active" | "inactive"
  >("not-started");
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const currentCallIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentCallIdRef.current = currentCallId;
  }, [currentCallId]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId && mode) {
        try {
          console.log(`[SharedDashboard] Fetching user data for ${userId} in ${mode} mode`);
          const response = await fetch(
            `${CLOUD_FUNCTION_BASE_URL}/getModeUserDataHttp?userId=${userId}&mode=${mode}`
          );
          if (!response.ok) {
            console.error(`[SharedDashboard] Error fetching user data: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log(`[SharedDashboard] Received user data:`, data);
          setRestaurantName(data.restaurantName || "");
          setAgentData(data[`${mode}AgentData`] || null);
        } catch (error) {
          console.error("[SharedDashboard] Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [userId, mode]);

  useEffect(() => {
    const handleConversationStarted = () => {
      console.log(`[SharedDashboard] Conversation started`);
      setCallStatus("active");
    };

    const handleConversationEnded = () => {
      console.log(`[SharedDashboard] Conversation ended`);
      setCallStatus("inactive");
      if (currentCallIdRef.current && userId && mode) {
        console.log(`[SharedDashboard] Initiating analytics save for call ${currentCallIdRef.current}`);
        saveCallAnalytics(userId, currentCallIdRef.current, mode);
      }
    };

    const handleError = (error: any) => {
      console.error("[SharedDashboard] WebClient error:", error);
      setCallStatus("inactive");
    };

    webClient.on("conversationStarted", handleConversationStarted);
    webClient.on("conversationEnded", handleConversationEnded);
    webClient.on("error", handleError);

    return () => {
      webClient.off("conversationStarted", handleConversationStarted);
      webClient.off("conversationEnded", handleConversationEnded);
      webClient.off("error", handleError);
    };
  }, [userId, mode]);

  const toggleConversation = async () => {
    if (callStatus === "active") {
      try {
        console.log(`[SharedDashboard] Stopping call`);
        await webClient.stopCall();
        setCallStatus("inactive");
        if (currentCallIdRef.current && userId && mode) {
          console.log(`[SharedDashboard] Initiating analytics save after stop`);
          saveCallAnalytics(userId, currentCallIdRef.current, mode);
        }
      } catch (error) {
        console.error("[SharedDashboard] Error stopping call:", error);
      }
    } else {
      if (!agentData) {
        console.error("[SharedDashboard] Agent not created yet");
        return;
      }

      try {
        console.log(`[SharedDashboard] Starting new call with agent ${agentData.agent_id}`);
        const response = await fetch(
          "https://api.retellai.com/v2/create-web-call",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${YOUR_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              agent_id: agentData.agent_id,
            })
          }
        );

        if (!response.ok) {
          console.error(`[SharedDashboard] Error creating web call: ${response.status}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`[SharedDashboard] Web call created:`, data);
        setCurrentCallId(data.call_id);

        await webClient.startCall({
          accessToken: data.access_token,
          callId: data.call_id,
          sampleRate: 16000,
          enableUpdate: true,
        });
        setCallStatus("active");
        console.log(`[SharedDashboard] Call started successfully`);
      } catch (error) {
        console.error("[SharedDashboard] Error starting call:", error);
      }
    }
  };

  const containerStyle = isEmbedded ? {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    padding: '1rem',
    background: 'transparent'
  } : {
    display: 'flex',
    minHeight: '100vh',
    background: 'rgb(239, 246, 255)'
  };

  const contentStyle = isEmbedded ? {
    width: 'auto'
  } : {
    width: '100%',
    padding: '2rem'
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {!isEmbedded && (
          <div className="text-center mb-8 pt-2">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              {restaurantName}'s {mode?.charAt(0).toUpperCase() + mode?.slice(1)} Assistant
            </h1>
            <p className="text-xl text-blue-700">Virtual Assistant</p>
          </div>
        )}
        <div className={`flex justify-center items-center ${isEmbedded ? '' : 'h-[calc(100vh-12rem)]'}`}>
          <div className="relative cursor-pointer z-10" onClick={toggleConversation}>
            <motion.div
              animate={{
                scale: callStatus === "active" ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                repeat: callStatus === "active" ? Infinity : 0,
                repeatType: "reverse",
              }}
            >
              <div
                className={`rounded-full p-8 ${
                  callStatus === "active" ? "bg-[#92d0ff]" : "bg-white"
                } shadow-lg ${
                  callStatus === "active"
                    ? "shadow-[#92d0ff]"
                    : "shadow-blue-200"
                }`}
              >
                <motion.div
                  animate={{
                    rotate: callStatus === "active" ? [0, 360] : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: callStatus === "active" ? Infinity : 0,
                    ease: "linear",
                  }}
                >
                  <Podcast
                    size={60}
                    color={callStatus === "active" ? "white" : "#92d0ff"}
                  />
                </motion.div>
              </div>
            </motion.div>
            {callStatus === "active" && (
              <motion.div
                className="absolute -inset-3 rounded-full bg-[#92d0ff] opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}