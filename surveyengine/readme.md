# Survey Engine - Gov of India Project

## Overview
The **Survey Engine** is a multi-channel platform designed to collect, process, and analyze surveys across **WhatsApp, mobile, web, and AI avatars**. It enables government agencies to gather data efficiently, engage users interactively, and make data-driven decisions.

---

## System Flow

### 1. User Interaction
- Users can access surveys via:
  - **WhatsApp**: Chat-based survey flow using WhatsApp Business API.  
  - **Mobile App**: Native app interface with notifications and survey reminders.  
  - **Web Portal**: Browser-based form submission.  
  - **AI Avatar**: Interactive voice/video survey experience with AI avatars.  

### 2. Authentication & User Identification
- Users are identified via:
  - Phone number (WhatsApp/mobile)  
  - Login credentials (web portal)  
  - Voice/face recognition (AI avatar)  
- User sessions are tracked for personalized survey experience and progress saving.

### 3. Survey Delivery
- Surveys are dynamically fetched based on:
  - User type (citizen, officer, official)  
  - Survey campaign  
  - Channel (WhatsApp, web, mobile, AI)  
- Question types supported:
  - Multiple choice  
  - Free text  
  - Rating scales  
  - Multimedia input (images, audio, video)

### 4. Real-Time Response Capture
- Responses are captured **immediately** across all channels.  
- Validation and formatting are applied to ensure consistency.  
- Responses are linked to the user profile and session.

### 5. Data Storage
- All responses are stored in a **centralized database**.  
- Tables are organized per module:
  - `users`  
  - `surveys`  
  - `questions`  
  - `responses`  
  - `sessions`  
- Historical data is preserved for analysis and reporting.

### 6. Analysis & Reporting
- Collected data is processed to generate:
  - Individual response summaries  
  - Survey completion metrics  
  - Trends and insights  
- Authorized personnel can access dashboards or export reports.

### 7. AI Avatar & Interactive Feedback
- AI avatars provide:
  - Personalized greetings and survey guidance  
  - Real-time clarification for survey questions  
  - Conversational feedback based on user responses

### 8. Notifications & Reminders
- Automated notifications are sent via:
  - WhatsApp  
  - Mobile push notifications  
  - Email alerts  
- Ensures maximum participation and survey completion.

---

## High-Level Flow Diagram

