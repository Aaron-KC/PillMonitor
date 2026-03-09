export type RootStackParamList = {
  Login:    undefined;
  MainTabs: undefined;
  AddPill:  undefined;
};

export type TabParamList = {
  Dashboard: undefined;
};

export type Medicine = {
  id: string;
  name: string;
  dosage: string;
  stock: { total: number; remaining: number };
  schedule: string[];
  startDate: string;
  createdAt: string;
};