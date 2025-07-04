import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import CreatePoll from "@/pages/create-poll";
import ManagePolls from "@/pages/manage-polls";
import PollDisplay from "@/pages/poll-display";
import JoinPoll from "@/pages/join-poll";
import PollParticipation from "@/pages/poll-participation";
import PollResults from "@/pages/poll-results";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreatePoll} />
      <Route path="/manage" component={ManagePolls} />
      <Route path="/poll/:id/display" component={PollDisplay} />
      <Route path="/join" component={JoinPoll} />
      <Route path="/poll/:code/participate" component={PollParticipation} />
      <Route path="/poll/:id/results" component={PollResults} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
