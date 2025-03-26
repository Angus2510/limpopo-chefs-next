export const generateRandomPassword = () => {
  const length = 6;
  const charset = "0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export const isPasswordValid = (generatedAt: Date | null): boolean => {
  if (!generatedAt) return false;
  const now = new Date();
  const diffInMinutes = (now.getTime() - generatedAt.getTime()) / (1000 * 60);
  return diffInMinutes <= 20;
};
