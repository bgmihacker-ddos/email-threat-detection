import { Threat } from '../types/threats';
import { demoThreats } from '../data/demoThreats';

export const getThreats = async (): Promise<Threat[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(demoThreats), 500);
  });
};

export const getThreatById = async (id: string): Promise<Threat | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(demoThreats.find(t => t.id === id)), 300);
  });
};
