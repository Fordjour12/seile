import { api } from "@/lib/backend-api";

type PlannerApiShape = {
  "planner/queries": {
    getPlannerDashboard: any;
    getPlannerChatHome: any;
    listPlannerChatMessages: any;
    listPlannerChatThreads: any;
    getPlannerChatThread: any;
    listPlans: any;
    getPlanById: any;
  };
  "planner/actions": {
    sendPlannerChatMessage: any;
    replanWeeklyPlan: any;
    reviewWeeklyPlan: any;
  };
  "planner/mutations": {
    upsertPlannerProfile: any;
    createPlanningGoal: any;
    setAgentEnabled: any;
    setPlanItemStatus: any;
  };
};

export const plannerApi = api as unknown as PlannerApiShape;
