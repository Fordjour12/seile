import { api } from "@/lib/backend-api";

type PlannerApiShape = {
  "productivity/planner/queries": {
    getPlannerDashboard: any;
    getPlannerChatHome: any;
    listPlannerChatMessages: any;
    listPlannerChatThreads: any;
    getPlannerChatThread: any;
    listPlans: any;
    getPlanById: any;
  };
  "productivity/planner/actions": {
    sendPlannerChatMessage: any;
    replanWeeklyPlan: any;
    reviewWeeklyPlan: any;
  };
  "productivity/planner/mutations": {
    upsertPlannerProfile: any;
    createPlanningGoal: any;
    setAgentEnabled: any;
    setPlanItemStatus: any;
  };
};

export const plannerApi = api as unknown as PlannerApiShape;
