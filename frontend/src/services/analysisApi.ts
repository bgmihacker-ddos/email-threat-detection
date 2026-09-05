export const analyzeEmail = async (_content: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve('demo-phishing-001'), 2000);
  });
};
