# Chat Attachments Storage Setup

## Manual Bucket Creation Required

The `chat-attachments` storage bucket must be created manually in the Supabase dashboard due to service key limitations.

### Steps to Create the Bucket:

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click on "New Bucket" button

3. **Create the Bucket**
   - **Name**: `chat-attachments`
   - **Public**: `false` (IMPORTANT: Must be private)
   - Click "Create Bucket"

4. **Verify RLS Policies**
   - The RLS policies have already been created via SQL
   - They allow:
     - Users to upload files to their own folder (userId/conversationId/filename)
     - Users to read their own files
     - Users to delete their own files
     - Agents to read all files for support purposes

## File Upload Configuration

### Supported File Types:
- **Images**: JPG, JPEG, PNG, GIF
- **Documents**: PDF, DOCX, TXT

### File Size Limit:
- Maximum: 10MB per file

### Path Structure:
Files are organized as: `{userId}/{conversationId}/{timestamp}-{filename}`

## Features Implemented:

✅ File type validation (images and documents only)
✅ File size validation (10MB max)
✅ Signed URLs for private bucket access (1 hour expiry)
✅ Image preview in chat messages
✅ Document icons for different file types
✅ Download functionality for all attachments
✅ Automatic file cleanup (90 days retention via scheduled function)
✅ RLS policies for secure access control

## Components Updated:

1. **FileUploadButton.tsx**
   - Uses signed URLs for private bucket access
   - Validates file type and size
   - Uploads to proper path structure

2. **ChatAttachment.tsx** (NEW)
   - Displays image previews
   - Shows appropriate icons for document types
   - Provides download functionality

3. **ChatWidget.tsx**
   - Integrates file upload button
   - Displays attachments in messages
   - Passes conversationId to upload component

## Security Features:

- Private bucket (not publicly accessible)
- Signed URLs with 1-hour expiration
- RLS policies restrict access to file owners and agents
- File type whitelist prevents malicious uploads
- Size limit prevents storage abuse

## Next Steps After Bucket Creation:

Once the bucket is created in Supabase dashboard:
1. Test file upload in the chat widget
2. Verify image previews display correctly
3. Test download functionality
4. Confirm agents can access all attachments
5. Verify automatic cleanup runs (check logs after 90 days)
