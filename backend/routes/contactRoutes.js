const router = require("express").Router();
const Contact = require("../models/Contact");
const { auth } = require("../middlewares/auth");
const nodemailer = require("nodemailer");

// Helper function for error handling
function sendError(res, status = 500, msg = "Server error") {
  return res.status(status).json({ msg });
}

// ========== SEND REPLY ==========
router.post("/:id/reply", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage, toEmail, toName, fromName, fromEmail, originalMessage, originalSubject } = req.body;

    console.log("📧 Starting email send process...");
    console.log("To:", toEmail);

    if (!replyMessage || replyMessage.trim() === "") {
      return sendError(res, 400, "Reply message is required");
    }

    const message = await Contact.findById(id);
    if (!message) {
      return sendError(res, 404, "Message not found");
    }

    // Send email to the original message sender
    let emailSent = false;
    let emailError = null;

    try {
      // FIX: Use createTransport (without 'er')
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "arbeittechnology@gmail.com",
          pass: "fgtg sbxq hyrr phby",
        },
      });

      // Test the connection
      await transporter.verify();
      console.log("✅ SMTP connection is ready");

      const emailSubject = originalSubject 
        ? `Re: ${originalSubject}`
        : "Re: Your Contact Message";

      const mailOptions = {
        from: '"Arbeit Technology" <arbeittechnology@gmail.com>',
        to: toEmail,
        subject: emailSubject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #667eea; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Arbeit Technology</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Response to Your Message</p>
            </div>
            
            <div style="padding: 20px;">
              <p>Dear <strong>${toName}</strong>,</p>
              <p>Thank you for contacting Arbeit Technology. Here is our response to your message:</p>
              
              <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #667eea;">Our Response:</h3>
                <p>${replyMessage.replace(/\n/g, '<br>')}</p>
              </div>
              
              <div style="background: #f1f3f4; padding: 12px; border-left: 4px solid #ccc; margin: 15px 0;">
                <h4 style="margin-top: 0; color: #666;">Your Original Message:</h4>
                <p><strong>Subject:</strong> ${originalSubject || 'No Subject'}</p>
                <p><strong>Message:</strong></p>
                <p>${originalMessage.replace(/\n/g, '<br>')}</p>
              </div>
              
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <p>Best regards,</p>
                <p><strong>${fromName}</strong><br>
                Arbeit Technology Team<br>
                Email: ${fromEmail}</p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 15px; background: #f5f5f5; color: #666; font-size: 11px;">
              <p>This email was sent in response to your contact form submission.</p>
              <p>&copy; 2024 Arbeit Technology. All rights reserved.</p>
            </div>
          </div>
        `,
        replyTo: fromEmail
      };

      console.log("📤 Attempting to send email...");
      const emailResult = await transporter.sendMail(mailOptions);
      
      console.log("✅ EMAIL SENT SUCCESSFULLY!");
      console.log("Message ID:", emailResult.messageId);
      
      emailSent = true;

    } catch (emailErr) {
      console.error("❌ EMAIL SENDING FAILED:");
      console.error("Error:", emailErr.message);
      
      emailError = emailErr.message;
      emailSent = false;
    }

    // Update message with reply
    message.status = "replied";
    message.repliedAt = new Date();
    message.replyMessage = replyMessage.trim();

    await message.save();

    const responseMsg = emailSent 
      ? "Reply sent successfully and email delivered!"
      : `Reply saved successfully! (Email failed: ${emailError})`;

    return res.json({ 
      msg: responseMsg,
      emailSent: emailSent,
      message: {
        id: message._id,
        status: message.status,
        repliedAt: message.repliedAt
      }
    });

  } catch (err) {
    console.error("Error sending reply:", err);
    
    if (err.kind === 'ObjectId') {
      return sendError(res, 404, "Message not found");
    }
    
    return sendError(res);
  }
});

// ========== SUBMIT CONTACT FORM ==========
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return sendError(res, 400, "Name, email, and message are required");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 400, "Please provide a valid email address");
    }

    // Create new contact message
    const newContact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || "",
      subject: subject || "",
      message: message.trim()
    });

    await newContact.save();

    return res.status(201).json({ 
      msg: "Message sent successfully!",
      contact: {
        id: newContact._id,
        name: newContact.name,
        email: newContact.email
      }
    });

  } catch (err) {
    console.error("Error submitting contact form:", err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return sendError(res, 400, errors.join(', '));
    }
    
    return sendError(res);
  }
});

// ========== GET ALL CONTACT MESSAGES (AUTH REQUIRED) ==========
router.get("/", auth, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get messages with pagination
    const messages = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Contact.countDocuments(query);
    
    // Get stats
    const totalMessages = await Contact.countDocuments();
    const pendingMessages = await Contact.countDocuments({ status: 'pending' });
    const repliedMessages = await Contact.countDocuments({ status: 'replied' });

    return res.json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalMessages: total,
        hasNext: skip + messages.length < total,
        hasPrev: parseInt(page) > 1
      },
      stats: {
        total: totalMessages,
        pending: pendingMessages,
        replied: repliedMessages
      }
    });

  } catch (err) {
    console.error("Error fetching contact messages:", err);
    return sendError(res);
  }
});

// ========== GET SINGLE MESSAGE ==========
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findById(id);
    if (!message) {
      return sendError(res, 404, "Message not found");
    }

    // Mark as read when fetched
    if (!message.read) {
      message.read = true;
      await message.save();
    }

    return res.json({ message });

  } catch (err) {
    console.error("Error fetching message:", err);
    
    if (err.kind === 'ObjectId') {
      return sendError(res, 404, "Message not found");
    }
    
    return sendError(res);
  }
});

// ========== UPDATE MESSAGE STATUS ==========
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, read } = req.body;

    const message = await Contact.findById(id);
    if (!message) {
      return sendError(res, 404, "Message not found");
    }

    // Update status if provided
    if (status && ['pending', 'replied'].includes(status)) {
      message.status = status;
      if (status === 'replied' && !message.repliedAt) {
        message.repliedAt = new Date();
      }
    }

    // Update read status if provided
    if (typeof read === 'boolean') {
      message.read = read;
    }

    await message.save();

    return res.json({ 
      msg: "Message updated successfully",
      message: {
        id: message._id,
        status: message.status,
        read: message.read
      }
    });

  } catch (err) {
    console.error("Error updating message status:", err);
    
    if (err.kind === 'ObjectId') {
      return sendError(res, 404, "Message not found");
    }
    
    return sendError(res);
  }
});

// ========== MARK ALL AS READ ==========
router.put("/actions/mark-all-read", auth, async (req, res) => {
  try {
    const result = await Contact.updateMany(
      { read: false },
      { $set: { read: true } }
    );

    return res.json({ 
      msg: `Marked ${result.modifiedCount} messages as read`,
      modifiedCount: result.modifiedCount
    });

  } catch (err) {
    console.error("Error marking messages as read:", err);
    return sendError(res);
  }
});

// ========== DELETE MESSAGE ==========
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findByIdAndDelete(id);
    if (!message) {
      return sendError(res, 404, "Message not found");
    }

    return res.json({ 
      msg: "Message deleted successfully",
      deletedId: id
    });

  } catch (err) {
    console.error("Error deleting message:", err);
    
    if (err.kind === 'ObjectId') {
      return sendError(res, 404, "Message not found");
    }
    
    return sendError(res);
  }
});

// ========== GET CONTACT STATS ==========
router.get("/stats/summary", auth, async (req, res) => {
  try {
    const totalMessages = await Contact.countDocuments();
    const pendingMessages = await Contact.countDocuments({ status: 'pending' });
    const repliedMessages = await Contact.countDocuments({ status: 'replied' });
    const unreadMessages = await Contact.countDocuments({ read: false });
    
    // Recent messages (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentMessages = await Contact.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    return res.json({
      total: totalMessages,
      pending: pendingMessages,
      replied: repliedMessages,
      unread: unreadMessages,
      recent: recentMessages
    });

  } catch (err) {
    console.error("Error fetching contact stats:", err);
    return sendError(res);
  }
});

module.exports = router;