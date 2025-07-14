import React, { useState } from 'react';
import { Send, Users, Heart, Smile } from 'lucide-react';

const ChatSection: React.FC = () => {
  const [message, setMessage] = useState('');

  const messages = [
    {
      id: 1,
      user: 'TechEnthusiast',
      message: 'This is amazing content! Thanks for sharing',
      time: '2m ago',
      avatar: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
    },
    {
      id: 2,
      user: 'CodeMaster',
      message: 'Great explanation of the concepts',
      time: '3m ago',
      avatar: 'https://images.pexels.com/photos/2889942/pexels-photo-2889942.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
    },
    {
      id: 3,
      user: 'DevNewbie',
      message: 'Can you make a video about React hooks?',
      time: '5m ago',
      avatar: 'https://images.pexels.com/photos/3370021/pexels-photo-3370021.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
    },
    {
      id: 4,
      user: 'WebDev2024',
      message: 'Following along with the code examples',
      time: '7m ago',
      avatar: 'https://images.pexels.com/photos/1870163/pexels-photo-1870163.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
    },
    {
      id: 5,
      user: 'FrontendPro',
      message: 'This tutorial is exactly what I needed!',
      time: '10m ago',
      avatar: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Here you would typically send the message to your backend
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="w-full lg:w-96 bg-[#1f1d2b]/90 backdrop-blur-sm border-l border-slate-700/30 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Live Chat</h3>
          <div className="flex items-center space-x-2 text-slate-400 text-sm">
            <Users className="w-4 h-4" />
            <span>2.3K</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex space-x-3 animate-fade-in">
            <img
              src={msg.avatar}
              alt={msg.user}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[#ff7551] font-medium text-sm">{msg.user}</span>
                <span className="text-slate-500 text-xs">{msg.time}</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed break-words">
                {msg.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700/30">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-slate-700/30 border border-slate-600/30 rounded-full px-4 py-2 pr-10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-full transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>

      {/* Related Videos */}
      <div className="p-4 border-t border-slate-700/30">
        <h4 className="text-white font-medium mb-3">Up Next</h4>
        <div className="space-y-3">
          {[
            {
              title: 'Advanced React Patterns',
              views: '156K views',
              thumbnail: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=100&h=75&fit=crop'
            },
            {
              title: 'JavaScript ES2024 Features',
              views: '89K views',
              thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=100&h=75&fit=crop'
            }
          ].map((video, index) => (
            <div key={index} className="flex space-x-3 cursor-pointer group">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-16 h-12 rounded-lg object-cover group-hover:opacity-80 transition-opacity"
              />
              <div className="flex-1 min-w-0">
                <h5 className="text-white text-sm font-medium line-clamp-2 group-hover:text-[#ff7551] transition-colors">
                  {video.title}
                </h5>
                <p className="text-slate-400 text-xs">{video.views}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSection;