import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Message from "./Message";
import { ChevronLeft, Send, Calendar, Clock, FileText } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [leaveData, setLeaveData] = useState({
    startDate: null,
    endDate: null,
    user_id: "169",
    Leave_type: "",
    reason: "",
    half_day: "N"
  });
  const [currentStep, setCurrentStep] = useState(null);
  const chatAreaRef = useRef(null);

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickActions = [
    { label: "Apply Leave", icon: Calendar, query: "apply_leave" },
    { label: "Leave Balance", icon: Clock, query: "What is my leave balance?" },
    { label: "Leave Policy", icon: FileText, query: "Tell me about the leave policy" }
  ];

  const handleDateSelect = async (field, value) => {
    if (field === 'leave_type') {
      setLeaveData(prev => ({ ...prev, leave_type: value }));
      await processLeaveBalance(value);
      return;
    }

    setLeaveData(prev => ({ ...prev, [field]: value }));
    if (field === "startDate") {
      setCurrentStep("end_date");
      setMessages(prev => [...prev, {
        role: "bot",
        content: {
          type: "date_picker",
          field: "endDate",
          message: "Select end date:"
        },
        timestamp: new Date().toISOString()
      }]);
    } else if (field === "endDate") {
      setCurrentStep("reason");
      setMessages(prev => [...prev, {
        role: "bot",
        content: "Please provide reason for leave:",
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleLeaveApplication = async () => {
    setCurrentStep("leave_type");
    setMessages(prev => [...prev, {
      role: "bot",
      content: "Please select the type of leave you wish to apply for: Casual Leave (CL), Privilege Leave (PL), or Sick Leave (SL).",
      timestamp: new Date().toISOString()
    }]);
  };

  const handleLeaveBalance = async (leaveType = "") => {
    if (leaveType) {
      setLeaveData(prev => ({ ...prev, leave_type: leaveType }));
      await processLeaveBalance(leaveType);
    } else {
      setCurrentStep("balance_type");
      setMessages(prev => [...prev, {
        role: "bot",
        content: {
          type: "leave_type_selection",
          message: "Select leave type to check:",
          options: [
            { label: "All Types", value: "" },
            { label: "Casual Leave (CL)", value: "CL" },
            { label: "Privilege Leave (PL)", value: "PL" },
            { label: "Sick Leave (SL)", value: "SL" }
          ]
        },
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const processLeaveApplication = async () => {
    try {
      const formattedData = {
        ...leaveData,
        startDate: leaveData.startDate ? leaveData.startDate.toISOString().split('T')[0] : null,
        endDate: leaveData.endDate ? leaveData.endDate.toISOString().split('T')[0] : null
      };

      const response = await axios.post("http://127.0.0.1:5000/apply_leave", formattedData);
      const botMessage = {
        role: "bot",
        content: {
          type: "leave_response",
          status: response.data.status === "success" ? "success" : "error",
          message: response.data.message
        },
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: "bot",
        content: {
          type: "leave_response",
          status: "error",
          message: "Failed to submit leave application. Please try again."
        },
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setCurrentStep(null);
    setLeaveData({
      startDate: null,
      endDate: null,
      user_id: "169",
      Leave_type: "",
      reason: "",
      half_day: "N"
    });
  };

  const processLeaveBalance = async (selectedType) => {
    const leaveType = selectedType !== undefined ? selectedType : leaveData.leave_type || "";
    try {
      const payload = {
        user_id: leaveData.user_id,
        leave_type: leaveType
      };
      const response = await axios.post("http://127.0.0.1:5000/leave_balance", payload);
      if (response.data.status) {
        const leaveDetails = response.data.data;
        let combinedLeaveBalanceMessage = "";
        if (leaveType === "") {
          const leaveBalanceStrings = Object.keys(leaveDetails).map(key => {
            return `- Leave Type: ${leaveDetails[key].leave_type}, Balance: ${leaveDetails[key].leave_balance}`;
          });
          combinedLeaveBalanceMessage = leaveBalanceStrings.join("\n");
        } else {
          const leaveTypeKey = Object.keys(leaveDetails)[0];
          const detail = leaveDetails[leaveTypeKey];
          combinedLeaveBalanceMessage = `- Leave Type: ${detail.leave_type}, Balance: ${detail.leave_balance}`;
        }
        const botMessage = {
          role: "bot",
          content: combinedLeaveBalanceMessage,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          role: "bot",
          content: "Failed to fetch leave balance. Please try again.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        role: "bot",
        content: "Failed to fetch leave balance. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setCurrentStep(null);
      setLeaveData(prev => ({ ...prev, leave_type: "" }));
    }
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = { role: "user", content: messageText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    if (messageText === "apply_leave") {
      handleLeaveApplication();
      setLoading(false);
      return;
    }

    if (currentStep) {
      switch (currentStep) {
        case "leave_type":
          setLeaveData(prev => ({ ...prev, Leave_type: messageText.toUpperCase() }));
          setCurrentStep("start_date");
          setMessages(prev => [...prev, {
            role: "bot",
            content: {
              type: "date_picker",
              field: "startDate",
              message: "Select start date:"
            },
            timestamp: new Date().toISOString()
          }]);
          break;

        case "reason":
          setLeaveData(prev => ({ ...prev, reason: messageText }));
          setCurrentStep("half_day");
          setMessages(prev => [...prev, {
            role: "bot",
            content: "Is this a half day leave? (Y/N):",
            timestamp: new Date().toISOString()
          }]);
          break;

        case "half_day":
          const updatedLeaveData = { ...leaveData, half_day: messageText.toUpperCase() };
          setLeaveData(updatedLeaveData);
          setCurrentStep("confirm");
          setMessages(prev => [...prev, {
            role: "bot",
            content: {
              type: "leave_confirmation",
              details: JSON.stringify({
                ...updatedLeaveData,
                startDate: updatedLeaveData.startDate ? updatedLeaveData.startDate.toISOString().split('T')[0] : null,
                endDate: updatedLeaveData.endDate ? updatedLeaveData.endDate.toISOString().split('T')[0] : null
              }),
              message: "Please confirm your leave application (Y/N):"
            },
            timestamp: new Date().toISOString()
          }]);
          break;

        case "confirm":
          if (messageText.toLowerCase() === 'y' || messageText.toLowerCase() === 'yes') {
            const confirmationMessages = messages.filter(
              msg => msg.role === "bot" && msg.content?.type === "leave_confirmation"
            );
            const latestConfirmationMessage = confirmationMessages[confirmationMessages.length - 1];

            let dataToSubmit = leaveData;
            if (latestConfirmationMessage && latestConfirmationMessage.content.details) {
              try {
                dataToSubmit = JSON.parse(latestConfirmationMessage.content.details);
              } catch (e) {
                console.error("Error parsing confirmation details:", e);
              }
            }

            try {
              const response = await axios.post("http://127.0.0.1:5000/apply_leave", dataToSubmit);
              const botMessage = {
                role: "bot",
                content: {
                  type: "leave_response",
                  status: response.data.status === "success" ? "success" : "error",
                  message: response.data.message
                },
                timestamp: new Date().toISOString()
              };
              setMessages(prev => [...prev, botMessage]);
            } catch (error) {
              const errorMessage = {
                role: "bot",
                content: {
                  type: "leave_response",
                  status: "error",
                  message: "Failed to submit leave application. Please try again."
                },
                timestamp: new Date().toISOString()
              };
              setMessages(prev => [...prev, errorMessage]);
            } finally {
              setCurrentStep(null);
              setLeaveData({
                startDate: null,
                endDate: null,
                user_id: "169",
                Leave_type: "",
                reason: "",
                half_day: "N"
              });
              setLoading(false);
            }
          } else if (messageText.toLowerCase() === 'n' || messageText.toLowerCase() === 'no') {
            setMessages(prev => [...prev, {
              role: "bot",
              content: "Leave application cancelled.",
              timestamp: new Date().toISOString()
            }]);
            setCurrentStep(null);
            setLeaveData({
              startDate: null,
              endDate: null,
              user_id: "169",
              Leave_type: "",
              reason: "",
              half_day: "N"
            });
            setLoading(false);
          }
          break;

        case "balance_type":
          const leaveType = messageText.toUpperCase();
          if (["CL", "PL", "SL", ""].includes(leaveType)) {
            setLeaveData(prev => ({ ...prev, leave_type: leaveType }));
            await processLeaveBalance(leaveType);
          } else {
            setMessages(prev => [...prev, {
              role: "bot",
              content: "Invalid leave type. Please select from the options above.",
              timestamp: new Date().toISOString()
            }]);
          }
          break;

        default:
          break;
      }
      setLoading(false);
    } else {
      setLoading(true);
      try {
        const response = await axios.post("http://127.0.0.1:5000/chat", { question: messageText });
        const answerContent = response.data.answer;

        if (!answerContent) {
          throw new Error("Received null or undefined answer from backend");
        }

        if (typeof answerContent === 'object' && answerContent.type === 'leave_confirmation') {
          const botMessage = {
            role: "bot",
            content: {
              type: "leave_confirmation",
              details: JSON.stringify(answerContent.details),
              message: "Please confirm your leave application (Y/N):"
            },
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, botMessage]);
          setCurrentStep("confirm");
        } else {
          const botMessage = {
            role: "bot",
            content: answerContent,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, botMessage]);
          setLoading(false);
        }
      } catch (error) {
        const errorMessage = {
          role: "bot",
          content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex bg-green-50" style={{ width: '700px', height: '700px', margin: '0 auto' }}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <div className="bg-green-600 px-4 py-3 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden text-white hover:text-green-100"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">UKNOWVA HRMS Assistant</h1>
            <p className="text-sm text-green-100">Your AI-powered HR companion</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          ref={chatAreaRef}
          className="flex-1 overflow-y-auto p-4 pb-[200px] space-y-4"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="text-2xl font-semibold text-emerald-800">
                Welcome to UKNOWVA HRMS Assistant
              </div>
              <div className="text-emerald-600">
                How can I help you today?
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(action.query)}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-emerald-100 hover:border-emerald-300 group"
                  >
                    <action.icon className="text-emerald-600 group-hover:scale-110 transition-transform" size={24} />
                    <span className="font-medium text-emerald-800">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <Message key={index} message={message} onDateSelect={handleDateSelect} onSend={sendMessage} />
          ))}
          
          {loading && (
            <div className="flex items-center space-x-2 text-emerald-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>

        {/* Quick Actions Bar */}
        <div className="absolute bottom-[104px] left-0 right-0 bg-white border-t p-2">
          <div className="flex gap-2 overflow-x-auto pb-2 px-2 max-w-4xl mx-auto">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => sendMessage(action.query)}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors whitespace-nowrap text-sm text-emerald-700"
              >
                <action.icon size={16} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-[40px] left-0 right-0 bg-white border-t p-2.5">
          <div className="max-w-4xl mx-auto flex gap-4 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                rows="1"
                className="w-full p-3 pr-12 rounded-lg border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none overflow-hidden"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="absolute right-3 bottom-3 text-emerald-600 hover:text-emerald-700 disabled:text-gray-400"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-green-800 text-white py-2 px-4 text-center text-sm select-none shadow-lg" style={{ userSelect: 'none', pointerEvents: 'none', height: '40px' }}>
          Powered by <span className="font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-green-200 animate-pulse">arham.ai</span>
        </div>
      </div>
    </div>
  );
}
