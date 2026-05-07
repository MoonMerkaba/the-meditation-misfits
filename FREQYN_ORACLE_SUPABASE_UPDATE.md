# Freqyn Oracle Supabase Function Update Guide

## Important Clarification
The `freqyn-oracle` function is hosted on **Supabase**, not Cloudflare Workers.

**Endpoint:** `https://pjqkrfaauevhqrbvvmxn.supabase.co/functions/v1/freqyn-oracle`

## Problem
The Freqyn Oracle system prompt needs to be updated to generate Soundicine links with the correct domain.

**Current (WRONG):**
```
https://neurofreqfix.misfitoria/freq?goal=...
```

**Correct (REQUIRED):**
```
https://app.samanthabushika.com/freq?goal=...
```

## Solution

### Manual Update via Supabase Dashboard

Since automated deployment is encountering issues, please update manually:

1. **Access Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to Edge Functions → freqyn-oracle

2. **Update the SYSTEM_PROMPT**
   - Find the `SYSTEM_PROMPT` constant
   - Add this section after the "Knowledge Base" section:

```typescript
💠 Soundicine Link Generation:
When recommending a custom frequency mix, generate a Soundicine link using this EXACT format:
https://app.samanthabushika.com/freq?goal=[goal]&minutes=[duration]&beatStart=[start]&beatEnd=[end]&isoHz=[frequency]&noise=[type]&strength=[0-1]

Parameters:
- goal: Short descriptor (e.g., "focus", "anxiety-relief", "heart-repair")
- minutes: Session duration (5-60)
- beatStart: Starting binaural beat Hz (0.5-40)
- beatEnd: Ending binaural beat Hz (0.5-40)
- isoHz: Isochronic/solfeggio frequency (174, 285, 396, 417, 528, 639, 741, 852, 963, or custom)
- noise: Background type (pink, brown, white, or none)
- strength: Mix intensity 0.0-1.0

Example: "Try this custom mix for deep focus: https://app.samanthabushika.com/freq?goal=deep-focus&minutes=20&beatStart=8.0&beatEnd=12.0&isoHz=528&noise=pink&strength=0.75"
```

3. **Update the Forbidden section**
   - Add this line at the end:
   ```
   - NEVER use old domain formats (neurofreqfix.misfitoria) — ALWAYS use app.samanthabushika.com/freq
   ```

4. **Deploy**
   - Save the changes
   - Deploy the updated function

## Frontend (Already Completed ✅)

The frontend has been updated with:
- **SoundicineLinkButton component**: Renders Soundicine links as beautiful gradient buttons
- **soundicineParser utility**: Detects and fixes incorrect URLs automatically
- **FreqynOracle integration**: Automatically converts Soundicine URLs to clickable buttons
- **Domain correction**: Any old URLs are automatically corrected to use app.samanthabushika.com

## Testing

After updating the Supabase function:

1. Open Freqyn Oracle in the app
2. Ask: "I need help focusing"
3. Verify Freqyn generates a link like:
   ```
   https://app.samanthabushika.com/freq?goal=focus&minutes=20&beatStart=8.0&beatEnd=12.0&isoHz=528&noise=pink&strength=0.75
   ```
4. Confirm the link appears as a clickable button (not raw text)
5. Click the button to ensure the player opens correctly

## File Location

The function source code is located at:
```
supabase/functions/freqyn-oracle/index.ts
```

This file has been updated with the correct system prompt, but needs to be deployed via the Supabase dashboard or CLI.
