export type User = {
  email: string;
  id: string;
};

export type Session = {
  token: string;
  user: User;
};
