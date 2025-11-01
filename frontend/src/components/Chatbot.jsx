import React, { useState, useRef, useEffect } from 'react';
import { getAIResponse, testBackendConnection } from '../services/aiService';
import './Chatbot.css';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        {
            text: "Xin chào! 👋\nTôi là trợ lý AI của hệ thống quản lý điểm số.\nTôi có thể giúp gì cho bạn hôm nay?",
            isUser: false
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('checking');
    const [isChatVisible, setIsChatVisible] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        const checkConnection = async () => {
            const result = await testBackendConnection();
            if (result.success) {
                setConnectionStatus('connected');
                console.log('✅ Backend connected successfully');
            } else {
                setConnectionStatus('failed');
                console.log('❌ Backend connection failed:', result.error);
            }
        };
        
        checkConnection();
    }, []);

    const simulateTyping = async (userMessage) => {
        setIsTyping(true);
        
        try {
            const response = await getAIResponse(userMessage);
            
            setIsTyping(false);
            setMessages(prev => [...prev, {
                text: response,
                isUser: false
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
                isUser: false
            }]);
        }
    };

    const sendMessage = () => {
        const message = inputMessage.trim();
        if (message) {
            setMessages(prev => [...prev, {
                text: message,
                isUser: true
            }]);
            setInputMessage('');
            simulateTyping(message);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const handleQuickQuestion = (question) => {
        setMessages(prev => [...prev, {
            text: question,
            isUser: true
        }]);
        setInputMessage('');
        simulateTyping(question);
    };

    // Hàm làm mới đoạn chat
    const refreshChat = () => {
        setMessages([
            {
                text: "Xin chào! 👋\nTôi là trợ lý AI của hệ thống quản lý điểm số.\nTôi có thể giúp gì cho bạn hôm nay?",
                isUser: false
            }
        ]);
        setInputMessage('');
        setIsTyping(false);
    };

    const toggleChat = () => {
        setIsChatVisible(!isChatVisible);
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Online';
            case 'failed': return 'Offline';
            default: return 'Loading...';
        }
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return '#10b981';
            case 'failed': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    return (
        <>
            {/* Floating Chat Icon */}
            <div 
                className={`chatbot-floating-icon ${isChatVisible ? 'hidden' : ''}`}
                onClick={toggleChat}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                <div className="notification-dot"></div>
            </div>

            {/* Chat Container với toggle */}
            <div className={`chatbot-wrapper ${isChatVisible ? 'visible' : 'hidden'}`}>
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <div 
                                className="status-indicator" 
                                style={{ background: getStatusColor() }}
                            ></div>
                            <h1>Trợ lý Học Tập</h1>
                            <span className="status-text">{getStatusText()}</span>
                        </div>
                        <div className="chatbot-header-actions">
                            {/* Nút làm mới chat với text */}
                            <button 
                                className="chatbot-refresh-btn"
                                onClick={refreshChat}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                                </svg>
                            </button>
                            {/* Nút đóng chat với text */}
                            <button 
                                className="chatbot-close-btn" 
                                onClick={toggleChat}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                                <span className="btn-text">Close</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="chatbot-messages">
                        {messages.length === 0 ? (
                            <div className="empty-chat-state">
                                <div className="empty-chat-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#94a3b8">
                                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                                    </svg>
                                </div>
                                <h3>Chưa có tin nhắn nào</h3>
                                <p>Bắt đầu cuộc trò chuyện với trợ lý AI của bạn</p>
                                <button 
                                    className="start-chat-btn"
                                    onClick={refreshChat}
                                >
                                    Bắt đầu trò chuyện
                                </button>
                            </div>
                        ) : (
                            <>
                                {messages.map((message, index) => (
                                    <div 
                                        key={index} 
                                        className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
                                    >
                                        {message.text.split('\n').map((line, i) => (
                                            <span key={i}>
                                                {line}
                                                {i < message.text.split('\n').length - 1 && <br />}
                                            </span>
                                        ))}
                                    </div>
                                ))}
                            </>
                        )}
                        
                        {isTyping && (
                            <div className="typing-indicator">
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                AI đang suy nghĩ...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-container">
                        <div className="chatbot-input">
                            <input 
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Hỏi gì đi bro..."
                                className="chatbot-input-field"
                            />
                            <button 
                                onClick={sendMessage}
                                className="chatbot-send-button"
                                disabled={!inputMessage.trim()}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chatbot;