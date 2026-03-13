export interface MedicationSchedule {
  hour: number;
  minute: number;
  formatted: string;
}

export interface MedicationStock {
  total: number;
  remaining: number;
}

export interface Medicine {
  id: string;
  name: string;
  stock: MedicationStock;
  schedule: MedicationSchedule[];
  startDate: any;
  isActive: boolean;
  createdAt: any;
}

export interface MedicationData {
  name: string;
  totalStock: number;
  startDate: Date;
  isFromToday: boolean;
  schedule: MedicationSchedule[];
}

export interface DeviceStatus {
  lastSync: string;
  isDoorOpen: boolean;
  battery: number;
  patientName: string;
}

export type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  AddPill: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;