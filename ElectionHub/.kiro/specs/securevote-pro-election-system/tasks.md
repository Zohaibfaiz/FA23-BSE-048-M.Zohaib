# Implementation Plan: SecureVote Pro - Enterprise Election Management System

## Overview

This implementation plan breaks down the SecureVote Pro system into actionable tasks organized by dependency order. The system uses React 18, TypeScript, Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions), Tailwind CSS, and Framer Motion to deliver a secure, real-time election management platform.

**Technology Stack:**
- Frontend: React 18 + TypeScript + Vite
- Backend: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- Styling: Tailwind CSS
- Animation: Framer Motion
- State Management: Redux Toolkit
- Security: SHA256 hashing (crypto-js), DOMPurify

**Key Features:**
- Anonymous voting with cryptographic security
- Real-time updates and notifications
- Role-based access control (Voter, Creator, Admin)
- Comprehensive audit logging
- Premium black and gold UI theme

## Tasks

- [ ] 1. Project Setup and Configuration
  - Initialize Vite project with React 18 and TypeScript
  - Configure Tailwind CSS with custom black/gold theme
  - Set up ESLint, Prettier, and TypeScript configuration
  - Install core dependencies: @supabase/supabase-js, @reduxjs/toolkit, react-router-dom, framer-motion
  - Install additional dependencies: crypto-js, dompurify, zod, lucide-react, recharts, react-hot-toast
  - Create environment variables file structure (.env.example, .env.local)
  - Configure Vite build settings for optimization
  - Set up project folder structure (src/components, src/pages, src/hooks, src/utils, src/types, src/store)
  - _Requirements: 35.1, 35.4, 35.7_


- [ ] 2. Supabase Project Setup and Database Schema
  - [ ] 2.1 Create Supabase project and configure connection
    - Create new Supabase project
    - Copy project URL and anon key to environment variables
    - Initialize Supabase client in src/lib/supabase.ts
    - Test database connection
    - _Requirements: 31.3, 37.7_

  - [ ] 2.2 Create core user tables and profiles schema
    - Create profiles table with id, email, full_name, username, role, avatar_url, bio, is_suspended, email_verified, created_at, updated_at
    - Create user_settings table with user_id, email_notifications, push_notifications, election_reminders, result_notifications, theme, language, timezone
    - Add unique constraints on email and username
    - Add indexes on role and is_suspended
    - Create trigger to auto-create profile on auth.users insert
    - Create trigger to auto-create user_settings on profile insert
    - _Requirements: 1.1, 1.2, 2.1, 21.1, 22.1, 22.8_

  - [ ] 2.3 Create election and candidate tables
    - Create election_categories table with id, name, description, icon, display_order
    - Create elections table with all fields from design (id, creator_id, title, description, category_id, status, start_date, end_date, max_voters, current_voters, total_votes, allow_waitlist, is_public, banner_url, settings JSONB, voter_list_locked)
    - Create candidates table with id, election_id, name, party, manifesto, photo_url, display_order, vote_count
    - Add foreign key constraints and cascade deletes
    - Add indexes on creator_id, status, category_id, election_id
    - Add composite index on (status, start_date)
    - _Requirements: 4.1, 4.2, 5.1, 21.5, 23.4, 25.1_

  - [ ] 2.4 Create voting system tables
    - Create voter_registrations table with id, election_id, voter_id, secret_voter_id, status, registered_at, approved_at, approved_by
    - Create votes table with id, election_id, candidate_id, voter_id_hash, voted_at
    - Add unique constraint on secret_voter_id
    - Add unique composite constraint on (election_id, voter_id) for registrations
    - Add unique composite constraint on (election_id, voter_id_hash) for votes
    - Add indexes on election_id, voter_id, candidate_id
    - Add composite index on (election_id, voter_id_hash)
    - _Requirements: 7.2, 7.11, 8.12, 21.2, 21.3, 21.4, 23.5_

  - [ ] 2.5 Create administrative and logging tables
    - Create audit_logs table with id, user_id, action, entity_type, entity_id, details JSONB, ip_address, user_agent, created_at
    - Create security_logs table with id, event_type, severity, user_id, election_id, description, metadata JSONB, ip_address, user_agent, created_at
    - Create notifications table with id, user_id, type, title, message, data JSONB, read, created_at
    - Create election_creator_requests table with id, user_id, reason, status, reviewed_by, reviewed_at, rejection_reason, created_at
    - Add indexes on user_id, action, entity_type, event_type, severity, read, status
    - Add composite indexes for common queries
    - _Requirements: 15.1, 15.2, 16.1, 10.8, 3.1_

  - [ ]* 2.6 Write property test for database schema constraints
    - **Property 5: Election Date Validity** - All elections must have start_date < end_date
    - **Validates: Requirements 4.4, 4.5, 21.6**
    - Use fast-check to generate random election data and verify date constraints
    - Test that database rejects invalid date combinations


- [ ] 3. Database Triggers and Functions
  - [ ] 3.1 Create trigger for auto-incrementing vote counts
    - Create database function to increment candidate.vote_count on vote insert
    - Create database function to increment election.total_votes on vote insert
    - Create trigger on votes table to call functions after insert
    - Test trigger with sample vote insertions
    - _Requirements: 8.6, 8.7, 22.3, 22.4_

  - [ ] 3.2 Create trigger for voter registration count management
    - Create database function to increment election.current_voters on registration with status 'registered'
    - Create database function to decrement election.current_voters on registration delete
    - Create triggers on voter_registrations table
    - Test triggers with sample registrations
    - _Requirements: 7.4, 22.2, 22.5_

  - [ ] 3.3 Create secret voter ID generation function
    - Create database function to generate unique secret voter ID in format "VOTE-XXXX-XXXX-XXXX-XXXX"
    - Use PostgreSQL's gen_random_uuid() and string manipulation
    - Ensure uniqueness check before returning
    - Set as default value for voter_registrations.secret_voter_id
    - _Requirements: 7.2, 21.10_

  - [ ]* 3.4 Write property test for vote count consistency
    - **Property 7: Vote Count Consistency** - election.total_votes must equal COUNT(votes)
    - **Property 8: Candidate Vote Sum** - election.total_votes must equal SUM(candidates.vote_count)
    - **Validates: Requirements 8.6, 8.7, 22.3, 22.4**
    - Test that triggers maintain count consistency across multiple vote insertions

- [ ] 4. Row-Level Security (RLS) Policies
  - [ ] 4.1 Enable RLS and create policies for profiles table
    - Enable RLS on profiles table
    - Create policy: users can read their own profile
    - Create policy: users can update their own profile (except role and is_suspended)
    - Create policy: admins can read all profiles
    - Create policy: admins can update any profile
    - Create policy: public can read basic profile info (username, avatar_url)
    - Test policies with different user roles
    - _Requirements: 17.9, 17.10, 18.1, 18.5_

  - [ ] 4.2 Create RLS policies for elections and candidates tables
    - Enable RLS on elections and candidates tables
    - Create policy: public can read published/active/completed elections where is_public = true
    - Create policy: creators can read their own elections (all statuses)
    - Create policy: creators can insert elections (with creator_id = auth.uid())
    - Create policy: creators can update their own elections
    - Create policy: creators can delete their own draft elections
    - Create policy: admins can perform all operations
    - Create policy: voters can read elections they are registered for
    - Test policies with different user roles
    - _Requirements: 4.12, 4.13, 4.14, 18.6, 18.7, 18.8, 18.9_

  - [ ] 4.3 Create RLS policies for voting tables
    - Enable RLS on voter_registrations and votes tables
    - Create policy: voters can read their own registrations
    - Create policy: voters can insert registrations (with voter_id = auth.uid())
    - Create policy: creators can read registrations for their elections
    - Create policy: creators can update registration status for their elections
    - Create policy: voters can insert votes (anonymous - no voter_id check)
    - Create policy: no one can update or delete votes (immutability)
    - Create policy: admins can read all data
    - Test policies with different user roles
    - _Requirements: 8.4, 8.13, 17.3, 17.5, 18.5_

  - [ ] 4.4 Create RLS policies for administrative tables
    - Enable RLS on audit_logs, security_logs, notifications, election_creator_requests
    - Create policy: system can insert audit and security logs
    - Create policy: admins can read all logs
    - Create policy: users can read their own audit logs
    - Create policy: no one can update or delete logs (immutability)
    - Create policy: users can read and update their own notifications
    - Create policy: users can insert creator requests
    - Create policy: admins can update creator requests
    - Test policies with different user roles
    - _Requirements: 15.8, 16.7, 10.5, 3.2_


- [ ] 5. Supabase Storage Configuration
  - [ ] 5.1 Create storage buckets for file uploads
    - Create 'election-banners' bucket for election banner images
    - Create 'candidate-photos' bucket for candidate photos
    - Create 'user-avatars' bucket for user profile pictures
    - Configure bucket settings (max file size 5MB, allowed MIME types: image/jpeg, image/png, image/webp)
    - _Requirements: 26.1, 26.2, 26.3, 26.4_

  - [ ] 5.2 Configure storage RLS policies
    - Create policy: creators can upload to election-banners for their elections
    - Create policy: creators can upload to candidate-photos for their elections
    - Create policy: users can upload to user-avatars for their own profile
    - Create policy: public can read all images (public access)
    - Create policy: admins can delete any files
    - Test upload and access with different user roles
    - _Requirements: 26.7, 26.8_

- [ ] 6. Authentication System Implementation
  - [ ] 6.1 Create Supabase client and auth utilities
    - Create src/lib/supabase.ts with initialized Supabase client
    - Create src/utils/auth.ts with helper functions (getUser, getSession, signOut)
    - Create src/types/auth.ts with TypeScript interfaces for User, Session, AuthResult
    - Export auth utilities for use across the app
    - _Requirements: 1.1, 1.5, 35.1_

  - [ ] 6.2 Implement AuthContext and AuthProvider
    - Create src/contexts/AuthContext.tsx with AuthContext
    - Implement AuthProvider component with state management for user, session, profile, loading
    - Implement signUp function with email, password, and user data
    - Implement signIn function with email and password
    - Implement signOut function
    - Implement resetPassword function
    - Implement updateProfile function
    - Set up Supabase auth state listener in useEffect
    - Fetch user profile data on authentication
    - _Requirements: 1.1, 1.5, 1.8, 1.9, 2.2_

  - [ ] 6.3 Create ProtectedRoute component for route guarding
    - Create src/components/ProtectedRoute.tsx
    - Implement role-based access control with requiredRole prop
    - Check authentication status before rendering children
    - Redirect unauthenticated users to /login
    - Redirect unauthorized users to appropriate dashboard based on role
    - Show loading state during auth check
    - _Requirements: 1.7, 18.1, 18.5, 18.6_

  - [ ]* 6.4 Write unit tests for authentication functions
    - Test signUp with valid and invalid inputs
    - Test signIn with correct and incorrect credentials
    - Test suspended user login rejection
    - Test session token validation
    - _Requirements: 1.2, 1.3, 1.6, 1.7, 35.2_

  - [ ]* 6.5 Write property test for authentication security
    - **Property 3: Suspended Users Cannot Login** - Suspended users must be rejected
    - **Validates: Requirements 1.7, 13.4**
    - Test that is_suspended flag prevents authentication

- [ ] 7. User Registration and Login Pages
  - [ ] 7.1 Create signup page with form validation
    - Create src/pages/auth/SignupPage.tsx
    - Implement form with fields: email, password, confirm password, full_name, username
    - Use Zod schema for client-side validation
    - Implement password strength indicator
    - Call AuthContext.signUp on form submission
    - Display error messages for validation failures
    - Show success message and redirect to email verification page
    - Add link to login page for existing users
    - Style with Tailwind CSS (black/gold theme)
    - _Requirements: 1.1, 1.2, 1.3, 1.10, 20.5_

  - [ ] 7.2 Create login page with error handling
    - Create src/pages/auth/LoginPage.tsx
    - Implement form with fields: email, password
    - Call AuthContext.signIn on form submission
    - Display error messages for failed login attempts
    - Show suspension message for suspended users
    - Add "Forgot Password" link
    - Add link to signup page for new users
    - Redirect to appropriate dashboard on successful login based on user role
    - Style with Tailwind CSS and add Framer Motion animations
    - _Requirements: 1.5, 1.6, 1.7, 20.3, 20.5_

  - [ ] 7.3 Create password reset flow
    - Create src/pages/auth/ForgotPasswordPage.tsx for requesting reset
    - Create src/pages/auth/ResetPasswordPage.tsx for setting new password
    - Implement email input form for password reset request
    - Call Supabase resetPasswordForEmail function
    - Implement new password form with confirmation
    - Call Supabase updateUser function to set new password
    - Display success messages and redirect to login
    - _Requirements: 1.5, 20.5_

  - [ ] 7.4 Create email verification page
    - Create src/pages/auth/VerifyEmailPage.tsx
    - Display message instructing user to check email
    - Implement resend verification email button
    - Handle email verification callback from Supabase
    - Redirect to dashboard after successful verification
    - _Requirements: 1.4, 2.4_


- [ ] 8. User Profile Management
  - [ ] 8.1 Create profile page with edit functionality
    - Create src/pages/profile/ProfilePage.tsx
    - Display current profile information (email, full_name, username, avatar, bio)
    - Implement edit mode with form fields
    - Add avatar upload with preview
    - Implement file upload to Supabase Storage user-avatars bucket
    - Call AuthContext.updateProfile on form submission
    - Display success/error messages with toast notifications
    - Prevent editing of role and is_suspended fields
    - _Requirements: 2.1, 2.2, 2.3, 2.7, 2.8_

  - [ ] 8.2 Create user settings page
    - Create src/pages/profile/SettingsPage.tsx
    - Display notification preferences (email_notifications, push_notifications, election_reminders, result_notifications)
    - Display theme preference (light, dark, auto)
    - Implement toggle switches for notification settings
    - Implement theme selector with preview
    - Save settings to user_settings table
    - Apply theme changes immediately
    - _Requirements: 2.5, 2.6, 20.9_

  - [ ] 8.3 Create creator access request form
    - Create src/pages/profile/RequestCreatorAccessPage.tsx
    - Display form with textarea for reason (20-1000 characters)
    - Validate reason length with Zod
    - Check for existing pending request before submission
    - Insert creator request into election_creator_requests table
    - Display success message and pending status
    - Show rejection reason if request was previously rejected
    - _Requirements: 3.1, 3.2, 3.7_

- [ ] 9. Routing and Navigation Setup
  - [ ] 9.1 Configure React Router with route structure
    - Create src/App.tsx with BrowserRouter
    - Define route structure with nested routes
    - Public routes: /, /login, /signup, /forgot-password, /reset-password, /verify-email
    - Voter routes: /voter/dashboard, /voter/elections, /voter/elections/:id, /voter/vote/:id, /voter/results/:id, /voter/profile, /voter/settings
    - Creator routes: /creator/dashboard, /creator/elections/new, /creator/elections/:id/edit, /creator/elections/:id/analytics
    - Admin routes: /admin/dashboard, /admin/users, /admin/elections, /admin/audit-logs, /admin/security
    - Wrap protected routes with ProtectedRoute component
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [ ] 9.2 Create navigation components
    - Create src/components/layout/Navbar.tsx with role-based navigation links
    - Create src/components/layout/Sidebar.tsx for dashboard navigation
    - Implement user menu with profile, settings, and logout
    - Display notification bell icon with unread count badge
    - Implement mobile-responsive hamburger menu
    - Add Framer Motion animations for menu transitions
    - Style with Tailwind CSS (black/gold theme)
    - _Requirements: 10.7, 20.1, 20.3, 32.1, 32.3_

  - [ ] 9.3 Create landing page
    - Create src/pages/LandingPage.tsx
    - Display hero section with system description
    - Display feature highlights (anonymous voting, real-time results, secure)
    - Add call-to-action buttons (Sign Up, Login)
    - Implement responsive design for mobile and desktop
    - Add Framer Motion scroll animations
    - Style with premium black/gold theme
    - _Requirements: 20.1, 20.3, 32.3_

- [ ] 10. Checkpoint - Authentication and Navigation Complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 11. Election Creation and Management
  - [ ] 11.1 Create election categories seed data
    - Create database migration to insert default election categories
    - Add categories: Government, Corporate, Educational, Community, Sports, Entertainment
    - Assign icons and display order to each category
    - _Requirements: 25.1, 25.6_

  - [ ] 11.2 Implement ElectionBuilder component (multi-step form)
    - Create src/components/elections/ElectionBuilder.tsx
    - Implement multi-step form with steps: Details, Candidates, Settings, Review
    - Step 1 - Details: title, description, category, dates, max_voters, allow_waitlist, is_public, banner upload
    - Step 2 - Candidates: add/edit/delete candidates with name, party, manifesto, photo
    - Step 3 - Settings: show_results_before_end, allow_vote_change, require_voter_approval, send_reminders
    - Step 4 - Review: display all election details for confirmation
    - Implement form validation with Zod schemas
    - Implement draft auto-save functionality
    - Add progress indicator showing current step
    - Style with Tailwind CSS and add Framer Motion transitions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.10_

  - [ ] 11.3 Implement file upload for election banners
    - Create src/utils/fileUpload.ts with upload helper functions
    - Implement uploadElectionBanner function
    - Validate file type (JPEG, PNG, WebP) and size (max 5MB)
    - Generate unique filename to prevent overwrites
    - Upload to Supabase Storage election-banners bucket
    - Return public URL for uploaded image
    - Handle upload errors with user-friendly messages
    - _Requirements: 4.7, 26.1, 26.3, 26.4, 26.5, 26.9_

  - [ ] 11.4 Implement CandidateManager component
    - Create src/components/elections/CandidateManager.tsx
    - Display list of candidates with photos, names, parties
    - Implement add candidate form with photo upload
    - Implement edit candidate functionality
    - Implement delete candidate with confirmation dialog
    - Implement drag-and-drop reordering with display_order update
    - Upload candidate photos to Supabase Storage candidate-photos bucket
    - Disable all modifications when voter_list_locked is true
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [ ] 11.5 Create election creation page
    - Create src/pages/creator/CreateElectionPage.tsx
    - Render ElectionBuilder component
    - Handle form submission to create election in database
    - Create election with status 'draft'
    - Initialize current_voters and total_votes to 0
    - Create audit log entry for election_created
    - Display success message and redirect to creator dashboard
    - Handle errors with toast notifications
    - _Requirements: 4.1, 4.8, 4.9, 4.11_

  - [ ] 11.6 Create election edit page
    - Create src/pages/creator/EditElectionPage.tsx
    - Fetch election data by ID
    - Pre-populate ElectionBuilder with existing data
    - Verify user is the creator before allowing edits
    - Handle update submission to save changes
    - Prevent editing of published/active/completed elections (only draft)
    - Display appropriate error messages for unauthorized access
    - _Requirements: 4.11, 4.12, 4.13_

  - [ ] 11.7 Implement election publishing functionality
    - Create src/utils/electionActions.ts with publishElection function
    - Update election status from 'draft' to 'published'
    - Validate election has at least 2 candidates before publishing
    - Create audit log entry for election_published
    - Send notifications to creator
    - Display success message
    - _Requirements: 6.1, 6.6_

  - [ ] 11.8 Implement election deletion functionality
    - Add deleteElection function to electionActions.ts
    - Verify user is creator and election is in 'draft' status
    - Delete election and cascade delete candidates
    - Delete associated banner and candidate photos from storage
    - Create audit log entry for election_deleted
    - Display confirmation dialog before deletion
    - _Requirements: 4.13, 4.14, 26.8_

  - [ ]* 11.9 Write unit tests for election validation
    - Test election data validation with valid and invalid inputs
    - Test date validation (start_date < end_date, future dates)
    - Test max_voters range validation
    - Test string length constraints
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 35.2_


- [ ] 12. Election Discovery and Browsing
  - [ ] 12.1 Create election listing page for voters
    - Create src/pages/voter/ElectionsPage.tsx
    - Fetch and display all published and active elections where is_public = true
    - Implement category filter with election_categories
    - Implement status filter (published, active, completed)
    - Implement search by title and description with debouncing
    - Display election cards with banner, title, description, dates, voter count
    - Add "Join Election" button for unregistered elections
    - Add "Vote Now" button for registered elections where user hasn't voted
    - Add "View Results" button for completed elections
    - Implement pagination for large result sets
    - Style with Tailwind CSS and add Framer Motion animations
    - _Requirements: 11.1, 25.3, 25.4, 27.1, 27.2, 27.3, 27.7, 27.9, 27.10_

  - [ ] 12.2 Create election detail page
    - Create src/pages/voter/ElectionDetailPage.tsx
    - Fetch election details by ID
    - Display election banner, title, description, category, dates
    - Display all candidates with photos, names, parties, manifestos
    - Display voter statistics (registered voters, turnout)
    - Show registration status if user is registered
    - Show countdown timer to start or end date
    - Add "Register" button if not registered and election is open
    - Add "Vote" button if registered and election is active
    - Add "View Results" button if election allows or is completed
    - _Requirements: 9.9, 11.1, 20.13_

  - [ ] 12.3 Implement search and filtering utilities
    - Create src/utils/searchFilter.ts with search and filter functions
    - Implement debounced search function
    - Implement category filter function
    - Implement status filter function
    - Implement date range filter function
    - Implement sorting by start_date, end_date, created_at
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.7_

- [ ] 13. Voter Registration System
  - [ ] 13.1 Implement voter registration functionality
    - Create src/utils/voterActions.ts with registerForElection function
    - Check if user is already registered for election
    - Check if election is full and handle waitlist logic
    - Check if voter_list_locked is true and reject if locked
    - Insert voter_registration record with generated secret_voter_id
    - Set status to 'registered' or 'waitlist' based on availability
    - Increment election.current_voters if status is 'registered' (via trigger)
    - Create audit log entry for voter_registered
    - Create notification for voter
    - Return registration result with success/error message
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

  - [ ] 13.2 Create voter registration confirmation modal
    - Create src/components/elections/RegistrationModal.tsx
    - Display election details and registration confirmation
    - Show message about secret voter ID being sent to email
    - Display success message after registration
    - Show waitlist message if election is full
    - Show error message if registration fails
    - Add close button to dismiss modal
    - _Requirements: 7.3, 7.10_

  - [ ]* 13.3 Write property test for voter registration constraints
    - **Property 11: One Registration Per Voter Per Election** - Unique constraint enforcement
    - **Validates: Requirements 7.7, 7.11, 21.3**
    - Test that duplicate registrations are rejected

- [ ] 14. Edge Function for Voter ID Email
  - [ ] 14.1 Create send-voter-id-email edge function
    - Create supabase/functions/send-voter-id-email/index.ts
    - Set up Resend API client with API key from environment
    - Create email template with secret voter ID
    - Include election details in email (title, dates)
    - Send email to voter's email address
    - Handle email delivery failures with retry logic (up to 3 attempts)
    - Log email delivery status
    - Return success/failure response
    - _Requirements: 7.3, 19.1, 19.6, 19.7, 19.8_

  - [ ] 14.2 Create database trigger to invoke edge function
    - Create trigger on voter_registrations table after insert
    - Invoke send-voter-id-email edge function with registration data
    - Pass voter email, secret_voter_id, and election details
    - Handle trigger execution errors gracefully
    - _Requirements: 7.3, 19.1_

  - [ ] 14.3 Test edge function with sample data
    - Create test voter registration
    - Verify email is sent with correct secret voter ID
    - Verify email template formatting
    - Test retry logic with simulated failures
    - _Requirements: 19.1, 19.7_


- [ ] 15. Anonymous Voting System
  - [ ] 15.1 Implement vote casting functionality with SHA256 hashing
    - Create src/utils/votingActions.ts with castVote function
    - Validate election status is 'active'
    - Validate current time is within election start_date and end_date
    - Validate candidate belongs to election
    - Verify secret_voter_id is valid for this election
    - Hash secret_voter_id using SHA256 (crypto-js)
    - Check for duplicate vote using voter_id_hash
    - Insert vote record with election_id, candidate_id, voter_id_hash
    - Create audit log entry for vote_cast (without voter identity)
    - Create notification for voter confirming vote
    - Create security log entry if duplicate vote attempt detected
    - Return vote result with success/error message
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.8, 8.9, 8.10, 8.11, 17.3, 17.4_

  - [ ] 15.2 Create VotingInterface component
    - Create src/components/voting/VotingInterface.tsx
    - Display election details and all candidates
    - Render candidate cards with photos, names, parties, manifestos
    - Implement secret voter ID input field with validation
    - Validate voter ID format (VOTE-XXXX-XXXX-XXXX-XXXX)
    - Implement candidate selection (radio buttons or cards)
    - Add "Cast Vote" button with confirmation dialog
    - Disable voting after successful vote submission
    - Display success message after vote is cast
    - Display error messages for invalid voter ID or duplicate vote
    - Style with Tailwind CSS and add Framer Motion animations
    - _Requirements: 8.1, 8.2, 8.10, 8.11, 20.5, 21.10_

  - [ ] 15.3 Create voting page
    - Create src/pages/voter/VotePage.tsx
    - Fetch election and candidates data by ID
    - Verify user is registered for this election
    - Render VotingInterface component
    - Handle vote submission and display result
    - Redirect to results page after successful vote
    - Display error if user is not registered
    - _Requirements: 8.1, 8.9_

  - [ ]* 15.4 Write property test for vote anonymity
    - **Property 11: Vote Anonymity** - Votes contain no direct voter identity
    - **Property 18: Voter ID Hash Irreversibility** - SHA256 cannot be reversed
    - **Validates: Requirements 8.3, 8.4, 17.3, 17.4**
    - Test that vote records only contain hashed voter IDs
    - Test that hash cannot be reversed to original voter ID

  - [ ]* 15.5 Write property test for duplicate vote prevention
    - **Property 12: One Vote Per Voter Per Election** - Unique constraint on voter_id_hash
    - **Property 19: Duplicate Vote Detection** - System rejects duplicate votes
    - **Validates: Requirements 8.5, 8.12, 21.4**
    - Test that same voter_id_hash cannot vote twice in same election

- [ ] 16. Checkpoint - Voting System Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Real-Time Results and Analytics
  - [ ] 17.1 Implement result calculation function
    - Create src/utils/resultsCalculation.ts with calculateElectionResults function
    - Fetch election details (total_votes, current_voters)
    - Fetch all candidates with vote_count
    - Calculate vote percentages for each candidate (vote_count / total_votes * 100)
    - Rank candidates by vote_count in descending order
    - Calculate turnout percentage (total_votes / current_voters * 100)
    - Return ElectionResults object with aggregated data
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.7, 9.10_

  - [ ] 17.2 Create ResultsDisplay component with charts
    - Create src/components/results/ResultsDisplay.tsx
    - Display election title and status
    - Display total votes and turnout percentage
    - Render candidate results with photos, names, vote counts, percentages, rankings
    - Implement bar chart using Recharts for vote distribution
    - Implement pie chart for vote percentages
    - Add Framer Motion animations for result updates
    - Style with Tailwind CSS (black/gold theme)
    - _Requirements: 9.1, 9.9, 20.3_

  - [ ] 17.3 Implement real-time result updates with Supabase Realtime
    - Subscribe to votes table changes for specific election
    - Listen for INSERT events on votes table
    - Recalculate results when new vote is detected
    - Update ResultsDisplay component with new data
    - Implement throttling to prevent excessive updates (max every 2 seconds)
    - Handle subscription errors and reconnection
    - Unsubscribe when component unmounts
    - _Requirements: 9.8, 10.1, 10.10, 10.11_

  - [ ] 17.4 Create results page with visibility controls
    - Create src/pages/voter/ResultsPage.tsx
    - Fetch election details and check settings.show_results_before_end
    - Display results if election is completed OR settings allow early viewing
    - Display "Results will be available after election ends" message if not allowed
    - Render ResultsDisplay component with real-time updates
    - Add refresh button for manual updates
    - Display last updated timestamp
    - _Requirements: 9.5, 9.6, 9.7, 9.8_

  - [ ]* 17.5 Write property test for result consistency
    - **Property 28: Result Consistency** - Calculated results match database state
    - **Validates: Requirements 9.1, 9.7**
    - Test that calculateElectionResults returns accurate aggregations


- [ ] 18. Notification System
  - [ ] 18.1 Create NotificationCenter component
    - Create src/components/notifications/NotificationCenter.tsx
    - Fetch user notifications from notifications table
    - Subscribe to real-time notification updates via Supabase Realtime
    - Display notifications in dropdown menu with icons based on type
    - Implement mark as read functionality
    - Display unread count badge on notification bell icon
    - Implement notification actions (view election, view details)
    - Auto-dismiss transient notifications after 5 seconds
    - Style with Tailwind CSS and add Framer Motion animations
    - _Requirements: 10.5, 10.6, 10.7, 10.8_

  - [ ] 18.2 Implement notification creation utilities
    - Create src/utils/notifications.ts with createNotification function
    - Support all notification types (election_published, election_starting, election_ending, vote_confirmed, registration_approved, creator_request_approved, security_alert)
    - Insert notification record with user_id, type, title, message, data
    - Set read to false by default
    - Return notification ID
    - _Requirements: 10.8, 10.9_

  - [ ] 18.3 Integrate notifications into key user flows
    - Add notification creation after voter registration
    - Add notification creation after vote casting
    - Add notification creation after creator request approval/rejection
    - Add notification creation after election status changes
    - Add notification creation for security alerts
    - _Requirements: 7.10, 8.9, 3.5, 3.6, 6.4, 6.5, 16.5_

  - [ ] 18.4 Create toast notification system
    - Create src/components/notifications/ToastNotification.tsx
    - Use react-hot-toast for toast notifications
    - Implement success, error, warning, and info toast types
    - Style toasts with black/gold theme
    - Add icons for each toast type
    - Configure toast position and duration
    - _Requirements: 20.6, 20.14_

- [ ] 19. Dashboard Implementation
  - [ ] 19.1 Create VoterDashboard component
    - Create src/pages/voter/VoterDashboard.tsx
    - Fetch active elections available for registration
    - Fetch elections user is registered for
    - Fetch user's voting history
    - Fetch user notifications
    - Display active elections section with "Join" buttons
    - Display registered elections section with voting status and "Vote" buttons
    - Display completed elections section with "View Results" buttons
    - Display notifications panel
    - Display election countdowns with real-time updates
    - Add quick action cards for common tasks
    - Style with Tailwind CSS and add Framer Motion animations
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.9, 20.13_

  - [ ] 19.2 Create CreatorDashboard component
    - Create src/pages/creator/CreatorDashboard.tsx
    - Fetch all elections created by user
    - Organize elections by status (draft, published, active, completed)
    - Calculate creator analytics (total elections, total voters, active elections, avg turnout)
    - Display recent activity (voter registrations, votes cast)
    - Display draft elections with "Edit" and "Publish" buttons
    - Display active elections with "View Analytics" buttons
    - Display completed elections with "View Results" and "Export" buttons
    - Add "Create New Election" button
    - Style with Tailwind CSS and add Framer Motion animations
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.9_

  - [ ] 19.3 Implement creator analytics page
    - Create src/pages/creator/ElectionAnalyticsPage.tsx
    - Fetch election details and statistics
    - Display voter registration trends over time (line chart)
    - Display vote distribution (bar chart and pie chart)
    - Display turnout statistics
    - Display list of registered voters (without vote details)
    - Display voting timeline
    - Add export button for results and voter list
    - Style with Recharts and Tailwind CSS
    - _Requirements: 12.5, 12.6, 12.7, 12.8, 12.10_

  - [ ] 19.4 Create AdminDashboard component
    - Create src/pages/admin/AdminDashboard.tsx
    - Fetch system statistics (total users, total elections, total votes, active elections, users online, votes today)
    - Display pending creator requests with approve/reject actions
    - Display recent security alerts with severity indicators
    - Display recent audit log entries
    - Display live activity feed with real-time updates
    - Add quick action cards for user management, election oversight, audit logs
    - Style with Tailwind CSS and add Framer Motion animations
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.10_


- [ ] 20. Administrative User Management
  - [ ] 20.1 Create user management page
    - Create src/pages/admin/UserManagementPage.tsx
    - Fetch all user profiles with roles and status
    - Display users in table with columns: username, email, role, status, registration date
    - Implement search by username or email
    - Implement filter by role (voter, creator, admin)
    - Implement filter by status (active, suspended)
    - Add actions: view details, suspend/unsuspend, change role, delete
    - Display user statistics (total users, active users, users by role)
    - Implement pagination for large user lists
    - _Requirements: 13.1, 13.2, 13.10_

  - [ ] 20.2 Implement user suspension functionality
    - Create src/utils/adminActions.ts with suspendUser and unsuspendUser functions
    - Update user profile is_suspended field
    - Terminate all active sessions for suspended user
    - Create audit log entry for user_suspended or user_unsuspended
    - Display confirmation dialog before suspension
    - Show success message after action
    - _Requirements: 13.3, 13.4, 13.5, 13.7_

  - [ ] 20.3 Implement role change functionality
    - Add changeUserRole function to adminActions.ts
    - Update user profile role field
    - Validate new role is one of: voter, creator, admin
    - Create audit log entry for role change
    - Display confirmation dialog before role change
    - Show success message after action
    - _Requirements: 13.6, 13.7_

  - [ ] 20.4 Implement user deletion functionality
    - Add deleteUser function to adminActions.ts
    - Delete user profile and associated data (except audit logs and anonymized votes)
    - Delete user from auth.users table
    - Create audit log entry for user_deleted
    - Display confirmation dialog with warning before deletion
    - Show success message after action
    - _Requirements: 13.8, 13.9_

  - [ ] 20.5 Create creator request management interface
    - Create src/pages/admin/CreatorRequestsPage.tsx
    - Fetch all pending creator requests
    - Display requests with user information and reason
    - Add approve and reject actions with reason input for rejection
    - Update request status and user role on approval
    - Send notification to user on approval or rejection
    - Create audit log entry for request status change
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.8_

- [ ] 21. Administrative Election Oversight
  - [ ] 21.1 Create election oversight page
    - Create src/pages/admin/ElectionOversightPage.tsx
    - Fetch all elections regardless of creator
    - Display elections in table with columns: title, creator, status, dates, voters, votes
    - Implement search by title
    - Implement filter by status and category
    - Add actions: view details, cancel, delete, modify settings, lock/unlock voter list
    - Display election statistics (total elections, active elections, total votes)
    - _Requirements: 14.1, 14.2, 14.8_

  - [ ] 21.2 Implement election cancellation functionality
    - Add cancelElection function to adminActions.ts
    - Update election status to 'cancelled'
    - Require cancellation reason input
    - Send notifications to all registered voters
    - Create audit log entry for election_cancelled
    - Display confirmation dialog before cancellation
    - _Requirements: 14.3, 14.4, 6.9_

  - [ ] 21.3 Implement election deletion functionality
    - Add deleteElection function to adminActions.ts (admin version)
    - Delete election and cascade delete candidates, registrations, votes
    - Delete associated files from storage
    - Create audit log entry for election_deleted
    - Display confirmation dialog with warning before deletion
    - _Requirements: 14.5_

  - [ ] 21.4 Implement election settings modification
    - Add updateElectionSettings function to adminActions.ts
    - Allow admins to modify dates, max_voters, and configuration options
    - Validate new settings (dates, constraints)
    - Create audit log entry for election_updated
    - Display form with current settings
    - _Requirements: 14.6_

  - [ ] 21.5 Implement voter list lock/unlock functionality
    - Add lockVoterList and unlockVoterList functions to adminActions.ts
    - Update election voter_list_locked field
    - Create audit log entry
    - Display confirmation dialog
    - _Requirements: 14.7, 30.5, 30.6, 30.7_


- [ ] 22. Audit Logging and Security Monitoring
  - [ ] 22.1 Create audit log viewing page
    - Create src/pages/admin/AuditLogsPage.tsx
    - Fetch audit logs with pagination
    - Display logs in table with columns: timestamp, user, action, entity_type, entity_id, details
    - Implement search by user, action, entity_type
    - Implement filter by date range
    - Implement filter by action type
    - Display log details in expandable rows
    - Add export functionality (CSV, JSON)
    - _Requirements: 15.9, 15.10, 28.3_

  - [ ] 22.2 Implement audit log creation utilities
    - Create src/utils/auditLog.ts with insertAuditLog function
    - Support all audit action types
    - Capture user_id, action, entity_type, entity_id, details, ip_address, user_agent
    - Insert immutable audit log record
    - Handle errors gracefully
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [ ] 22.3 Create security monitoring page
    - Create src/pages/admin/SecurityMonitoringPage.tsx
    - Fetch security logs with pagination
    - Display logs in table with columns: timestamp, event_type, severity, description, user, election
    - Implement filter by event_type and severity
    - Implement filter by date range
    - Display high/critical severity alerts prominently
    - Add real-time updates for new security events
    - Display security statistics and trends
    - _Requirements: 16.8, 16.9, 29.5_

  - [ ] 22.4 Implement security log creation utilities
    - Create src/utils/securityLog.ts with insertSecurityLog function
    - Support all security event types
    - Capture event_type, severity, user_id, election_id, description, metadata, ip_address, user_agent
    - Insert immutable security log record
    - Send admin notifications for high/critical severity events
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

  - [ ] 22.5 Integrate audit logging into all critical operations
    - Add audit log entries for all authentication events
    - Add audit log entries for all election operations
    - Add audit log entries for all voting events
    - Add audit log entries for all administrative actions
    - Ensure audit logs capture sufficient context for investigation
    - _Requirements: 15.2, 15.3, 15.4, 15.5_

  - [ ]* 22.6 Write property test for audit log immutability
    - **Property 21: Audit Log Immutability** - Logs cannot be updated or deleted
    - **Validates: Requirements 15.8, 16.7**
    - Test that audit and security logs are immutable

- [ ] 23. Edge Function for Election Status Updates
  - [ ] 23.1 Create update-election-status edge function
    - Create supabase/functions/update-election-status/index.ts
    - Fetch elections with status 'published' and start_date <= now
    - Update status to 'active' for matching elections
    - Send notifications to creator and registered voters
    - Create audit log entries
    - Fetch elections with status 'active' and end_date <= now
    - Update status to 'completed' for matching elections
    - Send notifications to creator and registered voters
    - Create audit log entries
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ] 23.2 Configure scheduled execution for status updates
    - Set up Supabase cron job to run update-election-status every 1 minute
    - Configure edge function environment variables
    - Test scheduled execution with sample elections
    - Monitor execution logs for errors
    - _Requirements: 6.2, 6.3_

- [ ] 24. Voter List Management for Creators
  - [ ] 24.1 Create voter list management page
    - Create src/pages/creator/VoterListPage.tsx
    - Fetch all voter registrations for creator's election
    - Display voters in table with columns: username, email, status, registration date
    - Display counts: registered, waitlist, available spots
    - Implement approve action for waitlist voters
    - Implement reject action with reason input
    - Implement lock/unlock voter list toggle
    - Send notifications on approval or rejection
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7, 30.8, 30.9, 30.10_

  - [ ] 24.2 Implement waitlist approval functionality
    - Create src/utils/voterListActions.ts with approveFromWaitlist function
    - Update voter registration status from 'waitlist' to 'registered'
    - Increment election current_voters count
    - Send notification to voter
    - Create audit log entry
    - _Requirements: 30.3, 30.9_

  - [ ] 24.3 Implement registration rejection functionality
    - Add rejectRegistration function to voterListActions.ts
    - Update voter registration status to 'rejected'
    - Store rejection reason
    - Send notification to voter with reason
    - Create audit log entry
    - _Requirements: 30.4, 30.10_

