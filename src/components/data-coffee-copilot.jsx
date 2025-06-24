import { useState, createContext, useContext } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Coffee, X, Minimize2, Maximize2, Send } from "lucide-react";
import { cn } from "../lib/utils";

const CopilotContext = createContext({
  isOpen: false,
  isMinimized: false,
  toggleOpen: () => {},
  toggleMinimized: () => {}
});

const CopilotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);
  const toggleMinimized = () => setIsMinimized(!isMinimized);

  return (
    <CopilotContext.Provider value={{ isOpen, isMinimized, toggleOpen, toggleMinimized }}>
      {children}
    </CopilotContext.Provider>
  );
};

const useCopilot = () => {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error('useCopilot must be used within a CopilotProvider');
  }
  return context;
};

export function DataCoffeeCopilot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "system",
      content: "Welcome to Data Coffee Copilot! I'm here to help you brew the perfect data solutions. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "ai",
        content: "I understand you're looking for help with that. Let me brew up some suggestions for you...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setInputValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm",
                    message.type === "user"
                      ? "bg-[#8B5A40] text-white"
                      : message.type === "ai"
                      ? "bg-[#f7f1eb] text-[#6f4536] border border-[#e6d5c5]"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div className="border-t border-[#e6d5c5] p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Data Coffee Copilot..."
            className="flex-1 border-[#e6d5c5] focus:border-[#8B5A40]"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-[#8B5A40] hover:bg-[#6f4536] text-white"
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PersistentDataCoffeeCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-[#8B5A40] hover:bg-[#6f4536] text-white shadow-lg z-50"
      >
        <Coffee className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-80 shadow-xl border-[#e6d5c5] z-50 transition-all duration-300",
      isMinimized ? "h-16" : "h-96"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[#8B5A40] to-[#6f4536] text-white rounded-t-lg">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Coffee className="h-4 w-4" />
          Data Coffee Copilot
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="p-0 h-80">
          <DataCoffeeCopilot />
        </CardContent>
      )}
    </Card>
  );
}