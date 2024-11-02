import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  MessageSquare,
  BarChart2,
  Cpu,
  Globe,
  Zap,
  Shield,
  Users,
} from "lucide-react";
import { RetellWebClient } from "retell-client-js-sdk";

const webClient = new RetellWebClient();
const YOUR_API_KEY = "02e501b4-1b05-40f4-af3e-351f0819e13f";

const styles = `
  @keyframes pulse-brain {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
  }
  .animate-pulse-brain {
    animation: pulse-brain 3s infinite;
  }
`;

export default function LandingPage() {
  const [callStatus, setCallStatus] = useState<
    "not-started" | "active" | "inactive"
  >("not-started");
  const navigate = useNavigate();

  useEffect(() => {
    webClient.on("conversationStarted", () => {
      console.log("Conversation started");
      setCallStatus("active");
    });

    webClient.on("conversationEnded", ({ code, reason }) => {
      console.log("Conversation ended with code:", code, ", reason:", reason);
      setCallStatus("inactive");
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      setCallStatus("inactive");
    });

    webClient.on("update", (update) => {
      if (update.type === "transcript" && update.transcript) {
        console.log(`${update.transcript.speaker}: ${update.transcript.text}`);
      }
    });
  }, []);

  const toggleConversation = async () => {
    if (callStatus === "active") {
      webClient.stopCall();
      setCallStatus("inactive");
    } else {
      const agentId = "agent_6d2eaae13a8c7686a721346017";
      try {
        const response = await fetch(
          "https://api.retellai.com/v2/create-web-call",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${YOUR_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              agent_id: agentId,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        webClient
          .startCall({
            accessToken: data.access_token,
            callId: data.call_id,
            sampleRate: 48000,
            enableUpdate: true,
          })
          .catch(console.error);
        setCallStatus("active");
      } catch (error) {
        console.error("Error starting call:", error);
      }
    }
  };

  const handleGetStarted = () => {
    navigate("/auth");
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <style>{styles}</style>
      <div className="relative flex-1">
        <div className="relative z-10">
          <header className="px-4 lg:px-6 h-16 flex items-center bg-white shadow-sm">
            <a href="#" className="flex items-center justify-center">
              <img
                src="/dig-logo-notext.png"
                alt="Digital Agents Logo"
                className="h-8 w-8"
              />
              <span className="ml-2 text-xl font-bold text-blue-900">
                Digital Agents
              </span>
            </a>
            <nav className="ml-auto flex gap-4 sm:gap-6">
              <a
                className="text-sm font-medium text-blue-800 hover:text-blue-900"
                href="#features"
              >
                Features
              </a>
              <a
                className="text-sm font-medium text-blue-800 hover:text-blue-900"
                href="#how-it-works"
              >
                How It Works
              </a>
              <a
                className="text-sm font-medium text-blue-800 hover:text-blue-900"
                href="#get-started"
              >
                Get Started
              </a>
            </nav>
          </header>

          <main>
            <section className="py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-50">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-12 max-w-4xl mx-auto">
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                      Digital Agents :
                    </h1>

                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                      Second Brain 🧠 for Executives
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      Revolutionize your customer service with Digital Agents.
                      Handle orders, answer queries, and provide real-time
                      support via calls.
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-6">
                    <button
                      onClick={toggleConversation}
                      className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        callStatus === "active"
                          ? "bg-red-600 animate-pulse-brain"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <Brain
                        className={`h-16 w-16 ${
                          callStatus === "active"
                            ? "text-white"
                            : "text-blue-600"
                        }`}
                      />
                    </button>
                    <p className="text-gray-900 text-lg font-bold">
                      {callStatus === "active"
                        ? "Click to end conversation"
                        : "Try our Demo Agent!"}
                    </p>
                  </div>
                  <div className="pt-8">
                    <button
                      onClick={handleGetStarted}
                      className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <section
        id="features"
        className="w-full py-12 md:py-24 lg:py-32 bg-white"
      >
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-12 text-gray-900">
            Enterprise-Grade Features
          </h2>
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <Brain className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Advanced AI Processing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                State-of-the-art language models for human-like interactions and
                understanding.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <Shield className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Enterprise Security
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-grade security with end-to-end encryption and compliance
                measures.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <Globe className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Global Scalability
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Scale your operations globally with multi-language support and
                24/7 availability.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <BarChart2 className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Advanced Analytics
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Deep insights through conversation analytics and performance
                metrics.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <Cpu className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Custom Integration
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Seamlessly integrate with your existing systems and workflows.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <Zap className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Real-time Processing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Instant responses and real-time decision making capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="w-full py-12 md:py-24 lg:py-32 bg-gray-50"
      >
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-12 text-gray-900">
            Implementation Process
          </h2>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                1. Assessment
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We analyze your business needs and identify key automation
                opportunities.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                2. Configuration
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Customize your Digital Agents with specific knowledge and
                capabilities.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                3. Integration
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Seamlessly connect with your existing systems and databases.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                4. Deployment
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Launch your Digital Agents with comprehensive testing and
                monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="get-started"
        className="w-full py-12 md:py-24 lg:py-32 bg-white"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">
              Ready to Transform Your Business?
            </h2>
            <p className="max-w-[600px] text-gray-600 text-lg md:text-xl leading-relaxed">
              Join leading enterprises already using Digital Agents to
              revolutionize their operations.
            </p>
            <button
              onClick={handleGetStarted}
              className="px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-sm text-gray-500">
          © 2024 Digital Agents. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a
            className="text-sm hover:underline underline-offset-4 text-gray-500"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-sm hover:underline underline-offset-4 text-gray-500"
            href="#"
          >
            Privacy Policy
          </a>
        </nav>
      </footer> */}
    </div>
  );
}
