import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiMail, FiUser, FiPhone, FiMessageSquare, FiSend, FiClock, FiSearch, FiFilter, FiCheck, FiX, FiEye } from "react-icons/fi";
import { toast } from "react-hot-toast";

const ContactedUser = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contactedUsers, setContactedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch current user data and contacted users
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        } else if (token) {
          // Fetch user data from API
          const response = await fetch("http://localhost:5000/api/auth/verify", {
            headers: {
              "x-auth-token": token,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setCurrentUser(data.user);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch contacted users from backend
  const fetchContactedUsers = async (page = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`http://localhost:5000/api/contact?${params}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setContactedUsers(data.messages);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching contacted users:", error);
      toast.error("Failed to load messages");
      setContactedUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContactedUsers();
  }, [searchTerm, statusFilter]);

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      toast.error("Please write a reply message");
      return;
    }

    if (!selectedMessage) {
      toast.error("No message selected");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // Prepare email data - email sent from Arbeit Technology but shows admin user as sender
      const emailData = {
        replyMessage: replyText,
        toEmail: selectedMessage.email,
        toName: selectedMessage.name,
        fromName: currentUser?.name || "Admin",
        fromEmail: currentUser?.email || "admin@example.com",
        originalMessage: selectedMessage.message,
        originalSubject: selectedMessage.subject || "Contact Message"
      };

      const response = await fetch(`http://localhost:5000/api/contact/${selectedMessage._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to send reply");
      }

      toast.success(data.msg || "Reply sent successfully!");
      setReplyText("");
      
      // Refresh the messages list
      fetchContactedUsers(pagination.currentPage);
      
      // Update selected message status
      setSelectedMessage(prev => prev ? { 
        ...prev, 
        status: "replied", 
        replyMessage: replyText 
      } : null);
      
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error(error.message || "Failed to send reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsReplied = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/contact/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ status: "replied" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to update status");
      }

      toast.success("Marked as replied");
      fetchContactedUsers(pagination.currentPage);
      
      if (selectedMessage && selectedMessage._id === userId) {
        setSelectedMessage(prev => prev ? { ...prev, status: "replied" } : null);
      }
    } catch (error) {
      console.error("Error marking as replied:", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const markAsRead = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/contact/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      fetchContactedUsers(pagination.currentPage);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteMessage = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/contact/${userId}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to delete message");
      }

      toast.success("Message deleted successfully");
      
      setContactedUsers(prev => prev.filter(user => user._id !== userId));
      
      if (selectedMessage && selectedMessage._id === userId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error(error.message || "Failed to delete message");
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/contact/actions/mark-all-read`, {
        method: "PUT",
        headers: {
          "x-auth-token": token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to mark all as read");
      }

      toast.success(data.msg || "All messages marked as read");
      fetchContactedUsers(pagination.currentPage);
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error(error.message || "Failed to mark all as read");
    }
  };

  const handleMessageSelect = (user) => {
    setSelectedMessage(user);
    if (!user.read) {
      markAsRead(user._id);
    }
  };

  const StatusBadge = ({ status }) => (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
      status === "replied" 
        ? "bg-green-500/20 text-green-400 border border-green-500/30"
        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
    }`}>
      {status === "replied" ? "Replied" : "Pending"}
    </span>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-4 px-2 sm:px-4 lg:px-8 relative overflow-visible">
      <div className="w-full mx-auto relative z-10">
        <div className="text-center mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
            Contacted Users
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start w-full">
          {/* Left Column - Messages List */}
          <div className="bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:col-span-2 border border-gray-700/30">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl border border-purple-500/20">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    <FiUser className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-[700] text-white truncate">
                      {currentUser?.name || "Admin"}'s Messages
                    </p>
                    <p className="text-xs text-gray-400 font-[600] truncate mt-0.5">
                      {pagination.totalMessages} messages found
                    </p>
                  </div>
                </motion.div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Manage</p>
                <p className="text-white font-semibold">Contacts</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-purple-500 transition placeholder-gray-500"
                />
              </div>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-purple-500 transition appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="replied">Replied</option>
                </select>
              </div>
            </div>

            {/* Messages List */}
            <div className="space-y-4">
              {contactedUsers.map((user) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-800/50 rounded-xl border transition-all cursor-pointer hover:border-purple-500/50 ${
                    selectedMessage?._id === user._id 
                      ? "border-purple-500 bg-purple-500/10" 
                      : "border-gray-700/50"
                  } ${!user.read ? "border-l-4 border-l-blue-500" : ""}`}
                  onClick={() => handleMessageSelect(user)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            {user.name}
                            {!user.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </h3>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <StatusBadge status={user.status} />
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="text-white font-medium mb-1">{user.subject || "No Subject"}</h4>
                      <p className="text-gray-400 text-sm line-clamp-2">{user.message}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {formatDate(user.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReplied(user._id);
                          }}
                          className="hover:text-green-400 transition-colors"
                          title="Mark as replied"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(user._id);
                          }}
                          className="hover:text-red-400 transition-colors"
                          title="Delete message"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {contactedUsers.length === 0 && (
                <div className="text-center py-12 text-gray-400 rounded-xl border-2 border-dashed border-gray-700/50">
                  <FiMail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No messages found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700/50">
                <button
                  onClick={() => fetchContactedUsers(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 bg-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                
                <span className="text-gray-400 text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => fetchContactedUsers(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 bg-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Message Details & Reply */}
          <div className="bg-transparent rounded-2xl p-6 border border-purple-500/30 self-start overflow-y-auto backdrop-blur-lg space-y-8">
            {selectedMessage ? (
              <>
                {/* Message Details */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <FiMessageSquare className="w-4 h-4" />
                    Message Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">From</p>
                        <p className="text-white font-medium">{selectedMessage.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <FiMail className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="text-white font-medium">{selectedMessage.email}</p>
                      </div>
                    </div>

                    {selectedMessage.phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                        <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                          <FiPhone className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Phone</p>
                          <p className="text-white font-medium">{selectedMessage.phone}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <p className="text-gray-400 text-sm mb-2">Message</p>
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-white whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                    </div>

                    {selectedMessage.replyMessage && (
                      <div className="mt-4">
                        <p className="text-gray-400 text-sm mb-2">Your Reply</p>
                        <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/50">
                          <p className="text-white whitespace-pre-wrap">{selectedMessage.replyMessage}</p>
                          {selectedMessage.repliedAt && (
                            <p className="text-green-400 text-xs mt-2">
                              Replied on: {formatDate(selectedMessage.repliedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply Form - Only show if not replied */}
                {selectedMessage.status !== "replied" && (
                  <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-2xl shadow-2xl overflow-hidden border border-purple-400/20 backdrop-blur-xl">
                    <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 p-6 text-white border-b border-purple-400/30">
                      <div className="flex items-center gap-2">
                        <FiSend className="w-5 h-5" />
                        <h3 className="text-lg font-bold">Send Email Reply</h3>
                      </div>
                      <p className="text-purple-200 text-sm mt-1">
                        This reply will be sent from Arbeit Technology on behalf of {currentUser?.name || "Admin"}
                      </p>
                    </div>
                    
                    <div className="p-6">
                      <form onSubmit={handleReply} className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            Your Reply Message *
                          </label>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Type your reply to ${selectedMessage.name}...`}
                            rows="6"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-white focus:border-purple-500 transition placeholder-gray-500 resize-none"
                            required
                          />
                        </div>

                        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
                          <p className="text-blue-300 text-sm">
                            <strong>Note:</strong> This email will be sent from <strong>Arbeit Technology</strong> 
                            but will show <strong>{currentUser?.name || "Admin"}</strong> as the sender.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group relative overflow-hidden"
                        >
                          <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sending Email...
                              </>
                            ) : (
                              <>
                                <FiSend className="w-5 h-5" />
                                Send Email Reply
                              </>
                            )}
                          </span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <FiMessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">No Message Selected</h3>
                <p className="text-gray-400">Select a message from the list to view details and reply</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl p-6 border border-purple-500/20">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <FiSend className="w-4 h-4" />
                Quick Actions
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Manage your messages efficiently with these quick actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={markAllAsRead}
                  className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-colors border border-blue-500/30"
                >
                  Mark All Read
                </button>
                <button 
                  onClick={() => setStatusFilter("pending")}
                  className="px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg text-sm hover:bg-purple-600/30 transition-colors border border-purple-500/30"
                >
                  Show Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactedUser;