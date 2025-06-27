import { User } from '@src/interfaces/users';

export const Users: User[] = [
  { id: 'id#1', username: 'admin_123', password: 'Admin@123' },
  { id: 'id#2', username: 'Test_123', password: 'Admin@123' },
  { id: 'id#3', username: 'XYZ_123', password: 'Admin@123' },
  { id: 'id#4', username: 'abc_123', password: 'Admin@123' },
  { id: 'id#5', username: 'user_123', password: 'Admin@123' },
  { id: 'id#6', username: 'username_123', password: 'Admin@123' },
  { id: 'id#7', username: 'Test', password: 'Admin@123' },
  {
    id: 'id#8',
    username: '__shreya',
    password: '$2b$10$FLcu35Vn2EdWcR5TuP8AMeCza8RFJT/Be4LHhj/h4wBUyAu8Iax2a',
  },
  { id: 'id#9', username: 'admin#_123', password: 'Admin@123' },
];

export const jwtConstants = {
  secret: 'yourSecretKey',
};
