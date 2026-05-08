
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ShadowSafeProvider } from "@/contexts/ShadowSafeContext";
import Index from "./pages/Index";
import DiagnosticTest from "./pages/DiagnosticTest";

import NotFound from "./pages/NotFound";
import VerificationHandler from "./components/VerificationHandler";
import ConstantContactCallback from "./pages/ConstantContactCallback";
import { ConstantContactSettings } from "./components/Admin/ConstantContactSettings";
import { VerifyEmail } from "./pages/VerifyEmail";
import { PlaylistPage } from "./components/Favorites/PlaylistPage";
import ManifestationHub from "./pages/ManifestationHub";
import { MyJournalPage } from "./components/MyJournal/MyJournalPage";
import StackCommunityPage from "./pages/StackCommunityPage";
import DailyRealm from "./pages/DailyRealm";
import AchievementsPage from "./pages/AchievementsPage";
import CustomMeditationPage from "./pages/CustomMeditationPage";
import { ModerationDashboard } from "./components/Admin/ModerationDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ContactUs from "./pages/ContactUs";
import HelpCenter from "./pages/HelpCenter";
import AgentDashboardPage from "./pages/AgentDashboard";
import SupportAnalyticsDashboard from "./components/Support/SupportAnalyticsDashboard";
import AITrainingInterface from "./components/Support/AITrainingInterface";
import SecretVault from "./pages/SecretVault";
import SecurityDashboard from "./pages/SecurityDashboard";
import DailyRitualPage from "./pages/DailyRitualPage";
import WhatLivesHere from "./pages/WhatLivesHere";
import OAuthTestPage from "./pages/OAuthTestPage";
import ForbiddenProgram from "./pages/ForbiddenProgram";

const queryClient = new QueryClient();

const App = () => (

  <ThemeProvider defaultTheme="dark">

    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShadowSafeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter >
              <Routes>
                <Route path="/test" element={<DiagnosticTest />} />
                <Route path="/" element={<Index />} />
                <Route path="/verify" element={<ConstantContactCallback />} />
                <Route path="/email-verify" element={<VerificationHandler />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/admin/constant-contact" element={<ConstantContactSettings />} />
                <Route path="/playlist" element={<PlaylistPage />} />
                <Route path="/manifestation" element={<ManifestationHub />} />
                <Route path="/journal" element={<MyJournalPage />} />
                <Route path="/stacks" element={<StackCommunityPage />} />
                <Route path="/daily-realm" element={<DailyRealm />} />
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="/custom-meditation" element={<CustomMeditationPage />} />
                <Route path="/admin/moderation" element={<ModerationDashboard />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/admin/agent-dashboard" element={<AgentDashboardPage />} />
                <Route path="/admin/support-analytics" element={<SupportAnalyticsDashboard />} />
                <Route path="/admin/ai-training" element={<AITrainingInterface />} />
                <Route path="/vault" element={<SecretVault />} />
                <Route path="/admin/security" element={<SecurityDashboard />} />
                <Route path="/daily-ritual" element={<DailyRitualPage />} />
                <Route path="/what-lives-here" element={<WhatLivesHere />} />
                <Route path="/oauth-test" element={<OAuthTestPage />} />
                <Route path="/forbidden-program" element={<ForbiddenProgram />} />
                <Route path="*" element={<NotFound />} />

              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ShadowSafeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
