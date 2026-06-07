export interface PwaTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface PwaNote {
  id: string;
  title: string;
  content: string;
  tag: string;
  color: string;
  updatedAt: number;
}

export interface StorageStats {
  used: number; // in bytes
  total: number; // in bytes
  percentage: number;
}

export interface InstallationGuide {
  browser: string;
  system: string;
  steps: string[];
}
