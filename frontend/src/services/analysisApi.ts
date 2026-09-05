
export const analyzeEmail = async (content: string, file?: File): Promise<any> => {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  } else {
    formData.append('raw_content', content);
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/analyze`, {
      method: 'POST',
      body: formData
  });

  if (!response.ok) {
     throw new Error('Analysis failed');
  }

  return response.json();
};

export const getAnalysisById = async (id: string): Promise<any> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/analyze/${id}`);
  if (!response.ok) {
     throw new Error('Failed to fetch analysis');
  }
  return response.json();
};
