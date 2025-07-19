export interface IUser {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  createdAt?: Date;
  updatedAt?: Date;
}