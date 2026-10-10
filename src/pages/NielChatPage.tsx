import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { mockAIService, INITIAL_NIEL_MESSAGES } from '../services/mockAIService';
import { NielMessage } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { NielCommandCenter } from '../niel/NielCommandCenter';
import {
  Sparkles,
  Send,
  ArrowRight,
  ShieldCheck,
  Radio,
  MessageSquare,
  Maximize2
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Plan a trip to Manali',
  'How much budget is remaining?',
  'Is there traffic on my route?',
  'Find a cheaper hotel alternative',
  'What should I visit today in Solang?',
  'Suggest an alternative indoor activity',
];

export const NielChatPage: React.FC = () => {
  const { activeTrip } = useTrip();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeView, setActiveView] = useState<'chat' | 'radar'>('chat');
  const [messages, setMessages] = useState<NielMessage[]>(INITIAL_NIEL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = useCallback(async (text: string) => {
    const clean = text.trim();
    if (!clean) return;

    const userMsg: NielMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      content: clean,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const nielResp = await mockAIService.processUserMessage(clean, {
        budget: activeTrip?.budget,
        spent: activeTrip?.actualSpent,
        destination: activeTrip?.destination,
      });

      setMessages((prev) => [...prev, nielResp]);
    } catch {
      // Fallback
    } finally {
      setIsTyping(false);
    }
  }, [activeTrip]);

  const hasProcessedPromptRef = useRef<string | null>(null);

  // Handle URL query parameter if launched with a pre-filled prompt
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam && hasProcessedPromptRef.current !== promptParam) {
      hasProcessedPromptRef.current = promptParam;
      handleSendMessage(promptParam);
      navigate('/niel-ai', { replace: true });
    }
  }, [searchParams, handleSendMessage, navigate]);

  const handleActionClick = (action: NonNullable<NielMessage['actions']>[number]) => {
    if (action.actionType === 'plan_trip') {
      navigate('/trips/new');
    } else if (action.actionType === 'view_itinerary' && activeTrip) {
      navigate(`/trips/${activeTrip.id}`);
    } else if (action.actionType === 'add_expense') {
      navigate('/expenses');
    } else if (action.actionType === 'apply_coupon') {
      navigate('/offers');
    } else if (action.actionType === 'accept_alt' && activeTrip) {
      navigate(`/trips/${activeTrip.id}/live`);
    } else if ((action as any).actionType === 'open_radar') {
      setActiveView('radar');
    } else {
      handleSendMessage(`Confirmed action: ${action.label}`);
    }
  };

  return (
    <div className={`${activeView === 'radar' ? 'max-w-7xl' : 'max-w-4xl'} mx-auto h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in transition-all duration-300`}>
      {/* 1. Header & Dual Mode Switcher */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#062B5C] via-[#09356E] to-[#1267D6] text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full bg-white/20 overflow-hidden ring-2 ring-white/60 flex items-center justify-center shrink-0">
            <img
              src="/assets/images/niel-mascot.jpg"
              alt="NIEL AI"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Sparkles className="w-5 h-5 text-amber-300 absolute" />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#19A974] ring-2 ring-white" />
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-1.5 leading-tight">
              NIEL AI Intelligence Suite
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h2>
            <p className="text-xs text-blue-100 flex items-center gap-1">
              <span>Synchronized with {activeTrip?.destination || 'Active Network'}</span>
              <span>•</span>
              <span className="text-emerald-300 font-bold">Online</span>
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher Pills */}
        <div className="flex items-center bg-black/30 p-1 rounded-2xl border border-white/15 backdrop-blur-md">
          <button
            onClick={() => setActiveView('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'chat'
                ? 'bg-white text-[#062B5C] shadow-md scale-102'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Assistant</span>
          </button>
          <button
            onClick={() => setActiveView('radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'radar'
                ? 'bg-cyan-400 text-[#020617] shadow-[0_0_12px_rgba(34,211,238,0.5)] font-black scale-102'
                : 'text-white/80 hover:text-cyan-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>3D Radar & Telemetry</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/niel')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-105"
            title="Open Fullscreen NIEL Command Center"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen Hub</span>
          </button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/trips/new')}
            className="text-white hover:bg-white/10 text-xs font-semibold border border-white/20 hidden md:inline-flex"
          >
            New Trip Wizard
          </Button>
        </div>
      </div>

      {/* Conditional View: 3D Radar or Conversational Chat */}
      {activeView === 'radar' ? (
        <div className="flex-1 w-full relative overflow-hidden bg-[#020617]">
          <NielCommandCenter onBack={() => setActiveView('chat')} />
        </div>
      ) : (
        <>
          {/* 2. Message History Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F8FAFC] dark:bg-slate-950">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#062B5C] to-[#1267D6] text-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                  <img
                    src="/assets/images/niel-mascot.jpg"
                    alt="NIEL"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
              )}

              {/* Message Bubble & Content */}
              <div className={`max-w-[85%] sm:max-w-lg space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-[#1267D6] text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-[#031D3D] dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  <p>{msg.content}</p>
                  <span
                    className={`block text-[10px] mt-1.5 text-right ${
                      isUser ? 'text-blue-200' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Structured Response Card if present */}
                {msg.card && (
                  <Card className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-2">
                    {msg.card.imageUrl && (
                      <div className="aspect-[16/7] rounded-xl overflow-hidden mb-2 bg-slate-100 dark:bg-slate-700">
                        <img
                          src={msg.card.imageUrl}
                          alt={msg.card.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#031D3D] dark:text-white">{msg.card.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{msg.card.subtitle}</p>
                      </div>
                      {msg.card.price && (
                        <div className="text-right shrink-0 ml-2">
                          <span className="text-xs font-extrabold text-[#062B5C] dark:text-blue-400 block">
                            {msg.card.price}
                          </span>
                          {msg.card.savings && (
                            <span className="text-[10px] font-bold text-[#19A974] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-md">
                              {msg.card.savings}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Action Buttons if present */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.actions.map((act, index) => (
                      <button
                        key={index}
                        onClick={() => handleActionClick(act)}
                        className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-[#EAF4FF] dark:hover:bg-slate-700 border border-[#1267D6]/30 dark:border-blue-500/40 text-[#1267D6] dark:text-blue-300 hover:border-[#1267D6] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer group"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1267D6] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1267D6] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#1267D6] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#1267D6] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Chips & Input Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
        {/* Horizontal scrollable quick suggestion chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#EAF4FF] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#1267D6] dark:hover:text-blue-300 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input & Send Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask NIEL anything about your trip, weather, hotels or budget..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#1267D6] rounded-2xl text-xs sm:text-sm font-medium text-[#031D3D] dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-[#1267D6]/10 transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-3 rounded-2xl bg-[#1267D6] hover:bg-[#0E52AD] text-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md shadow-[#1267D6]/20 cursor-pointer shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
        </>
      )}
    </div>
  );
};
